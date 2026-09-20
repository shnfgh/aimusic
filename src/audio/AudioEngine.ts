// ==========================================
// Audio Engine - Web Audio API Wrapper
// ==========================================

import { Track } from '../models/types';

export interface AudioEngineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  loopStart: number;
  loopEnd: number;
}

type StateListener = (state: AudioEngineState) => void;

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private trackNodes: Map<string, { source: AudioBufferSourceNode; gain: GainNode; pan: StereoPannerNode }> = new Map();
  private state: AudioEngineState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLooping: false,
    loopStart: 0,
    loopEnd: 0,
  };
  private listeners: Set<StateListener> = new Set();
  private animFrameId: number | null = null;
  private startTimestamp: number = 0;
  private startOffset: number = 0;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.8;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  getState(): AudioEngineState {
    return { ...this.state };
  }

  setDuration(duration: number): void {
    this.state.duration = duration;
    this.notify();
  }

  /**
   * Load an audio URL for playback
   */
  loadAudioUrl(url: string): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.state.duration = this.audioElement!.duration;
      this.notify();
    });

    this.audioElement.addEventListener('ended', () => {
      this.state.isPlaying = false;
      this.state.currentTime = 0;
      this.stopAnimation();
      this.notify();
    });
  }

  async play(): Promise<void> {
    if (!this.context) return;
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    // If we have a real audio element, use it
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.currentTime = this.state.currentTime;
      await this.audioElement.play();
    }

    this.state.isPlaying = true;
    this.startTimestamp = this.context.currentTime;
    this.startOffset = this.state.currentTime;
    this.startAnimation();
    this.notify();
  }

  pause(): void {
    if (!this.context) return;

    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.state.currentTime = this.audioElement.currentTime;
    }

    this.state.isPlaying = false;
    this.stopAnimation();
    this.notify();
  }

  seek(time: number): void {
    this.state.currentTime = Math.max(0, Math.min(time, this.state.duration));

    if (this.audioElement && this.audioElement.src) {
      this.audioElement.currentTime = this.state.currentTime;
    }

    if (this.state.isPlaying) {
      this.startTimestamp = this.context!.currentTime;
      this.startOffset = this.state.currentTime;
    }
    this.notify();
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setTrackVolume(trackId: string, volume: number): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.gain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.pan.pan.value = Math.max(-1, Math.min(1, pan));
    }
  }

  setLoop(loopStart: number, loopEnd: number): void {
    this.state.isLooping = true;
    this.state.loopStart = loopStart;
    this.state.loopEnd = loopEnd;
    if (this.audioElement) {
      this.audioElement.loop = true;
    }
    this.notify();
  }

  clearLoop(): void {
    this.state.isLooping = false;
    this.state.loopStart = 0;
    this.state.loopEnd = 0;
    if (this.audioElement) {
      this.audioElement.loop = false;
    }
    this.notify();
  }

  private startAnimation(): void {
    const tick = () => {
      if (!this.state.isPlaying) return;

      // Use audio element time if available
      if (this.audioElement && this.audioElement.src && !this.audioElement.paused) {
        this.state.currentTime = this.audioElement.currentTime;
      } else if (this.context) {
        const elapsed = this.context.currentTime - this.startTimestamp;
        this.state.currentTime = this.startOffset + elapsed;
      }

      if (this.state.isLooping && this.state.currentTime >= this.state.loopEnd) {
        this.state.currentTime = this.state.loopStart;
        if (this.audioElement) this.audioElement.currentTime = this.state.loopStart;
        if (this.context) {
          this.startTimestamp = this.context.currentTime;
          this.startOffset = this.state.loopStart;
        }
      } else if (!this.state.isLooping && this.state.currentTime >= this.state.duration) {
        this.state.isPlaying = false;
        this.state.currentTime = 0;
        if (this.audioElement) this.audioElement.currentTime = 0;
      }

      this.notify();
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private stopAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy(): void {
    this.stopAnimation();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.trackNodes.forEach((node) => {
      try { node.source.stop(); } catch {}
    });
    this.trackNodes.clear();
    if (this.context) {
      this.context.close();
    }
  }
}

// Singleton
let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}
