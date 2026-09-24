import React, { useRef, useState } from 'react';
import { Project, Section, Track } from '../../models/types';

interface TimelineProps {
  project: Project;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedSectionId: string | null;
  onSeek: (time: number) => void;
  onSelectSection: (id: string | null) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onTrackVolumeChange: (trackId: string, volume: number) => void;
  onRemoveSection: (id: string) => void;
}

const SECTION_COLORS: Record<string, string> = {
  intro: '#6366f1',
  verse: '#3b82f6',
  'pre-chorus': '#06b6d4',
  chorus: '#8b5cf6',
  bridge: '#ec4899',
  outro: '#f43f5e',
  instrumental: '#10b981',
  breakdown: '#f59e0b',
  drop: '#ef4444',
  solo: '#14b8a6',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const Timeline: React.FC<TimelineProps> = ({
  project, currentTime, duration, isPlaying, selectedSectionId,
  onSeek, onSelectSection, onToggleMute, onToggleSolo, onTrackVolumeChange, onRemoveSection,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const handleClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  const pixelsPerSecond = 4 * zoom;
  const totalWidth = duration * pixelsPerSecond;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="px-2 py-1 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          −
        </button>
        <span className="text-xs text-[var(--text-muted)]">Zoom: {Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="px-2 py-1 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          +
        </button>
      </div>

      {/* Timeline Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track Labels */}
        <div className="w-48 flex-shrink-0 border-r border-[var(--border-color)] overflow-y-auto">
          {/* Section header */}
          <div className="h-8 border-b border-[var(--border-color)] flex items-center px-3">
            <span className="text-xs font-medium text-[var(--text-muted)]">SECTIONS</span>
          </div>
          {/* Track labels */}
          {project.tracks.map((track) => (
            <div key={track.id} className="h-12 border-b border-[var(--border-color)] flex items-center px-2 gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: track.color }} />
              <span className="text-xs font-medium text-[var(--text-primary)] flex-1 truncate">{track.name}</span>
              <button
                onClick={() => onToggleMute(track.id)}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  track.muted ? 'bg-red-900/50 text-red-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                M
              </button>
              <button
                onClick={() => onToggleSolo(track.id)}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  track.solo ? 'bg-yellow-900/50 text-yellow-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                S
              </button>
            </div>
          ))}
        </div>

        {/* Timeline Grid */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-auto relative" onClick={handleClick}>
          <div style={{ width: `${totalWidth}px`, minWidth: '100%' }} className="relative">
            {/* Time Ruler */}
            <div className="h-8 border-b border-[var(--border-color)] relative sticky top-0 bg-[var(--bg-secondary)] z-10">
              {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex flex-col justify-end"
                  style={{ left: `${i * 10 * pixelsPerSecond}px` }}
                >
                  <span className="text-[10px] text-[var(--text-muted)] px-1">{formatTime(i * 10)}</span>
                  <div className="w-px h-2 bg-[var(--border-color)]" />
                </div>
              ))}
            </div>

            {/* Sections Row */}
            <div className="h-8 border-b border-[var(--border-color)] relative">
              {project.sections.map((section) => (
                <div
                  key={section.id}
                  onClick={(e) => { e.stopPropagation(); onSelectSection(section.id === selectedSectionId ? null : section.id); }}
                  className={`absolute top-0 h-full cursor-pointer border-r border-[var(--bg-primary)] flex items-center justify-center text-[10px] font-medium transition-opacity ${
                    selectedSectionId === section.id ? 'ring-1 ring-white/50 z-10' : ''
                  }`}
                  style={{
                    left: `${section.startTime * pixelsPerSecond}px`,
                    width: `${(section.endTime - section.startTime) * pixelsPerSecond}px`,
                    backgroundColor: SECTION_COLORS[section.type] || '#6366f1',
                    opacity: selectedSectionId && selectedSectionId !== section.id ? 0.4 : 0.8,
                  }}
                >
                  <span className="text-white truncate px-1">{section.label}</span>
                </div>
              ))}
            </div>

            {/* Track Rows */}
            {project.tracks.map((track) => (
              <div key={track.id} className="h-12 border-b border-[var(--border-color)] relative">
                {track.sections.map((ts, i) => (
                  <div
                    key={i}
                    className="absolute top-1 bottom-1 rounded-sm opacity-70"
                    style={{
                      left: `${ts.startTime * pixelsPerSecond}px`,
                      width: `${(ts.endTime - ts.startTime) * pixelsPerSecond}px`,
                      backgroundColor: track.color,
                    }}
                  >
                    {/* Waveform visualization */}
                    <div className="w-full h-full flex items-center gap-px px-1 overflow-hidden">
                      {Array.from({ length: Math.max(10, Math.floor((ts.endTime - ts.startTime) * pixelsPerSecond / 3)) }).map((_, j) => (
                        <div
                          key={j}
                          className="w-1 bg-white/30 rounded-full flex-shrink-0"
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="w-3 h-3 bg-white rounded-full -ml-[5px] -mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
