// ==========================================
// Music Synthesizer - Procedural Music Generation
// Uses Web Audio API to generate real audio
// ==========================================

import { MusicTheory } from './MusicTheory';
import { MusicalKey, Scale, Mood, Genre } from '../models/types';

interface SynthConfig {
  key: MusicalKey;
  scale: Scale;
  bpm: number;
  mood: Mood;
  genre: Genre;
  duration: number; // seconds
  sampleRate?: number;
}

export class MusicSynthesizer {
  private config: SynthConfig;

  constructor(config: SynthConfig) {
    this.config = {
      ...config,
      sampleRate: config.sampleRate || 44100,
    };
  }

  /**
   * Render the full track to an AudioBuffer
   */
  async render(): Promise<AudioBuffer> {
    const { duration, sampleRate } = this.config;
    const numSamples = Math.floor(duration * (sampleRate || 44100));

    console.log('[MusicSynth] Starting render, duration:', duration, 'samples:', numSamples);

    try {
      const offlineCtx = new OfflineAudioContext(
        2, // stereo
        numSamples,
        sampleRate || 44100
      );

      // Create master bus
      const masterGain = offlineCtx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(offlineCtx.destination);

      // Create reverb (simple convolution)
      const reverb = this.createReverb(offlineCtx);
      const reverbGain = offlineCtx.createGain();
      reverbGain.gain.value = 0.2;
      reverb.connect(reverbGain);
      reverbGain.connect(masterGain);

      // Generate layers
      console.log('[MusicSynth] Rendering drums...');
      await this.renderDrums(offlineCtx, masterGain);
      console.log('[MusicSynth] Rendering bass...');
      await this.renderBass(offlineCtx, masterGain);
      console.log('[MusicSynth] Rendering chords...');
      await this.renderChords(offlineCtx, masterGain, reverb);
      console.log('[MusicSynth] Rendering melody...');
      await this.renderMelody(offlineCtx, masterGain, reverb);
      console.log('[MusicSynth] Rendering pad...');
      await this.renderPad(offlineCtx, masterGain, reverb);

      // Render
      console.log('[MusicSynth] Starting offline render...');
      const buffer = await offlineCtx.startRendering();
      console.log('[MusicSynth] Render complete, buffer duration:', buffer.duration);
      return buffer;
    } catch (error) {
      console.error('[MusicSynth] Render failed:', error);
      // Fallback: create a simple sine wave buffer
      return await this.createFallbackBuffer();
    }
  }

  /**
   * Create a fallback audio buffer if rendering fails
   */
  private async createFallbackBuffer(): Promise<AudioBuffer> {
    console.log('[MusicSynth] Creating fallback buffer...');
    const { duration, sampleRate } = this.config;
    const ctx = new OfflineAudioContext(2, Math.floor(duration * (sampleRate || 44100)), sampleRate || 44100);
    
    // Create a simple chord progression
    const rootFreq = MusicTheory.midiToFreq(MusicTheory.getRootMidi(this.config.key, 3));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = rootFreq;
    gain.gain.value = 0.3;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(0);
    osc.stop(duration);
    
    return await ctx.startRendering();
  }

  /**
   * Convert AudioBuffer to WAV Blob
   */
  static bufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Interleave channels
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private static writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * Create a simple reverb impulse response
   */
  private createReverb(ctx: OfflineAudioContext): ConvolverNode {
    const convolver = ctx.createConvolver();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  /**
   * Render drum track
   */
  private async renderDrums(ctx: OfflineAudioContext, destination: AudioNode): Promise<void> {
    const { bpm, genre, duration } = this.config;
    const beatDuration = 60 / bpm;
    const sixteenthDuration = beatDuration / 4;
    const pattern = MusicTheory.generateDrumPattern(genre, bpm);

    const drumGain = ctx.createGain();
    drumGain.gain.value = 0.6;
    drumGain.connect(destination);

    const numBars = Math.ceil(duration / (beatDuration * 4));

    for (let bar = 0; bar < numBars; bar++) {
      for (let step = 0; step < 16; step++) {
        const time = bar * beatDuration * 4 + step * sixteenthDuration;
        if (time >= duration) break;

        if (pattern.kick[step]) {
          this.renderKick(ctx, drumGain, time);
        }
        if (pattern.snare[step]) {
          this.renderSnare(ctx, drumGain, time);
        }
        if (pattern.hihat[step]) {
          this.renderHihat(ctx, drumGain, time);
        }
      }
    }
  }

  private renderKick(ctx: OfflineAudioContext, destination: AudioNode, time: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private renderSnare(ctx: OfflineAudioContext, destination: AudioNode, time: number): void {
    // Noise component
    const bufferSize = ctx.sampleRate * 0.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(destination);

    noise.start(time);
    noise.stop(time + 0.2);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private renderHihat(ctx: OfflineAudioContext, destination: AudioNode, time: number): void {
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  /**
   * Render bass track
   */
  private async renderBass(ctx: OfflineAudioContext, destination: AudioNode): Promise<void> {
    const { key, scale, bpm, mood, duration } = this.config;
    const beatDuration = 60 / bpm;
    const progression = MusicTheory.getChordProgression(scale, mood);
    const barsPerChord = 2;
    const beatsPerBar = 4;

    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.5;
    bassGain.connect(destination);

    const totalBeats = Math.ceil(duration / beatDuration);
    const scaleNotes = MusicTheory.getScaleNotes(key, scale, 2, 2);

    for (let beat = 0; beat < totalBeats; beat++) {
      const time = beat * beatDuration;
      if (time >= duration) break;

      const chordIndex = Math.floor(beat / (beatsPerBar * barsPerChord)) % progression.length;
      const chordDegree = progression[chordIndex];
      const rootNote = scaleNotes[chordDegree % scaleNotes.length];
      const bassNote = rootNote - 12; // One octave below

      const freq = MusicTheory.midiToFreq(bassNote);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 2;

      // Envelope
      const isAccent = beat % beatsPerBar === 0;
      const peakGain = isAccent ? 0.6 : 0.4;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(peakGain, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bassGain);

      osc.start(time);
      osc.stop(time + beatDuration);
    }
  }

  /**
   * Render chord/pad track
   */
  private async renderChords(ctx: OfflineAudioContext, destination: AudioNode, reverb: ConvolverNode): Promise<void> {
    const { key, scale, bpm, mood, duration, genre } = this.config;
    const beatDuration = 60 / bpm;
    const progression = MusicTheory.getChordProgression(scale, mood);
    const barsPerChord = genre === 'ambient' ? 4 : 2;
    const beatsPerBar = 4;

    const chordGain = ctx.createGain();
    chordGain.gain.value = genre === 'ambient' ? 0.3 : 0.25;
    chordGain.connect(destination);
    chordGain.connect(reverb);

    const scaleNotes = MusicTheory.getScaleNotes(key, scale, 3, 2);
    const totalBeats = Math.ceil(duration / beatDuration);

    for (let beat = 0; beat < totalBeats; beat += barsPerChord * beatsPerBar) {
      const time = beat * beatDuration;
      if (time >= duration) break;

      const chordIndex = Math.floor(beat / (barsPerChord * beatsPerBar)) % progression.length;
      const chordDegree = progression[chordIndex];
      const chordNotes = MusicTheory.getChordNotes(key, scale, chordDegree, 3);

      const chordDuration = barsPerChord * beatsPerBar * beatDuration;

      for (const noteMidi of chordNotes) {
        const freq = MusicTheory.midiToFreq(noteMidi);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = genre === 'ambient' || genre === 'cinematic' ? 'sine' : 'triangle';
        osc.frequency.value = freq;

        // Soft attack, sustained, soft release
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
        gain.gain.setValueAtTime(0.3, time + chordDuration - 0.2);
        gain.gain.linearRampToValueAtTime(0, time + chordDuration);

        osc.connect(gain);
        gain.connect(chordGain);

        osc.start(time);
        osc.stop(time + chordDuration);
      }
    }
  }

  /**
   * Render pad/atmosphere track
   */
  private async renderPad(ctx: OfflineAudioContext, destination: AudioNode, reverb: ConvolverNode): Promise<void> {
    const { key, scale, bpm, mood, duration, genre } = this.config;

    // Only add pad for certain genres/moods
    if (!['ambient', 'cinematic', 'calm', 'mysterious', 'romantic', 'melancholic'].includes(genre) &&
        !['calm', 'mysterious', 'romantic', 'melancholic', 'dark'].includes(mood)) {
      return;
    }

    const padGain = ctx.createGain();
    padGain.gain.value = 0.15;
    padGain.connect(destination);
    padGain.connect(reverb);

    const rootFreq = MusicTheory.midiToFreq(MusicTheory.getRootMidi(key, 3));
    const fifthFreq = rootFreq * 1.5;

    // Create evolving pad with two detuned oscillators
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'sine';

    osc1.frequency.value = rootFreq;
    osc2.frequency.value = rootFreq * 1.005; // Slight detune for warmth
    osc3.frequency.value = fifthFreq;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    // LFO for filter modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.1; // Slow modulation
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const envGain = ctx.createGain();
    envGain.gain.value = 0;

    // Fade in/out
    envGain.gain.setValueAtTime(0, 0);
    envGain.gain.linearRampToValueAtTime(1, 2);
    envGain.gain.setValueAtTime(1, duration - 3);
    envGain.gain.linearRampToValueAtTime(0, duration);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(envGain);
    envGain.connect(padGain);

    osc1.start(0);
    osc2.start(0);
    osc3.start(0);
    lfo.start(0);

    osc1.stop(duration);
    osc2.stop(duration);
    osc3.stop(duration);
    lfo.stop(duration);
  }

  /**
   * Render melody track
   */
  private async renderMelody(ctx: OfflineAudioContext, destination: AudioNode, reverb: ConvolverNode): Promise<void> {
    const { key, scale, bpm, mood, duration, genre } = this.config;

    // Skip melody for ambient
    if (genre === 'ambient') return;

    const melodyGain = ctx.createGain();
    melodyGain.gain.value = 0.3;
    melodyGain.connect(destination);
    melodyGain.connect(reverb);

    const beatDuration = 60 / bpm;
    const sixteenthDuration = beatDuration / 4;
    const scaleNotes = MusicTheory.getScaleNotes(key, scale, 4, 2);
    const pattern = MusicTheory.generateMelodyPattern(scale, mood, 64);

    // Melody plays in sections (not continuous)
    const sectionLength = 16; // 16 sixteenth notes = 1 bar
    const totalSixteenths = Math.floor(duration / sixteenthDuration);

    for (let i = 0; i < Math.min(pattern.length * 4, totalSixteenths); i++) {
      const time = i * sixteenthDuration;
      if (time >= duration) break;

      // Skip some notes for more interesting rhythm
      if (Math.random() > 0.6 && i % 2 !== 0) continue;

      const noteIndex = pattern[i % pattern.length];
      const midiNote = scaleNotes[noteIndex % scaleNotes.length];
      const freq = MusicTheory.midiToFreq(midiNote);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Different timbres based on genre
      switch (genre) {
        case 'electronic':
          osc.type = 'square';
          break;
        case 'rock':
          osc.type = 'sawtooth';
          break;
        case 'jazz':
          osc.type = 'triangle';
          break;
        default:
          osc.type = 'sine';
      }

      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = genre === 'electronic' ? 3000 : 2000;

      // Note envelope
      const noteDuration = sixteenthDuration * (Math.random() > 0.7 ? 2 : 1);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.4, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(melodyGain);

      osc.start(time);
      osc.stop(time + noteDuration);
    }
  }
}
