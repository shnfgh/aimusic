// ==========================================
// Synth Music Provider - Real Audio Generation
// Uses Web Audio API to generate actual music
// ==========================================

import { MusicGenerationProvider } from './MusicGenerationProvider';
import { MusicSynthesizer } from '../audio/MusicSynthesizer';
import {
  GenerationInput,
  ExtendInput,
  RemixInput,
  VocalsInput,
  StemSeparationInput,
  GenerationJob,
  GenerationStatus,
  Project,
  Section,
  Track,
  StemType,
  SectionType,
} from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class SynthMusicProvider extends MusicGenerationProvider {
  readonly name = 'SynthProvider';
  readonly version = '1.0.0';

  private jobs: Map<string, GenerationJob> = new Map();
  private audioUrls: Map<string, string> = new Map();

  async generateMusic(input: GenerationInput): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'idle',
    };

    this.jobs.set(jobId, job);
    this.simulateGeneration(jobId, input);
    return job;
  }

  async extendMusic(input: ExtendInput): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'generating-instrumental',
    };
    this.jobs.set(jobId, job);

    // Simulate shorter generation
    setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 3000);

    return job;
  }

  async remixMusic(input: RemixInput): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'idle',
    };
    this.jobs.set(jobId, job);

    setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 4000);

    return job;
  }

  async generateVocals(input: VocalsInput): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'generating-vocals',
    };
    this.jobs.set(jobId, job);

    setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 3000);

    return job;
  }

  async separateStems(input: StemSeparationInput): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      status: 'pending',
      progress: 0,
      currentStep: 'analyzing',
    };
    this.jobs.set(jobId, job);

    setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 4000);

    return job;
  }

  async getJobStatus(jobId: string): Promise<GenerationJob> {
    return this.jobs.get(jobId) || {
      jobId,
      status: 'failed',
      progress: 0,
      currentStep: 'error',
      error: 'Job not found',
    };
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = 'Cancelled by user';
    }
  }

  private async simulateGeneration(jobId: string, input: GenerationInput): Promise<void> {
    const steps: { status: GenerationStatus; duration: number }[] = [
      { status: 'analyzing', duration: 500 },
      { status: 'arranging', duration: 500 },
      { status: 'generating-instrumental', duration: 1000 },
      { status: 'generating-vocals', duration: 800 },
      { status: 'mixing', duration: 500 },
      { status: 'mastering', duration: 500 },
    ];

    let elapsed = 0;
    let audioGenerationPromise: Promise<void> | null = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      setTimeout(async () => {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.currentStep = step.status;
        job.status = 'processing';
        job.progress = ((i + 1) / steps.length) * 100;

        // Generate actual audio at the instrumental step
        if (step.status === 'generating-instrumental') {
          audioGenerationPromise = this.generateActualAudio(jobId, input);
        }

        if (i === steps.length - 1) {
          // Wait for audio generation to complete before marking job as complete
          if (audioGenerationPromise) {
            try {
              await audioGenerationPromise;
            } catch (error) {
              console.error('[SynthProvider] Audio generation error:', error);
            }
          }
          
          job.status = 'complete';
          job.currentStep = 'complete';
          job.result = this.createProjectFromAudio(jobId, input);
        }
      }, elapsed);

      elapsed += step.duration;
    }
  }

  private async generateActualAudio(jobId: string, input: GenerationInput): Promise<void> {
    try {
      console.log('[SynthProvider] Starting audio generation...');
      
      const synthesizer = new MusicSynthesizer({
        key: input.parameters.key,
        scale: input.parameters.scale,
        bpm: input.parameters.bpm,
        mood: input.parameters.mood,
        genre: input.parameters.genre,
        duration: Math.min(input.parameters.duration, 60), // Limit to 60s for demo
      });

      console.log('[SynthProvider] Rendering audio...');
      const audioBuffer = await synthesizer.render();
      console.log('[SynthProvider] Audio rendered, converting to WAV...');
      
      const wavBlob = MusicSynthesizer.bufferToWav(audioBuffer);
      console.log('[SynthProvider] WAV blob created, size:', wavBlob.size);
      
      const audioUrl = URL.createObjectURL(wavBlob);
      console.log('[SynthProvider] Audio URL created:', audioUrl);

      this.audioUrls.set(jobId, audioUrl);
      console.log('[SynthProvider] Audio generation complete');
    } catch (error) {
      console.error('[SynthProvider] Audio generation failed:', error);
      throw error;
    }
  }

  private createProjectFromAudio(jobId: string, input: GenerationInput): Partial<Project> {
    const duration = Math.min(input.parameters.duration, 60);
    const audioUrl = this.audioUrls.get(jobId);

    const sections = this.generateSections(input.structure, duration);
    const tracks = this.generateTracks(sections, audioUrl);

    return {
      id: uuidv4(),
      title: input.prompt.slice(0, 50) || 'Generated Track',
      prompt: input.prompt,
      lyrics: input.lyrics,
      parameters: input.parameters,
      sections,
      tracks,
      stems: ['drums', 'bass', 'guitar', 'piano', 'vocals'],
      metadata: {
        model: 'WebAudioSynth',
        modelVersion: '1.0.0',
        provider: 'SynthProvider',
        generationDate: new Date().toISOString(),
        prompt: input.prompt,
        lyrics: input.lyrics,
        license: 'original',
        source: 'procedural-generation',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration,
    };
  }

  private generateSections(structure: SectionType[], duration: number): Section[] {
    const defaultStructure: SectionType[] = structure.length > 0 ? structure : ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'];
    const secondsPerSection = duration / defaultStructure.length;
    let currentTime = 0;

    return defaultStructure.map((type, index) => {
      const section: Section = {
        id: uuidv4(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
        startTime: currentTime,
        endTime: currentTime + secondsPerSection,
        order: index,
      };
      currentTime += secondsPerSection;
      return section;
    });
  }

  private generateTracks(sections: Section[], audioUrl?: string): Track[] {
    const stemColors: Record<StemType, string> = {
      vocals: '#f472b6',
      drums: '#fb923c',
      bass: '#a78bfa',
      guitar: '#34d399',
      piano: '#60a5fa',
      synth: '#fbbf24',
      other: '#94a3b8',
    };

    const stems: StemType[] = ['drums', 'bass', 'guitar', 'piano', 'vocals'];

    return stems.map((stemType, index) => ({
      id: uuidv4(),
      name: stemType.charAt(0).toUpperCase() + stemType.slice(1),
      stemType,
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      color: stemColors[stemType],
      audioUrl: index === 0 ? audioUrl : undefined, // Only first track has audio for now
      sections: sections.map((s) => ({
        sectionId: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    }));
  }
}
