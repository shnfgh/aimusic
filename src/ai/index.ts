// ==========================================
// AI Provider Registry
// ==========================================

export { MusicGenerationProvider } from './MusicGenerationProvider';
export { MockMusicProvider } from './MockMusicProvider';

// Future providers:
// export { RemoteMusicProvider } from './RemoteMusicProvider';
// export { LocalMusicProvider } from './LocalMusicProvider';

import { MusicGenerationProvider } from './MusicGenerationProvider';
import { MockMusicProvider } from './MockMusicProvider';

/**
 * Get the default AI provider.
 * In production, this could be configured via environment or user settings.
 */
export function getDefaultProvider(): MusicGenerationProvider {
  return new MockMusicProvider();
}
