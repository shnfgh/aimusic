// ==========================================
// Project Store - State Management
// ==========================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  MusicParameters,
  GenerationInput,
  GenerationJob,
  GenerationStatus,
  Section,
  SectionType,
  Track,
} from '../models/types';
import { MusicGenerationProvider } from '../ai/MusicGenerationProvider';
import { MockMusicProvider } from '../ai/MockMusicProvider';
import { getAudioEngine, AudioEngineState } from '../audio/AudioEngine';
import { LyricsAnalyzer } from '../services/LyricsAnalyzer';

// Default parameters
const DEFAULT_PARAMS: MusicParameters = {
  genre: 'pop',
  mood: 'happy',
  bpm: 120,
  key: 'C',
  scale: 'major',
  vocalGender: 'male',
  vocalStyle: 'pop',
  language: 'en',
  instruments: ['guitar', 'piano', 'drums', 'bass'],
  duration: 180,
};

const DEFAULT_STRUCTURE: SectionType[] = ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'];

export interface StudioState {
  // Project
  project: Project | null;
  prompt: string;
  lyrics: string;
  parameters: MusicParameters;
  structure: SectionType[];

  // Generation
  isGenerating: boolean;
  generationStatus: GenerationStatus;
  generationProgress: number;
  currentJobId: string | null;

  // Audio
  audioState: AudioEngineState;

  // UI
  selectedSectionId: string | null;
  activeTab: 'create' | 'edit' | 'mix' | 'export';

  // Lyrics Analysis
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
}

export function useStudioStore() {
  const [state, setState] = useState<StudioState>({
    project: null,
    prompt: '',
    lyrics: '',
    parameters: DEFAULT_PARAMS,
    structure: DEFAULT_STRUCTURE,
    isGenerating: false,
    generationStatus: 'idle',
    generationProgress: 0,
    currentJobId: null,
    audioState: getAudioEngine().getState(),
    selectedSectionId: null,
    activeTab: 'create',
    lyricsAnalysis: null,
    autoSuggestEnabled: true,
  });

  const providerRef = useRef<MusicGenerationProvider>(new MockMusicProvider());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lyricsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to audio engine
  useEffect(() => {
    const engine = getAudioEngine();
    const unsub = engine.subscribe((audioState) => {
      setState((s) => ({ ...s, audioState }));
    });
    return unsub;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (lyricsDebounceRef.current) clearTimeout(lyricsDebounceRef.current);
    };
  }, []);

  const setPrompt = useCallback((prompt: string) => {
    setState((s) => ({ ...s, prompt }));
  }, []);

  const setLyrics = useCallback((lyrics: string) => {
    setState((s) => ({ ...s, lyrics }));

    // Debounced lyrics analysis
    if (lyricsDebounceRef.current) {
      clearTimeout(lyricsDebounceRef.current);
    }

    lyricsDebounceRef.current = setTimeout(() => {
      if (lyrics.trim().length > 10 && state.autoSuggestEnabled) {
        try {
          const analysis = LyricsAnalyzer.analyze(lyrics);
          setState((s) => ({
            ...s,
            lyricsAnalysis: {
              mood: analysis.mood,
              genre: analysis.suggestedGenre,
              bpm: analysis.suggestedBPM,
              key: analysis.suggestedKey,
              scale: analysis.suggestedScale,
              intensity: analysis.emotionalIntensity,
              themes: analysis.themes,
            },
          }));
        } catch (e) {
          console.warn('Lyrics analysis failed:', e);
        }
      } else {
        setState((s) => ({ ...s, lyricsAnalysis: null }));
      }
    }, 500);
  }, [state.autoSuggestEnabled]);

  const setParameters = useCallback((params: Partial<MusicParameters>) => {
    setState((s) => ({ ...s, parameters: { ...s.parameters, ...params } }));
  }, []);

  const applyLyricsSuggestion = useCallback(() => {
    if (!state.lyricsAnalysis) return;
    const analysis = state.lyricsAnalysis;
    setState((s) => ({
      ...s,
      parameters: {
        ...s.parameters,
        mood: analysis.mood as any,
        genre: analysis.genre as any,
        bpm: analysis.bpm,
        key: analysis.key as any,
        scale: analysis.scale as any,
      },
    }));
  }, [state.lyricsAnalysis]);

  const setStructure = useCallback((structure: SectionType[]) => {
    setState((s) => ({ ...s, structure }));
  }, []);

  const setActiveTab = useCallback((tab: 'create' | 'edit' | 'mix' | 'export') => {
    setState((s) => ({ ...s, activeTab: tab }));
  }, []);

  const setSelectedSection = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedSectionId: id }));
  }, []);

  const toggleAutoSuggest = useCallback(() => {
    setState((s) => ({ ...s, autoSuggestEnabled: !s.autoSuggestEnabled }));
  }, []);

  const generateMusic = useCallback(async () => {
    const provider = providerRef.current;

    // If lyrics analysis exists and auto-suggest is on, apply it
    let finalParams = state.parameters;
    if (state.lyricsAnalysis && state.autoSuggestEnabled) {
      const analysis = state.lyricsAnalysis;
      finalParams = {
        ...state.parameters,
        mood: analysis.mood as any,
        genre: analysis.genre as any,
        bpm: analysis.bpm,
        key: analysis.key as any,
        scale: analysis.scale as any,
      };
    }

    const input: GenerationInput = {
      prompt: state.prompt,
      lyrics: state.lyrics,
      parameters: finalParams,
      structure: state.structure,
    };

    setState((s) => ({
      ...s,
      isGenerating: true,
      generationStatus: 'analyzing',
      generationProgress: 0,
    }));

    try {
      const job = await provider.generateMusic(input);
      setState((s) => ({ ...s, currentJobId: job.jobId }));

      pollIntervalRef.current = setInterval(async () => {
        const updatedJob = await provider.getJobStatus(job.jobId);
        setState((s) => ({
          ...s,
          generationStatus: updatedJob.currentStep,
          generationProgress: updatedJob.progress,
        }));

        if (updatedJob.status === 'complete' && updatedJob.result) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          const project: Project = {
            ...updatedJob.result as Project,
            id: uuidv4(),
            title: state.prompt.slice(0, 50) || 'Untitled Track',
            prompt: state.prompt,
            lyrics: state.lyrics,
            parameters: finalParams,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setState((s) => ({
            ...s,
            project,
            isGenerating: false,
            generationStatus: 'complete',
            generationProgress: 100,
            activeTab: 'edit',
          }));
          getAudioEngine().setDuration(project.duration);
        } else if (updatedJob.status === 'failed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setState((s) => ({
            ...s,
            isGenerating: false,
            generationStatus: 'error',
          }));
        }
      }, 500);
    } catch (error) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        generationStatus: 'error',
      }));
    }
  }, [state.prompt, state.lyrics, state.parameters, state.structure, state.lyricsAnalysis, state.autoSuggestEnabled]);

  const cancelGeneration = useCallback(async () => {
    if (state.currentJobId) {
      await providerRef.current.cancelJob(state.currentJobId);
    }
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setState((s) => ({
      ...s,
      isGenerating: false,
      generationStatus: 'idle',
      generationProgress: 0,
      currentJobId: null,
    }));
  }, [state.currentJobId]);

  const toggleTrackMute = useCallback((trackId: string) => {
    setState((s) => {
      if (!s.project) return s;
      const tracks = s.project.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      );
      return { ...s, project: { ...s.project, tracks } };
    });
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setState((s) => {
      if (!s.project) return s;
      const tracks = s.project.tracks.map((t) =>
        t.id === trackId ? { ...t, solo: !t.solo } : t
      );
      return { ...s, project: { ...s.project, tracks } };
    });
  }, []);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    setState((s) => {
      if (!s.project) return s;
      const tracks = s.project.tracks.map((t) =>
        t.id === trackId ? { ...t, volume } : t
      );
      return { ...s, project: { ...s.project, tracks } };
    });
    getAudioEngine().setTrackVolume(trackId, volume);
  }, []);

  const exportProjectJSON = useCallback(() => {
    if (!state.project) return;
    const blob = new Blob([JSON.stringify(state.project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.project.title || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.project]);

  const removeSection = useCallback((sectionId: string) => {
    setState((s) => {
      if (!s.project) return s;
      const sections = s.project.sections.filter((sec) => sec.id !== sectionId);
      return { ...s, project: { ...s.project, sections } };
    });
  }, []);

  const addSection = useCallback((type: SectionType, afterIndex: number) => {
    setState((s) => {
      if (!s.project) return s;
      const newSection: Section = {
        id: uuidv4(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        startTime: 0,
        endTime: 0,
        order: afterIndex + 1,
      };
      const sections = [...s.project.sections];
      sections.splice(afterIndex + 1, 0, newSection);
      const duration = s.project.duration;
      const perSection = duration / sections.length;
      sections.forEach((sec, i) => {
        sec.startTime = i * perSection;
        sec.endTime = (i + 1) * perSection;
        sec.order = i;
      });
      return { ...s, project: { ...s.project, sections } };
    });
  }, []);

  return {
    state,
    setPrompt,
    setLyrics,
    setParameters,
    setStructure,
    setActiveTab,
    setSelectedSection,
    toggleAutoSuggest,
    applyLyricsSuggestion,
    generateMusic,
    cancelGeneration,
    toggleTrackMute,
    toggleTrackSolo,
    setTrackVolume,
    exportProjectJSON,
    removeSection,
    addSection,
  };
}
