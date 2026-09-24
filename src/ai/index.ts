// ==========================================
// AI Provider Registry
// ==========================================

export { MusicGenerationProvider } from './MusicGenerationProvider';
export { MockMusicProvider } from './MockMusicProvider';
export { SynthMusicProvider } from './SynthMusicProvider';

// Future providers:
// export { RemoteMusicProvider } from './RemoteMusicProvider';
// export { LocalMusicProvider } from './LocalMusicProvider';

import { MusicGenerationProvider } from './MusicGenerationProvider';
import { SynthMusicProvider } from './SynthMusicProvider';

/**
 * Get the default AI provider.
 * Uses SynthMusicProvider for real audio generation.
 */
export function getDefaultProvider(): MusicGenerationProvider {
  return new SynthMusicProvider();
}
