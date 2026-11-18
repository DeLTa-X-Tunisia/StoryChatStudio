import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const entryPoint = path.join(root, 'frontend/remotion/index.jsx');
const outputDir = path.join(root, 'exports');
const bundleDir = path.join(root, 'backend/.cache/remotion-bundle');
const jobs = new Map();
const renderWaiters = [];
let activeRenders = 0;
const maxActiveRenders = Math.max(1, Number(process.env.REMOTION_MAX_JOBS) || 1);
let serveUrlPromise;
const preset = { width: 1080, height: 1920, fps: 30 };

async function acquireRenderSlot() {
  if (activeRenders < maxActiveRenders) {
    activeRenders += 1;
    return;
  }
  await new Promise(resolve => renderWaiters.push(resolve));
}

function releaseRenderSlot() {
  const next = renderWaiters.shift();
  if (next) next();
  else activeRenders -= 1;
}

function resolveExecutable(binaryName) {
  try {
    const command = process.platform === 'win32' ? 'where' : 'which';
    const result = execFileSync(command, [binaryName], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return result.trim().split(/\r?\n/)[0] || null;
  } catch {
    return null;
  }
}

async function getServeUrl() {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint,
      rootDir: path.join(root, 'frontend'),
      publicDir: path.join(root, 'frontend/public'),
      outDir: bundleDir,
    }).catch(error => {
      serveUrlPromise = null;
      throw error;
    });
  }
  return serveUrlPromise;
}

export function getExportJob(id) { return jobs.get(id) || null; }

export function startExportJob(data) {
  const id = randomUUID();
  const filename = `storychat-${id}.mp4`;
  const outputLocation = path.join(outputDir, filename);
  const job = {
    id,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    url: null,
    error: null,
    timings: { bundleMs: null, bundleReused: false, compositionMs: null, renderMs: null, framesMs: null, ffmpegStageMs: null, queueMs: null, totalMs: null },
  };
  jobs.set(id, job);

  void (async () => {
    const totalStart = performance.now();
    try {
      await fs.mkdir(outputDir, { recursive: true });
      job.status = 'bundling';
      const bundleReused = Boolean(serveUrlPromise);
      const bundleStart = performance.now();
      const serveUrl = await getServeUrl();
      job.timings.bundleMs = Math.round(performance.now() - bundleStart);
      job.timings.bundleReused = bundleReused;
      const fps = preset.fps;
      const gap = Math.max(0, Number(data.defaultDelayMs) || 1400);
      const messages = (data.messages || []).map((m) => ({
        ...m,
        image: m.image?.startsWith('/uploads/') ? `${data.publicBaseUrl || 'http://localhost:4000'}${m.image}` : m.image || '',
        appearance_ms: Number(m.appearance_ms) || gap,
        duration_ms: Number(m.duration_ms) || 1000,
      }));
      const totalDurationMs = messages.reduce((sum, m) => sum + Math.max(1000, Number(m.message_type === 'typing' ? m.duration_ms : m.appearance_ms) || 1000), 0);
      const durationInFrames = Math.max(fps * 2, Math.ceil((totalDurationMs / 1000) * fps) + fps);
      const inputProps = {
        conversation: data.conversation || {},
        participants: data.participants || [],
        messages,
        subtitle: Boolean(data.subtitle),
        includeSounds: Boolean(data.includeSounds),
        ultraRealistic: data.ultraRealistic !== false,
        messengerAppearance: data.messengerAppearance || 'light',
        googleSearchAppearance: data.googleSearchAppearance === 'dark' ? 'dark' : 'light',
        exportMode: data.exportMode || (data.screenRecording ? 'screen-recording' : 'messenger-fullscreen'),
        publicBaseUrl: data.publicBaseUrl || 'http://localhost:4000',
      };
      const compositionStart = performance.now();
      const composition = await selectComposition({ serveUrl, id: 'StoryChatVertical', inputProps });
      job.timings.compositionMs = Math.round(performance.now() - compositionStart);
      job.status = 'queued';
      const renderConcurrency = (() => {
        const raw = String(process.env.REMOTION_CONCURRENCY || '35%');
        return raw.endsWith('%') ? raw : Math.max(1, Math.min(8, Number(raw) || 2));
      })();
      const queueStart = performance.now();
      await acquireRenderSlot();
      job.timings.queueMs = Math.round(performance.now() - queueStart);
      job.status = 'rendering';
      const renderStart = performance.now();
      try {
        await renderMedia({
          serveUrl,
          composition: { ...composition, ...preset, durationInFrames },
          codec: 'h264',
          audioCodec: 'aac',
          pixelFormat: 'yuv420p',
          outputLocation,
          inputProps,
          concurrency: renderConcurrency,
          ffmpegExecutable: resolveExecutable('ffmpeg') || undefined,
          onProgress: ({ progress, renderedDoneIn, encodedDoneIn }) => {
            job.progress = Math.round(progress * 100);
            if (renderedDoneIn !== null) job.timings.framesMs = renderedDoneIn;
            if (encodedDoneIn !== null) job.timings.ffmpegStageMs = encodedDoneIn;
          },
        });
      } finally {
        job.timings.renderMs = Math.round(performance.now() - renderStart);
        releaseRenderSlot();
      }
      job.status = 'completed';
      job.progress = 100;
      job.url = `/exports/${filename}`;
      job.completedAt = new Date().toISOString();
      job.timings.totalMs = Math.round(performance.now() - totalStart);
    } catch (error) {
      await fs.rm(outputLocation, { force: true }).catch(cleanupError => {
        console.error('Unable to remove incomplete Remotion output:', cleanupError);
      });
      job.status = 'failed';
      job.error = error.message;
      job.timings.totalMs = Math.round(performance.now() - totalStart);
      console.error('Remotion render failed:', error);
    }
  })();

  return job;
}
