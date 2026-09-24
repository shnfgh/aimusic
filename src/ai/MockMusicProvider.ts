// ==========================================
// Mock Music Provider - For Development
// ==========================================

import { MusicGenerationProvider } from './MusicGenerationProvider';
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
  MusicParameters,
} from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const STEPS: { status: GenerationStatus; duration: number; label: string }[] = [
  { status: 'analyzing', duration: 2000, label: 'Analyzing lyrics...' },
  { status: 'arranging', duration: 2500, label: 'Creating arrangement...' },
  { status: 'generating-instrumental', duration: 4000, label: 'Generating instrumental...' },
  { status: 'generating-vocals', duration: 3000, label: 'Generating vocals...' },
  { status: 'mixing', duration: 2000, label: 'Mixing...' },
  { status: 'mastering', duration: 1500, label: 'Mastering...' },
];

function generateMockSections(input: GenerationInput): Section[] {
  const defaultStructure: SectionType[] = ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'];
  const structure: SectionType[] = input.structure.length > 0 ? input.structure : defaultStructure;
  const secondsPerSection = input.parameters.duration / structure.length;
  let currentTime = 0;

  return structure.map((type, index) => {
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

function generateMockTracks(sections: Section[], duration: number): Track[] {
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

  return stems.map((stemType) => ({
    id: uuidv4(),
    name: stemType.charAt(0).toUpperCase() + stemType.slice(1),
    stemType,
    volume: 0.8,
    pan: 0,
    muted: false,
    solo: false,
    color: stemColors[stemType],
    sections: sections.map((s) => ({
      sectionId: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  }));
}

export class MockMusicProvider extends MusicGenerationProvider {
  readonly name = 'MockProvider';
  readonly version = '1.0.0';

  private jobs: Map<string, GenerationJob> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>[]> = new Map();

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

    // Simulate shorter generation for extend
    const totalDuration = 5000;
    const stepDuration = totalDuration / 3;
    const steps: GenerationStatus[] = ['arranging', 'generating-instrumental', 'mixing'];

    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        const j = this.jobs.get(jobId);
        if (j) {
          j.currentStep = step;
          j.progress = ((index + 1) / steps.length) * 100;
          if (index === steps.length - 1) {
            j.status = 'complete';
            j.result = this.createMockProject('Extended Track');
          }
        }
      }, stepDuration * (index + 1));
      timers.push(timer);
    });

    this.timers.set(jobId, timers);
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
    this.simulateGeneration(jobId, {
      prompt: input.prompt,
      lyrics: '',
      parameters: { ...input.parameters } as any,
      structure: [],
    });
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

    const timer = setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 3000);

    this.timers.set(jobId, [timer]);
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

    const timer = setTimeout(() => {
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'complete';
        j.progress = 100;
        j.currentStep = 'complete';
      }
    }, 4000);

    this.timers.set(jobId, [timer]);
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
    const timers = this.timers.get(jobId);
    if (timers) {
      timers.forEach(clearTimeout);
      this.timers.delete(jobId);
    }
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = 'Cancelled by user';
    }
  }

  private simulateGeneration(jobId: string, input: GenerationInput): void {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.currentStep = step.status;
        job.status = 'processing';
        job.progress = ((index + 1) / STEPS.length) * 100;

        if (index === STEPS.length - 1) {
          job.status = 'complete';
          job.currentStep = 'complete';
          job.result = this.createMockProject(input.prompt);
        }
      }, elapsed);

      timers.push(timer);
      elapsed += step.duration;
    });

    this.timers.set(jobId, timers);
  }

  private createMockProject(title: string): Partial<Project> {
    const duration = 180; // 3 minutes
    const sections = generateMockSections({
      prompt: title,
      lyrics: '',
      parameters: {
        genre: 'pop',
        mood: 'happy',
        bpm: 120,
        key: 'C',
        scale: 'major',
        vocalGender: 'male',
        vocalStyle: 'pop',
        language: 'en',
        instruments: [],
        duration,
      },
      structure: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
    });

    const tracks = generateMockTracks(sections, duration);

    return {
      id: uuidv4(),
      title: title || 'Untitled Track',
      prompt: title,
      lyrics: '',
      parameters: {
        genre: 'pop',
        mood: 'happy',
        bpm: 120,
        key: 'C',
        scale: 'major',
        vocalGender: 'male',
        vocalStyle: 'pop',
        language: 'en',
        instruments: [],
        duration,
      },
      sections,
      tracks,
      stems: ['vocals', 'drums', 'bass', 'guitar', 'piano'],
      metadata: {
        model: 'MockModel',
        modelVersion: '1.0.0',
        provider: 'MockProvider',
        generationDate: new Date().toISOString(),
        prompt: title,
        lyrics: '',
        license: 'original',
        source: 'mock-generation',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration,
    };
  }
}
