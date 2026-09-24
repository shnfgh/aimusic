// ==========================================
// Music Theory Utilities
// ==========================================

import { MusicalKey, Scale } from '../models/types';

// Note names to semitone offsets from C
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
};

// Scale intervals (semitones from root)
const SCALE_INTERVALS: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

// Chord types (intervals from root)
export const CHORD_TYPES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  seventh: [0, 4, 7, 10],
  majorSeventh: [0, 4, 7, 11],
  minorSeventh: [0, 3, 7, 10],
};

export class MusicTheory {
  /**
   * Get the root MIDI note number for a given key and octave
   */
  static getRootMidi(key: MusicalKey, octave: number = 4): number {
    return NOTE_SEMITONES[key] + (octave + 1) * 12;
  }

  /**
   * Convert MIDI note to frequency in Hz
   */
  static midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Get all notes in a scale
   */
  static getScaleNotes(key: MusicalKey, scale: Scale, octave: number = 4, numOctaves: number = 2): number[] {
    const root = this.getRootMidi(key, octave);
    const intervals = SCALE_INTERVALS[scale];
    const notes: number[] = [];

    for (let oct = 0; oct < numOctaves; oct++) {
      for (const interval of intervals) {
        notes.push(root + interval + oct * 12);
      }
    }
    notes.push(root + numOctaves * 12); // Add the octave note

    return notes;
  }

  /**
   * Get chord notes for a scale degree
   */
  static getChordNotes(key: MusicalKey, scale: Scale, degree: number, octave: number = 3): number[] {
    const scaleNotes = this.getScaleNotes(key, scale, octave, 1);
    const chordType = this.getChordTypeForDegree(scale, degree);
    const rootNote = scaleNotes[degree % scaleNotes.length];

    return CHORD_TYPES[chordType].map(interval => rootNote + interval);
  }

  /**
   * Get chord type for a scale degree
   */
  static getChordTypeForDegree(scale: Scale, degree: number): keyof typeof CHORD_TYPES {
    const degreePatterns: Record<Scale, (keyof typeof CHORD_TYPES)[]> = {
      major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
      minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
      dorian: ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
      mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
      phrygian: ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
    };

    const pattern = degreePatterns[scale];
    return pattern[degree % pattern.length];
  }

  /**
   * Get common chord progressions for a mood
   */
  static getChordProgression(scale: Scale, mood: string): number[] {
    const progressions: Record<string, number[]> = {
      happy: [0, 3, 4, 0],        // I - IV - V - I
      sad: [0, 5, 3, 4],          // i - VI - IV - V
      energetic: [0, 4, 5, 3],    // I - V - VI - IV
      calm: [0, 2, 4, 0],         // I - iii - V - I
      dark: [0, 5, 6, 4],         // i - VI - VII - V
      romantic: [0, 5, 3, 4],     // I - vi - IV - V
      epic: [0, 3, 5, 4],         // I - IV - vi - V
      melancholic: [0, 3, 5, 6],  // i - iv - VI - VII
      uplifting: [0, 4, 5, 3],    // I - V - vi - IV
      mysterious: [0, 6, 3, 5],   // i - VII - iv - VI
    };

    return progressions[mood] || progressions.happy;
  }

  /**
   * Generate a melody pattern based on mood
   */
  static generateMelodyPattern(scale: Scale, mood: string, length: number = 16): number[] {
    const scaleLength = SCALE_INTERVALS[scale].length;
    const pattern: number[] = [];

    const moodPatterns: Record<string, () => number> = {
      happy: () => Math.floor(Math.random() * 5), // Stay in upper range
      sad: () => Math.floor(Math.random() * 3),   // Lower range
      energetic: () => Math.floor(Math.random() * scaleLength), // Full range, fast
      calm: () => Math.floor(Math.random() * 4),  // Limited range
      dark: () => Math.floor(Math.random() * 3),  // Low, with jumps
      romantic: () => Math.floor(Math.random() * 5), // Mid range, smooth
      epic: () => Math.floor(Math.random() * scaleLength), // Full range, dramatic
      melancholic: () => Math.floor(Math.random() * 4), // Descending tendency
      uplifting: () => Math.min(scaleLength - 1, Math.floor(Math.random() * 6)), // Ascending
      mysterious: () => Math.floor(Math.random() * scaleLength), // Chromatic movement
    };

    const generator = moodPatterns[mood] || moodPatterns.happy;

    for (let i = 0; i < length; i++) {
      pattern.push(generator());
    }

    return pattern;
  }

  /**
   * Generate drum pattern based on genre
   */
  static generateDrumPattern(genre: string, bpm: number): { kick: boolean[]; snare: boolean[]; hihat: boolean[] } {
    const steps = 16;
    const kick = new Array(steps).fill(false);
    const snare = new Array(steps).fill(false);
    const hihat = new Array(steps).fill(false);

    switch (genre) {
      case 'pop':
        [0, 8].forEach(i => kick[i] = true);
        [4, 12].forEach(i => snare[i] = true);
        for (let i = 0; i < steps; i += 2) hihat[i] = true;
        break;
      case 'rock':
        [0, 6, 8, 14].forEach(i => kick[i] = true);
        [4, 12].forEach(i => snare[i] = true);
        for (let i = 0; i < steps; i += 2) hihat[i] = true;
        break;
      case 'electronic':
        [0, 4, 8, 12].forEach(i => kick[i] = true);
        [4, 12].forEach(i => snare[i] = true);
        for (let i = 0; i < steps; i++) hihat[i] = true;
        break;
      case 'hiphop':
        [0, 5, 8, 13].forEach(i => kick[i] = true);
        [4, 12].forEach(i => snare[i] = true);
        [2, 6, 10, 14].forEach(i => hihat[i] = true);
        break;
      case 'jazz':
        [0, 7, 11].forEach(i => kick[i] = true);
        [5, 13].forEach(i => snare[i] = true);
        [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => hihat[i] = true);
        break;
      case 'indian':
        [0, 3, 6, 10, 12].forEach(i => kick[i] = true);
        [4, 8, 14].forEach(i => snare[i] = true);
        [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => hihat[i] = true);
        break;
      case 'cinematic':
        [0, 12].forEach(i => kick[i] = true);
        [8].forEach(i => snare[i] = true);
        [0, 4, 8, 12].forEach(i => hihat[i] = true);
        break;
      case 'ambient':
        [0, 12].forEach(i => kick[i] = true);
        // Minimal drums
        break;
      default:
        [0, 8].forEach(i => kick[i] = true);
        [4, 12].forEach(i => snare[i] = true);
        for (let i = 0; i < steps; i += 2) hihat[i] = true;
    }

    return { kick, snare, hihat };
  }

  /**
   * Get bass pattern based on chord root
   */
  static generateBassPattern(rootNote: number, steps: number = 16, genre: string = 'pop'): number[] {
    const pattern: number[] = [];
    const octaveBelow = rootNote - 12;

    for (let i = 0; i < steps; i++) {
      if (genre === 'electronic' || genre === 'hiphop') {
        pattern.push(i % 4 === 0 ? octaveBelow : octaveBelow + (Math.random() > 0.7 ? 7 : 0));
      } else if (genre === 'jazz') {
        const walk = [0, 2, 4, 7];
        pattern.push(octaveBelow + walk[i % 4]);
      } else {
        pattern.push(i % 4 === 0 ? octaveBelow : octaveBelow);
      }
    }

    return pattern;
  }
}
