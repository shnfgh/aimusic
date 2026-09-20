import React from 'react';
import { MusicParameters, Genre, Mood, MusicalKey, Scale, VocalGender, VocalStyle, Language } from '../../models/types';

interface CreatePanelProps {
  prompt: string;
  lyrics: string;
  parameters: MusicParameters;
  isGenerating: boolean;
  onPromptChange: (v: string) => void;
  onLyricsChange: (v: string) => void;
  onParametersChange: (v: Partial<MusicParameters>) => void;
  onGenerate: () => void;
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
  onPromptChange, onLyricsChange, onParametersChange, onGenerate,
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
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          📝 Lyrics
        </label>
        <textarea
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="[Verse 1]&#10;Write your lyrics here...&#10;&#10;[Chorus]&#10;The chorus goes here..."
          className="w-full h-36 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all outline-none font-mono"
        />
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
