import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import PhonePreview from '../src/components/PhonePreview.jsx';

const scheduleMessages = (messages) => {
  let cursor = 0;
  return messages.map((message, index) => {
    const duration = message.message_type === 'typing'
      ? Number(message.duration_ms) || 1000
      : Number(message.appearance_ms) || 1400;
    const scheduled = { ...message, id: message.id || `video-message-${index}`, startMs: cursor, durationMs: duration };
    cursor += duration;
    return scheduled;
  });
};

export const StoryChatComposition = ({
  conversation = {}, participants = [], messages = [], subtitle = false,
  includeSounds = false, ultraRealistic = true, messengerAppearance = 'light', exportMode = 'messenger-fullscreen',
  publicBaseUrl = 'http://localhost:4000',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsedMs = frame * 1000 / fps;
  const schedule = useMemo(() => scheduleMessages(messages), [messages]);
  const timeline = useMemo(() => schedule.map(message => ({
    ...message,
    appearance_ms: message.durationMs,
  })), [schedule]);
  const soundSchedule = useMemo(() => schedule.filter(item => item.message_type !== 'typing'), [schedule]);
  const subtitleSchedule = useMemo(() => schedule.filter(item => item.sender === 'b' && item.content), [schedule]);
  let subtitleIndex = -1;
  for (let low = 0, high = subtitleSchedule.length; low < high;) {
    const middle = Math.floor((low + high) / 2);
    if (subtitleSchedule[middle].startMs <= elapsedMs) {
      subtitleIndex = middle;
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const isRecording = exportMode === 'screen-recording';
  return <AbsoluteFill className="remotion-stage" style={{ background: '#fff' }}>
    {includeSounds && soundSchedule.map((item, index) => (
      <Sequence key={`tone-${item.id}`} from={Math.round(item.startMs * fps / 1000)} durationInFrames={8}>
        <Audio src={staticFile('message-tone.wav')} volume={0.14} />
      </Sequence>
    ))}
    <PhonePreview
      participants={participants}
      messages={timeline}
      visibleCount={messages.length}
      theme={conversation.theme || 'messenger'}
      messengerAppearance={messengerAppearance}
      ultraRealistic={ultraRealistic}
      renderAtMs={elapsedMs}
      renderMode={exportMode}
      publicBaseUrl={publicBaseUrl}
      deterministic
      shake={isRecording ? frame : 0}
    />
    {subtitle && <div className="remotion-subtitle">{subtitleSchedule[subtitleIndex]?.content}</div>}
  </AbsoluteFill>;
};

export const StoryChatRoot = () => <Composition
  id="StoryChatVertical"
  component={StoryChatComposition}
  width={1080}
  height={1920}
  fps={30}
  durationInFrames={900}
  calculateMetadata={({ props }) => ({
    durationInFrames: Math.max(30, scheduleMessages(props.messages || []).reduce((sum, item) => sum + Math.ceil(item.durationMs * 30 / 1000), 30) + 30),
  })}
  defaultProps={{ conversation: {}, participants: [], messages: [], subtitle: false, ultraRealistic: true, messengerAppearance: 'light', exportMode: 'messenger-fullscreen' }}
/>;
