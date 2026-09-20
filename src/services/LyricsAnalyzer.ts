// ==========================================
// Lyrics Analyzer - Sentiment & Mood Detection
// ==========================================

import { Mood, Genre, MusicalKey, Scale } from '../models/types';

interface LyricsAnalysis {
  mood: Mood;
  suggestedGenre: Genre;
  suggestedKey: MusicalKey;
  suggestedScale: Scale;
  suggestedBPM: number;
  suggestedInstruments: string[];
  emotionalIntensity: number; // 0-1
  themes: string[];
}

// Emotion keywords mapping
const EMOTION_KEYWORDS: Record<Mood, string[]> = {
  happy: ['happy', 'joy', 'smile', 'laugh', 'celebrate', 'dance', 'sun', 'bright', 'love', 'beautiful', 'wonderful', 'amazing', 'great', 'good', 'yes', 'yeah', 'شاد', 'خوشحال', 'خنده', 'رقص', 'عشق', 'زیبا'],
  sad: ['sad', 'cry', 'tears', 'alone', 'broken', 'hurt', 'pain', 'lost', 'miss', 'gone', 'goodbye', 'never', 'sorry', 'regret', 'غم', 'تنها', 'دلتنگ', 'اشک', 'درد', 'رفتن'],
  energetic: ['run', 'fast', 'power', 'strong', 'fight', 'fire', 'wild', 'crazy', 'loud', 'move', 'jump', 'energy', 'fast', 'energetic', 'قدرت', 'دویدن', 'آتش', 'وحشی', 'دیوانه'],
  calm: ['peace', 'quiet', 'still', 'gentle', 'soft', 'slow', 'dream', 'rest', 'calm', 'serene', 'tranquil', 'آرام', 'سکوت', 'نرم', 'آهسته', 'رویا', 'صلح'],
  dark: ['dark', 'shadow', 'night', 'black', 'death', 'fear', 'evil', 'demon', 'hell', 'blood', 'torture', 'nightmare', 'تاریک', 'سایه', 'شب', 'مرگ', 'ترس', 'خون'],
  romantic: ['love', 'heart', 'kiss', 'touch', 'hold', 'forever', 'together', 'baby', 'darling', 'sweet', 'desire', 'passion', 'عشق', 'قلب', 'بوسه', 'لمس', 'همیشه', 'عزیز'],
  epic: ['glory', 'hero', 'war', 'battle', 'victory', 'king', 'queen', 'empire', 'legend', 'destiny', 'fate', 'power', 'شکوه', 'قهرمان', 'جنگ', 'پیروزی', 'افسانه'],
  melancholic: ['melancholy', 'nostalgia', 'memory', 'past', 'remember', 'fade', 'fading', 'distant', 'fading', 'gone', 'nostalgic', 'wistful', 'دلتنگی', 'خاطره', 'گذشته', 'محو'],
  uplifting: ['rise', 'fly', 'soar', 'hope', 'believe', 'dream', 'future', 'better', 'change', 'grow', 'stronger', 'بالا', 'پرواز', 'امید', 'باور', 'رؤیا', 'آینده'],
  mysterious: ['mystery', 'secret', 'unknown', 'hidden', 'whisper', 'shadow', 'strange', 'weird', 'magic', 'enchant', 'راز', 'مخفی', 'ناشناخته', 'نجوا', 'جادو'],
};

// Genre indicators
const GENRE_INDICATORS: Record<Genre, string[]> = {
  pop: ['love', 'dance', 'party', 'fun', 'happy', 'heart', 'baby'],
  rock: ['power', 'fight', 'rebel', 'strong', 'loud', 'wild', 'freedom'],
  electronic: ['dance', 'move', 'night', 'party', 'energy', 'beat', 'rhythm'],
  hiphop: ['street', 'flow', 'rhyme', 'real', 'truth', 'story', 'life'],
  jazz: ['smooth', 'night', 'cool', 'swing', 'blue', 'soul', 'mellow'],
  classical: ['elegant', 'grand', 'majestic', 'beautiful', 'orchestra', 'symphony'],
  indian: ['raga', 'sitar', 'tabla', 'desi', 'bollywood', 'punjabi', 'هندی', 'رقص', 'بالیوود'],
  latin: ['fiesta', 'dance', 'rhythm', ' caliente', 'salsa', 'reggaeton', 'tropical'],
  rnb: ['love', 'soul', 'smooth', 'sexy', 'feel', 'emotion', 'vibe'],
  folk: ['story', 'home', 'land', 'tradition', 'simple', 'acoustic', 'nature'],
  cinematic: ['epic', 'dramatic', 'powerful', 'emotional', 'grand', 'majestic', 'heroic'],
  ambient: ['peace', 'calm', 'atmosphere', 'space', 'dream', 'ethereal', 'meditation'],
};

// Instrument suggestions based on mood
const MOOD_INSTRUMENTS: Record<Mood, string[]> = {
  happy: ['guitar', 'piano', 'drums', 'bass', 'synth'],
  sad: ['piano', 'strings', 'acoustic guitar', 'cello'],
  energetic: ['drums', 'electric guitar', 'bass', 'synth', 'percussion'],
  calm: ['acoustic guitar', 'piano', 'strings', 'flute', 'ambient pads'],
  dark: ['bass', 'distorted guitar', 'synth', 'drums', 'strings'],
  romantic: ['piano', 'acoustic guitar', 'strings', 'soft drums'],
  epic: ['orchestra', 'drums', 'brass', 'strings', 'choir', 'timpani'],
  melancholic: ['piano', 'acoustic guitar', 'strings', 'soft pads'],
  uplifting: ['piano', 'guitar', 'strings', 'drums', 'synth'],
  mysterious: ['synth', 'ambient pads', 'strings', 'piano', 'percussion'],
};

export class LyricsAnalyzer {
  /**
   * Analyze lyrics and suggest music parameters
   */
  static analyze(lyrics: string): LyricsAnalysis {
    const lowerLyrics = lyrics.toLowerCase();
    const words = lowerLyrics.split(/\s+/);
    
    // Count emotion keywords
    const emotionScores: Record<Mood, number> = {} as Record<Mood, number>;
    Object.keys(EMOTION_KEYWORDS).forEach((mood) => {
      const keywords = EMOTION_KEYWORDS[mood as Mood];
      let score = 0;
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerLyrics.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      emotionScores[mood as Mood] = score;
    });

    // Find dominant mood
    const dominantMood = this.getDominantMood(emotionScores);
    
    // Calculate emotional intensity (0-1)
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = words.length * 0.3; // 30% of words as keywords
    const emotionalIntensity = Math.min(1, totalScore / maxPossibleScore);

    // Suggest genre based on mood and keywords
    const suggestedGenre = this.suggestGenre(lowerLyrics, dominantMood);
    
    // Suggest musical key and scale
    const { key, scale } = this.suggestKeyAndScale(dominantMood);
    
    // Suggest BPM
    const suggestedBPM = this.suggestBPM(dominantMood, emotionalIntensity);
    
    // Suggest instruments
    const suggestedInstruments = MOOD_INSTRUMENTS[dominantMood];

    // Extract themes
    const themes = this.extractThemes(lowerLyrics);

    return {
      mood: dominantMood,
      suggestedGenre,
      suggestedKey: key,
      suggestedScale: scale,
      suggestedBPM,
      suggestedInstruments,
      emotionalIntensity,
      themes,
    };
  }

  private static getDominantMood(scores: Record<Mood, number>): Mood {
    let maxScore = 0;
    let dominantMood: Mood = 'happy'; // default

    Object.entries(scores).forEach(([mood, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantMood = mood as Mood;
      }
    });

    // If no strong emotion detected, default to calm
    if (maxScore === 0) {
      return 'calm';
    }

    return dominantMood;
  }

  private static suggestGenre(lyrics: string, mood: Mood): Genre {
    const genreScores: Record<Genre, number> = {} as Record<Genre, number>;
    
    // Count genre indicators
    Object.entries(GENRE_INDICATORS).forEach(([genre, keywords]) => {
      let score = 0;
      keywords.forEach((keyword) => {
        if (lyrics.includes(keyword)) {
          score++;
        }
      });
      genreScores[genre as Genre] = score;
    });

    // Find dominant genre
    let maxScore = 0;
    let suggestedGenre: Genre = 'pop'; // default

    Object.entries(genreScores).forEach(([genre, score]) => {
      if (score > maxScore) {
        maxScore = score;
        suggestedGenre = genre as Genre;
      }
    });

    // If no genre indicator found, suggest based on mood
    if (maxScore === 0) {
      const moodToGenre: Record<Mood, Genre> = {
        happy: 'pop',
        sad: 'rnb',
        energetic: 'electronic',
        calm: 'ambient',
        dark: 'rock',
        romantic: 'rnb',
        epic: 'cinematic',
        melancholic: 'folk',
        uplifting: 'pop',
        mysterious: 'ambient',
      };
      suggestedGenre = moodToGenre[mood];
    }

    return suggestedGenre;
  }

  private static suggestKeyAndScale(mood: Mood): { key: MusicalKey; scale: Scale } {
    const moodToKey: Record<Mood, { key: MusicalKey; scale: Scale }> = {
      happy: { key: 'C', scale: 'major' },
      sad: { key: 'A', scale: 'minor' },
      energetic: { key: 'E', scale: 'major' },
      calm: { key: 'F', scale: 'major' },
      dark: { key: 'D', scale: 'minor' },
      romantic: { key: 'G', scale: 'major' },
      epic: { key: 'D', scale: 'major' },
      melancholic: { key: 'E', scale: 'minor' },
      uplifting: { key: 'G', scale: 'major' },
      mysterious: { key: 'A', scale: 'minor' },
    };

    return moodToKey[mood];
  }

  private static suggestBPM(mood: Mood, intensity: number): number {
    const baseBPM: Record<Mood, number> = {
      happy: 120,
      sad: 80,
      energetic: 140,
      calm: 70,
      dark: 90,
      romantic: 95,
      epic: 110,
      melancholic: 75,
      uplifting: 125,
      mysterious: 85,
    };

    const base = baseBPM[mood];
    // Adjust BPM based on intensity (±15 BPM)
    const adjustment = (intensity - 0.5) * 30;
    return Math.round(base + adjustment);
  }

  private static extractThemes(lyrics: string): string[] {
    const themes: string[] = [];
    
    const themePatterns: Record<string, RegExp> = {
      love: /\b(love|heart|kiss|touch|forever|together|عشق|قلب)\b/gi,
      loss: /\b(lost|gone|miss|goodbye|never|alone|تنها|رفتن|دلتنگ)\b/gi,
      hope: /\b(hope|dream|believe|future|better|rise|fly|امید|رویا|باور)\b/gi,
      pain: /\b(pain|hurt|broken|tears|cry|suffer|درد|اشک|گریه)\b/gi,
      joy: /\b(joy|happy|smile|laugh|celebrate|dance|شاد|خوشحال|خنده)\b/gi,
      anger: /\b(angry|rage|fight|war|destroy|hate|خشم|جنگ|نفرت)\b/gi,
      nature: /\b(sun|moon|star|sky|ocean|river|tree|flower|آسمان|دریا|گل)\b/gi,
      night: /\b(night|dark|shadow|moon|dream|sleep|شب|تاریک|خواب)\b/gi,
    };

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(lyrics)) {
        themes.push(theme);
      }
    });

    return themes;
  }

  /**
   * Get suggested parameters for music generation
   */
  static getSuggestedParameters(lyrics: string) {
    const analysis = this.analyze(lyrics);
    
    return {
      mood: analysis.mood,
      genre: analysis.suggestedGenre,
      bpm: analysis.suggestedBPM,
      key: analysis.suggestedKey,
      scale: analysis.suggestedScale,
      instruments: analysis.suggestedInstruments,
      emotionalIntensity: analysis.emotionalIntensity,
      themes: analysis.themes,
    };
  }
}
