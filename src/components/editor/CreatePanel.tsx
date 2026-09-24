import React from 'react';
import { MusicParameters, Genre, Mood, MusicalKey, Scale, VocalGender, VocalStyle, Language } from '../../models/types';

interface CreatePanelProps {
  prompt: string;
  lyrics: string;
  parameters: MusicParameters;
  isGenerating: boolean;
  lyricsAnalysis: {
    mood: string;
    genre: string;
    bpm: number;
    key: string;
    scale: string;
    intensity: number;
    themes: string[];
  } | null;
  autoSuggestEnabled: boolean;
  onPromptChange: (v: string) => void;
  onLyricsChange: (v: string) => void;
  onParametersChange: (v: Partial<MusicParameters>) => void;
  onGenerate: () => void;
  onApplySuggestion: () => void;
  onToggleAutoSuggest: () => void;
}

const GENRES: Genre[] = ['pop', 'rock', 'electronic', 'hiphop', 'jazz', 'classical', 'indian', 'latin', 'rnb', 'folk', 'cinematic', 'ambient'];
const MOODS: Mood[] = ['happy', 'sad', 'energetic', 'calm', 'dark', 'romantic', 'epic', 'melancholic', 'uplifting', 'mysterious'];
const KEYS: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES: Scale[] = ['major', 'minor', 'dorian', 'mixolydian', 'phrygian'];
const VOCAL_GENDERS: VocalGender[] = ['male', 'female', 'duet', 'none'];
const VOCAL_STYLES: VocalStyle[] = ['pop', 'rock', 'operatic', 'rap', 'whisper', 'belt', 'natural'];
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'فارسی' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

export const CreatePanel: React.FC<CreatePanelProps> = ({
  prompt, lyrics, parameters, isGenerating,
  lyricsAnalysis, autoSuggestEnabled,
  onPromptChange, onLyricsChange, onParametersChange, onGenerate,
  onApplySuggestion, onToggleAutoSuggest,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Create New Track
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Describe your vision and let AI bring it to life
        </p>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          ✨ Song Description
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Cinematic Indian dance-pop, male and female vocals, emotional verses, powerful global chorus, acoustic guitar, Indian percussion, modern electronic bass, 110 BPM..."
          className="w-full h-28 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all outline-none"
        />
      </div>

      {/* Lyrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            📝 Lyrics
          </label>
          <button
            onClick={onToggleAutoSuggest}
            className={`text-[10px] px-2 py-1 rounded-full transition-all ${
              autoSuggestEnabled
                ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            {autoSuggestEnabled ? '✨ Auto-Suggest ON' : 'Auto-Suggest OFF'}
          </button>
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="[Verse 1]&#10;Write your lyrics here...&#10;&#10;[Chorus]&#10;The chorus goes here..."
          className="w-full h-36 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all outline-none font-mono"
        />

        {/* Lyrics Analysis */}
        {lyricsAnalysis && (
          <div className="mt-3 bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/30 rounded-xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                ✨ AI Lyrics Analysis
              </h4>
              <button
                onClick={onApplySuggestion}
                className="text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Apply to Parameters
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                <span className="text-[var(--text-muted)]">Mood</span>
                <p className="text-[var(--text-primary)] font-medium capitalize">{lyricsAnalysis.mood}</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                <span className="text-[var(--text-muted)]">Genre</span>
                <p className="text-[var(--text-primary)] font-medium capitalize">{lyricsAnalysis.genre}</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                <span className="text-[var(--text-muted)]">BPM</span>
                <p className="text-[var(--text-primary)] font-medium">{lyricsAnalysis.bpm}</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                <span className="text-[var(--text-muted)]">Key</span>
                <p className="text-[var(--text-primary)] font-medium">{lyricsAnalysis.key} {lyricsAnalysis.scale}</p>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                <span className="text-[var(--text-muted)]">Intensity</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${lyricsAnalysis.intensity * 100}%` }}
                    />
                  </div>
                  <span className="text-[var(--text-primary)] text-[10px]">{Math.round(lyricsAnalysis.intensity * 100)}%</span>
                </div>
              </div>
              {lyricsAnalysis.themes.length > 0 && (
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-2">
                  <span className="text-[var(--text-muted)]">Themes</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {lyricsAnalysis.themes.slice(0, 3).map((theme) => (
                      <span key={theme} className="px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded text-[9px] capitalize">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ParamSelect label="Genre" value={parameters.genre} options={GENRES} onChange={(v) => onParametersChange({ genre: v as Genre })} />
        <ParamSelect label="Mood" value={parameters.mood} options={MOODS} onChange={(v) => onParametersChange({ mood: v as Mood })} />
        <ParamSelect label="Key" value={parameters.key} options={KEYS} onChange={(v) => onParametersChange({ key: v as MusicalKey })} />
        <ParamSelect label="Scale" value={parameters.scale} options={SCALES} onChange={(v) => onParametersChange({ scale: v as Scale })} />
        <ParamSelect label="Vocal Gender" value={parameters.vocalGender} options={VOCAL_GENDERS} onChange={(v) => onParametersChange({ vocalGender: v as VocalGender })} />
        <ParamSelect label="Vocal Style" value={parameters.vocalStyle} options={VOCAL_STYLES} onChange={(v) => onParametersChange({ vocalStyle: v as VocalStyle })} />
        <ParamSelect label="Language" value={parameters.language} options={LANGUAGES.map(l => l.value)} displayOptions={LANGUAGES.map(l => l.label)} onChange={(v) => onParametersChange({ language: v as Language })} />

        {/* BPM */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">BPM: {parameters.bpm}</label>
          <input
            type="range"
            min={60}
            max={200}
            value={parameters.bpm}
            onChange={(e) => onParametersChange({ bpm: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">Duration: {Math.floor(parameters.duration / 60)}:{String(parameters.duration % 60).padStart(2, '0')}</label>
          <input
            type="range"
            min={30}
            max={600}
            step={30}
            value={parameters.duration}
            onChange={(e) => onParametersChange({ duration: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
          ${isGenerating || !prompt.trim()
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.01] active:scale-[0.99]'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          '🎵 GENERATE'
        )}
      </button>
    </div>
  );
};

interface ParamSelectProps {
  label: string;
  value: string;
  options: string[];
  displayOptions?: string[];
  onChange: (v: string) => void;
}

const ParamSelect: React.FC<ParamSelectProps> = ({ label, value, options, displayOptions, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-[var(--text-muted)]">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full">
      {options.map((opt, i) => (
        <option key={opt} value={opt}>{displayOptions ? displayOptions[i] : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
      ))}
    </select>
  </div>
);
