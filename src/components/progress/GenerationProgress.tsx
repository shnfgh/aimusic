import React from 'react';
import { GenerationStatus } from '../../models/types';

interface GenerationProgressProps {
  status: GenerationStatus;
  progress: number;
  onCancel: () => void;
}

const STEPS: { key: GenerationStatus; label: string; icon: string }[] = [
  { key: 'analyzing', label: 'Analyzing lyrics & prompt', icon: '🔍' },
  { key: 'arranging', label: 'Creating arrangement', icon: '🎼' },
  { key: 'generating-instrumental', label: 'Generating instrumental', icon: '🎸' },
  { key: 'generating-vocals', label: 'Generating vocals', icon: '🎤' },
  { key: 'mixing', label: 'Mixing tracks', icon: '🎛️' },
  { key: 'mastering', label: 'Mastering audio', icon: '💿' },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ status, progress, onCancel }) => {
  const currentStepIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse-glow">
            <span className="text-2xl">🎵</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Generating Your Music</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI is creating your track...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-progress-flow transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                  isCurrent ? 'bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/30' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  isComplete ? 'bg-green-900/30 text-green-400' :
                  isCurrent ? 'bg-purple-900/30 text-purple-400 animate-pulse' :
                  'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }`}>
                  {isComplete ? '✓' : step.icon}
                </div>
                <span className={`text-sm ${
                  isComplete ? 'text-green-400' :
                  isCurrent ? 'text-[var(--text-primary)] font-medium' :
                  'text-[var(--text-muted)]'
                }`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-3 bg-purple-500 rounded-full"
                        style={{
                          animation: `waveform 0.8s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full mt-6 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cancel Generation
        </button>
      </div>
    </div>
  );
};
