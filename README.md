# FARQAR AI Music Studio

## 🎵 AI-Powered Music Generation Studio

یک استودیوی تولید موسیقی با هوش مصنوعی که می‌تواند بر اساس متن ترانه، حال و هوا و احساسات آن را تحلیل کند و موسیقی مناسب تولید کند.

---

## ✨ ویژگی‌های اصلی

### 🧠 تحلیل هوشمند متن ترانه
- **تشخیص خودکار احساسات**: سیستم متن ترانه را تحلیل می‌کند و احساسات غالب (شاد، غمگین، پرانرژی، آرام، تاریک، عاشقانه، حماسی و...) را تشخیص می‌دهد
- **پیشنهاد پارامترهای موسیقی**: بر اساس تحلیل متن، پارامترهای مناسب مانند:
  - Mood (حال و هوا)
  - Genre (ژانر)
  - BPM (سرعت)
  - Key & Scale (گام و مقیاس)
  - Instruments (سازهای پیشنهادی)
  - Themes (مضامین شناسایی شده)
- **Auto-Suggest**: قابلیت فعال/غیرفعال کردن پیشنهاد خودکار

### 🎼 تولید موسیقی
- تولید کامل موسیقی با vocals و instruments
- پشتیبانی از ساختارهای مختلف (Intro, Verse, Chorus, Bridge, Outro)
- قابلیت Extend, Remix, Replace Section

### 🎛️ ویرایشگر حرفه‌ای
- Timeline چندآهنگه مشابه DAW
- کنترل Volume, Pan, Mute, Solo برای هر track
- مدیریت بخش‌ها (Sections)
- Mix Console

### 📦 Export
- خروجی Project به فرمت JSON
- آماده برای WAV, MP3, FLAC, Stems

---

## 🏗️ معماری

### ساختار پروژه
```
src/
├── models/
│   └── types.ts                    # مدل‌های داده
├── ai/
│   ├── MusicGenerationProvider.ts  # اینترفیس انتزاعی AI
│   ├── MockMusicProvider.ts        # پیاده‌سازی Mock
│   └── index.ts                    # ثبت کننده Providerها
├── audio/
│   └── AudioEngine.ts              # Web Audio API wrapper
├── services/
│   ├── LyricsAnalyzer.ts           # تحلیل احساسات متن
│   └── ProjectService.ts           # ذخیره/بارگذاری پروژه
├── stores/
│   └── useStudioStore.ts           # مدیریت state
├── components/
│   ├── layout/
│   ├── editor/
│   ├── timeline/
│   ├── player/
│   ├── inspector/
│   └── progress/
└── App.tsx
```

### AI Provider Architecture
سیستم از یک abstraction layer برای AI استفاده می‌کند:

```typescript
abstract class MusicGenerationProvider {
  abstract generateMusic(input: GenerationInput): Promise<GenerationJob>;
  abstract extendMusic(input: ExtendInput): Promise<GenerationJob>;
  abstract remixMusic(input: RemixInput): Promise<GenerationJob>;
  abstract generateVocals(input: VocalsInput): Promise<GenerationJob>;
  abstract separateStems(input: StemSeparationInput): Promise<GenerationJob>;
}
```

**پیاده‌سازی‌های موجود:**
- `MockMusicProvider`: شبیه‌سازی کامل فرآیند تولید برای توسعه

**قابل افزودن:**
- `RemoteMusicProvider`: اتصال به API خارجی
- `LocalMusicProvider`: اجرای مدل محلی با WebGPU/WASM
- `OpenSourceModelProvider`: اتصال به مدل‌های open source

---

## 🧠 Lyrics Analyzer - تحلیل هوشمند متن

### نحوه کار
فایل `src/services/LyricsAnalyzer.ts` یک سیستم rule-based برای تحلیل احساسات متن ترانه است:

1. **تشخیص کلمات کلیدی احساسی**:
   - کلمات مثبت (happy, love, celebrate...)
   - کلمات منفی (sad, cry, pain...)
   - کلمات پرانرژی (power, fire, wild...)
   - و...

2. **محاسبه امتیاز احساسات**:
   - هر احساس (mood) امتیازی بر اساس تعداد کلمات کلیدی دریافت می‌کند
   - احساس غالب انتخاب می‌شود

3. **پیشنهاد پارامترها**:
   - **Mood**: بر اساس احساس غالب
   - **Genre**: بر اساس کلمات کلیدی ژانر یا mood
   - **Key & Scale**: بر اساس mood (مثلاً minor برای غمگین)
   - **BPM**: بر اساس mood و شدت احساس
   - **Instruments**: بر اساس mood

### مثال
```typescript
import { LyricsAnalyzer } from './services/LyricsAnalyzer';

const lyrics = `
I'm walking through the shadows of my mind
Lost in memories I can't leave behind
The tears keep falling like the rain
Washing away all the pain
`;

const analysis = LyricsAnalyzer.analyze(lyrics);
// نتیجه:
// {
//   mood: 'sad',
//   suggestedGenre: 'rnb',
//   suggestedBPM: 80,
//   suggestedKey: 'A',
//   suggestedScale: 'minor',
//   suggestedInstruments: ['piano', 'strings', 'acoustic guitar', 'cello'],
//   emotionalIntensity: 0.75,
//   themes: ['loss', 'pain', 'night']
// }
```

### گسترش تحلیلگر
برای بهبود تحلیلگر:
1. افزودن کلمات کلیدی بیشتر به `EMOTION_KEYWORDS`
2. استفاده از NLP models (مثل sentiment analysis)
3. اتصال به API های تحلیل متن
4. استفاده از LLM برای تحلیل عمیق‌تر

---

## 🚀 نصب و اجرا

### نصب وابستگی‌ها
```bash
npm install
```

### اجرای development server
```bash
npm run dev
```

### Build برای production
```bash
npm run build
```

---

## 🔌 اتصال به مدل واقعی AI

### مرحله 1: ایجاد Provider جدید
```typescript
// src/ai/RemoteMusicProvider.ts
import { MusicGenerationProvider } from './MusicGenerationProvider';

export class RemoteMusicProvider extends MusicGenerationProvider {
  readonly name = 'RemoteProvider';
  readonly version = '1.0.0';

  async generateMusic(input: GenerationInput): Promise<GenerationJob> {
    const response = await fetch('/api/music/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    const job = await response.json();
    return job;
  }

  // ... سایر متدها
}
```

### مرحله 2: ثبت Provider
```typescript
// src/ai/index.ts
import { RemoteMusicProvider } from './RemoteMusicProvider';

export function getDefaultProvider(): MusicGenerationProvider {
  return new RemoteMusicProvider(); // تغییر از MockMusicProvider
}
```

### مرحله 3: Backend API
Backend باید این endpoint ها را پیاده‌سازی کند:
```
POST /api/music/generate
POST /api/music/extend
POST /api/music/remix
POST /api/music/vocals
POST /api/music/stems
GET /api/jobs/:jobId
```

---

## 🎯 ویژگی‌های آینده

- [ ] AI Mastering
- [ ] AI Mixing
- [ ] AI Lyrics Assistant
- [ ] Voice Conversion
- [ ] MIDI Generation
- [ ] Chord Detection
- [ ] Tempo Detection
- [ ] Audio-to-Music
- [ ] Real-time generation
- [ ] Collaborative projects

---

## 📝 نکات مهم

### امنیت
- ❌ API Key هرگز در Frontend قرار نگیرد
- ✅ تمام Secretها در Backend و Environment Variables

### کیفیت کد
- ✅ معماری modular و قابل توسعه
- ✅ جداسازی منطق AI از UI
- ✅ جداسازی منطق Audio از Components
- ✅ Type-safe با TypeScript
- ✅ Model-agnostic architecture

### حریم خصوصی
- ✅ ثبت Metadata برای هر Generation
- ✅ پشتیبانی از License و Copyright
- ✅ عدم استفاده از داده‌های متعلق به دیگران بدون مجوز

---

## 🤝 مشارکت

این پروژه یک MVP است و آماده برای گسترش. می‌توانید:
1. مدل‌های AI واقعی را متصل کنید
2. قابلیت‌های جدید اضافه کنید
3. UI/UX را بهبود دهید
4. Backend را پیاده‌سازی کنید

---

## 📄 لایسنس

این پروژه برای اهداف آموزشی و توسعه‌ای است. قبل از استفاده تجاری، مطمئن شوید که از مدل‌ها و داده‌های مجاز استفاده می‌کنید.

---

**ساخته شده با ❤️ برای جامعه موسیقی و AI**
