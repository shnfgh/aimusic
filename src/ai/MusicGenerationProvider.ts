// ==========================================
// AI Provider Interface - Abstraction Layer
// ==========================================

import {
  GenerationInput,
  ExtendInput,
  RemixInput,
  VocalsInput,
  StemSeparationInput,
  GenerationJob,
} from '../models/types';

export abstract class MusicGenerationProvider {
  abstract readonly name: string;
  abstract readonly version: string;

  abstract generateMusic(input: GenerationInput): Promise<GenerationJob>;
  abstract extendMusic(input: ExtendInput): Promise<GenerationJob>;
  abstract remixMusic(input: RemixInput): Promise<GenerationJob>;
  abstract generateVocals(input: VocalsInput): Promise<GenerationJob>;
  abstract separateStems(input: StemSeparationInput): Promise<GenerationJob>;
  abstract getJobStatus(jobId: string): Promise<GenerationJob>;
  abstract cancelJob(jobId: string): Promise<void>;
}
