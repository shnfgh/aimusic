import React from 'react';
import { Project, SectionType } from '../../models/types';

interface InspectorPanelProps {
  project: Project | null;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onRemoveSection: (id: string) => void;
  onAddSection: (type: SectionType, afterIndex: number) => void;
  onExportJSON: () => void;
}

const SECTION_TYPES: SectionType[] = ['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'instrumental', 'breakdown', 'drop', 'solo'];

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

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  project, selectedSectionId, onSelectSection, onRemoveSection, onAddSection, onExportJSON,
}) => {
  if (!project) {
    return (
      <aside className="w-72 h-full border-l border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 flex items-center justify-center">
        <p className="text-sm text-[var(--text-muted)] text-center">Generate a track to see details</p>
      </aside>
    );
  }

  const selectedSection = project.sections.find((s) => s.id === selectedSectionId);

  return (
    <aside className="w-72 h-full border-l border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-y-auto">
      {/* Project Info */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Project</h3>
        <p className="text-xs text-[var(--text-secondary)] truncate">{project.title}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-[var(--bg-tertiary)] rounded p-1.5">
            <span className="text-[var(--text-muted)]">BPM</span>
            <p className="text-[var(--text-primary)] font-medium">{project.parameters.bpm}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded p-1.5">
            <span className="text-[var(--text-muted)]">Key</span>
            <p className="text-[var(--text-primary)] font-medium">{project.parameters.key} {project.parameters.scale}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded p-1.5">
            <span className="text-[var(--text-muted)]">Duration</span>
            <p className="text-[var(--text-primary)] font-medium">{formatTime(project.duration)}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded p-1.5">
            <span className="text-[var(--text-muted)]">Tracks</span>
            <p className="text-[var(--text-primary)] font-medium">{project.tracks.length}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Structure</h3>
        <div className="space-y-1">
          {project.sections.map((section, index) => (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                selectedSectionId === section.id
                  ? 'bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/30'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS[section.type] }} />
              <span className="text-xs text-[var(--text-primary)] flex-1">{section.label}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{formatTime(section.endTime - section.startTime)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveSection(section.id); }}
                className="w-4 h-4 rounded text-[10px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-900/30 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add Section */}
        <div className="mt-3 flex gap-1 flex-wrap">
          {SECTION_TYPES.slice(0, 6).map((type) => (
            <button
              key={type}
              onClick={() => onAddSection(type, project.sections.length - 1)}
              className="px-2 py-0.5 text-[10px] rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50 transition-colors"
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Section Details */}
      {selectedSection && (
        <div className="p-4 border-b border-[var(--border-color)] animate-slide-up">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Section Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Type</span>
              <span className="text-[var(--text-primary)]">{selectedSection.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Start</span>
              <span className="text-[var(--text-primary)]">{formatTime(selectedSection.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">End</span>
              <span className="text-[var(--text-primary)]">{formatTime(selectedSection.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Duration</span>
              <span className="text-[var(--text-primary)]">{formatTime(selectedSection.endTime - selectedSection.startTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Metadata</h3>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Provider</span>
            <span className="text-[var(--text-secondary)]">{project.metadata.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Model</span>
            <span className="text-[var(--text-secondary)]">{project.metadata.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Generated</span>
            <span className="text-[var(--text-secondary)]">{new Date(project.metadata.generationDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">License</span>
            <span className="text-[var(--text-secondary)]">{project.metadata.license}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="p-4">
        <button
          onClick={onExportJSON}
          className="w-full py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-tertiary)] transition-all"
        >
          📦 Export Project JSON
        </button>
      </div>
    </aside>
  );
};
