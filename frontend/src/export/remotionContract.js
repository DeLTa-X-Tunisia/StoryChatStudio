// Contrat des rendus verticaux à implémenter avec Remotion/FFmpeg.
export const EXPORT_PRESETS = {
  tiktok: { label: 'TikTok', width: 1080, height: 1920, fps: 30, videoCodec: 'h264', pixelFormat: 'yuv420p', audioCodec: 'aac' },
  youtubeShorts: { label: 'YouTube Shorts', width: 1080, height: 1920, fps: 30, videoCodec: 'h264', pixelFormat: 'yuv420p', audioCodec: 'aac' },
  instagramReels: { label: 'Instagram Reels', width: 1080, height: 1920, fps: 30, videoCodec: 'h264', pixelFormat: 'yuv420p', audioCodec: 'aac' },
  facebookReels: { label: 'Facebook Reels', width: 1080, height: 1920, fps: 30, videoCodec: 'h264', pixelFormat: 'yuv420p', audioCodec: 'aac' }
};
export const toRemotionProps = ({ conversation, messages, preset = 'tiktok', messageDelayMs = 1400 }) => ({
  compositionId: 'StoryChatVertical',
  preset: EXPORT_PRESETS[preset],
  durationInFrames: Math.max(1, messages.length) * Math.ceil(messageDelayMs / 1000 * EXPORT_PRESETS[preset].fps),
  conversation,
  messages,
  narration: { enabled: false, voice: 'female', provider: null }
});
