// Contrat commun pour Edge TTS, OpenAI TTS et XTTS. Chaque entrée pourra
// produire un fichier audio réutilisable par une piste voiceover Remotion.
export const voiceProviders = {
  edgeTts: { id: 'edgeTts', label: 'Microsoft Edge TTS', configured: Boolean(process.env.EDGE_TTS_URL), synthesize: async () => { throw new Error('Le connecteur Edge TTS sera activé dans une prochaine version.'); } },
  openaiTts: { id: 'openaiTts', label: 'OpenAI TTS', configured: Boolean(process.env.OPENAI_API_KEY), synthesize: async () => { throw new Error('Le connecteur OpenAI TTS sera activé dans une prochaine version.'); } },
  xtts: { id: 'xtts', label: 'XTTS local', configured: Boolean(process.env.XTTS_URL), synthesize: async () => { throw new Error('Le connecteur XTTS sera activé dans une prochaine version.'); } }
};
export const listVoiceProviders = () => Object.values(voiceProviders).map(({id,label,configured})=>({id,label,configured}));
export const VOICEOVER_CONTRACT = { perCharacter: true, audioFormat: 'wav', sampleRate: 48000, providers: Object.keys(voiceProviders) };
