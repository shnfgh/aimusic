import React from 'react';
import { getAudioEngine } from '../../audio/AudioEngine';

interface PlayerBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ isPlaying, currentTime, duration, onPlay, onPause, onSeek }) => {
  const engine = getAudioEngine();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  return (
    <div className="h-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center px-4 gap-4">
      {/* Transport Controls */}
      <div className="flex items-center gap-2">
        {/* Skip Back */}
        <button
          onClick={() => onSeek(0)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          ⏮
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => onSeek(duration)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          ⏭
        </button>
      </div>

      {/* Time */}
      <span className="text-xs font-mono text-[var(--text-muted)] w-12 text-right">
        {formatTime(currentTime)}
      </span>

      {/* Seek Bar */}
      <div className="flex-1 flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
        />
      </div>

      {/* Duration */}
      <span className="text-xs font-mono text-[var(--text-muted)] w-12">
        {formatTime(duration)}
      </span>

      {/* Master Volume */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.8}
          onChange={(e) => engine.setVolume(Number(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
};
