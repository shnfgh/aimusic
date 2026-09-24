// ==========================================
// FARQAR AI MUSIC STUDIO - Data Models
// ==========================================

export type Genre = 'pop' | 'rock' | 'electronic' | 'hiphop' | 'jazz' | 'classical' | 'indian' | 'latin' | 'rnb' | 'folk' | 'cinematic' | 'ambient';
export type Mood = 'happy' | 'sad' | 'energetic' | 'calm' | 'dark' | 'romantic' | 'epic' | 'melancholic' | 'uplifting' | 'mysterious';
export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type Scale = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'phrygian';
export type VocalGender = 'male' | 'female' | 'duet' | 'none';
export type VocalStyle = 'pop' | 'rock' | 'operatic' | 'rap' | 'whisper' | 'belt' | 'natural';
export type Language = 'en' | 'fa' | 'es' | 'fr' | 'ar' | 'hi' | 'ja' | 'ko' | 'zh' | 'de';

export type SectionType = 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'instrumental' | 'breakdown' | 'drop' | 'solo';

export type StemType = 'vocals' | 'drums' | 'bass' | 'guitar' | 'piano' | 'synth' | 'other';

export type GenerationStatus = 'idle' | 'analyzing' | 'arranging' | 'generating-instrumental' | 'generating-vocals' | 'mixing' | 'mastering' | 'complete' | 'error';

export type JobStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface MusicParameters {
  genre: Genre;
  mood: Mood;
  bpm: number;
  key: MusicalKey;
  scale: Scale;
  vocalGender: VocalGender;
  vocalStyle: VocalStyle;
  language: Language;
  instruments: string[];
  duration: number; // in seconds
}

export interface Section {
  id: string;
  type: SectionType;
  label: string;
  startTime: number;
  endTime: number;
  lyrics?: string;
  order: number;
}

export interface Track {
  id: string;
  name: string;
  stemType: StemType;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  audioUrl?: string;
  sections: { sectionId: string; startTime: number; endTime: number }[];
}

export interface GenerationMetadata {
  model: string;
  modelVersion: string;
  provider: string;
  generationDate: string;
  prompt: string;
  lyrics: string;
  license: string;
  source: string;
}

export interface Project {
  id: string;
  title: string;
  prompt: string;
  lyrics: string;
  parameters: MusicParameters;
  sections: Section[];
  tracks: Track[];
  stems: StemType[];
  metadata: GenerationMetadata;
  createdAt: string;
  updatedAt: string;
  duration: number;
}

export interface GenerationInput {
  prompt: string;
  lyrics: string;
  parameters: MusicParameters;
  structure: SectionType[];
}

export interface ExtendInput {
  projectId: string;
  fromTime: number;
  prompt?: string;
  duration: number;
}

export interface RemixInput {
  projectId: string;
  prompt: string;
  parameters: Partial<MusicParameters>;
}

export interface VocalsInput {
  projectId: string;
  lyrics: string;
  vocalGender: VocalGender;
  vocalStyle: VocalStyle;
}

export interface StemSeparationInput {
  audioUrl: string;
  stems: StemType[];
}

export interface GenerationJob {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentStep: GenerationStatus;
  result?: Partial<Project>;
  error?: string;
}
