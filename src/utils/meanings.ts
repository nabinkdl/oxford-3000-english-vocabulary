import { MeaningLanguage, MeaningLanguageOption } from '../types/vocab';

export const MEANING_LANGUAGES: MeaningLanguageOption[] = [
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली' },
  { code: 'zh-CN', label: 'Mandarin Chinese', nativeLabel: '中文' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'ar', label: 'Standard Arabic', nativeLabel: 'العربية' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
];

/**
 * Script-aware font class for a meaning language.
 *
 * The bundled font stack only covers Latin and Devanagari, so CJK, Arabic and
 * Bengali need their own Noto families to render correctly.
 */
export function getMeaningFontClass(language: MeaningLanguage): string {
  switch (language) {
    case 'ne':
    case 'hi':
      return 'font-nepali';
    case 'zh-CN':
      return 'font-hanzi';
    case 'ar':
    case 'ur':
      return 'font-arabic';
    case 'bn':
      return 'font-bengali';
    default:
      return 'font-latin';
  }
}

/** English label for a meaning language, e.g. "Nepali". */
export function getMeaningLanguageLabel(language: MeaningLanguage): string {
  return MEANING_LANGUAGES.find((option) => option.code === language)?.label ?? 'Nepali';
}

/** Native label for a meaning language, e.g. "नेपाली". */
export function getMeaningNativeLabel(language: MeaningLanguage): string {
  return MEANING_LANGUAGES.find((option) => option.code === language)?.nativeLabel ?? 'नेपाली';
}

const CACHE_KEY = 'oxford3000_meanings_v1';
const LANGUAGE_KEY = 'oxford3000_meaning_language_v1';
type MeaningCache = Record<string, string>;

export function loadMeaningLanguage(): MeaningLanguage {
  if (typeof window === 'undefined') return 'ne';

  const saved = localStorage.getItem(LANGUAGE_KEY) as MeaningLanguage | null;
  return MEANING_LANGUAGES.some((option) => option.code === saved) ? saved! : 'ne';
}

export function saveMeaningLanguage(language: MeaningLanguage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_KEY, language);
}

// In-memory mirror of the localStorage cache.
//
// Without this, every getMeaning() call re-parsed the entire JSON blob from
// localStorage. During quiz generation that meant thousands of synchronous
// JSON.parse calls on a multi-megabyte object, which blocked the main thread
// and dominated the load time.
let memoryCache: MeaningCache | null = null;
let saveTimer: number | null = null;

function loadCache(): MeaningCache {
  if (typeof window === 'undefined') return {};
  if (memoryCache) return memoryCache;
  try {
    memoryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as MeaningCache;
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

function saveCache(cache: MeaningCache) {
  memoryCache = cache;
  if (typeof window === 'undefined') return;
  // Debounce writes: bulk translation used to fire one localStorage.setItem
  // per word, which is both slow and can exhaust the storage quota.
  if (saveTimer !== null) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    } catch {
      // Translation remains available for the current session if storage is full.
    }
  }, 400);
}

function cacheKey(word: string, language: MeaningLanguage): string {
  return `${language}:${word.toLowerCase()}`;
}

/**
 * Synchronous cache lookup.
 *
 * Callers that need an instant value (quiz options, word lists) can render the
 * cached translation immediately and fall back to bundled Nepali while a
 * network translation is in flight.
 */
export function getCachedMeaning(
  word: string,
  nepali: string,
  language: MeaningLanguage
): string {
  if (language === 'ne') return nepali;
  return loadCache()[cacheKey(word, language)] ?? nepali;
}

/**
 * In-flight translation requests, keyed by cache key.
 *
 * Quiz generation asks for the same word as both a target and a distractor, and
 * the table view can mount many MeaningText cells at once. Deduplicating means
 * one network request per unique word instead of one per call site.
 */
const inFlight = new Map<string, Promise<string>>();

async function translateWord(word: string, language: MeaningLanguage): Promise<string> {
  let translated = '';

  try {
    const response = await fetch(
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${language}&q=${encodeURIComponent(word)}`
    );
    if (response.ok) {
      const data = (await response.json()) as unknown;
      if (Array.isArray(data) && typeof data[0] === 'string') {
        translated = data[0].trim();
      } else if (Array.isArray(data) && Array.isArray(data[0])) {
        translated = data[0]
          .filter((segment): segment is string[] => Array.isArray(segment) && typeof segment[0] === 'string')
          .map((segment) => segment[0])
          .join('')
          .trim();
      }
    }
  } catch {
    // Try the secondary provider below when Google TTS/Translate is unavailable.
  }

  if (!translated) {
    try {
      const fallbackResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${language}`
      );
      if (fallbackResponse.ok) {
        const fallbackData = (await fallbackResponse.json()) as {
          responseData?: { translatedText?: string };
        };
        translated = fallbackData.responseData?.translatedText?.trim() || '';
      }
    } catch {
      // Use the bundled Nepali meaning when the device is offline.
    }
  }

  return translated;
}

export function getMeaning(
  word: string,
  nepali: string,
  language: MeaningLanguage
): Promise<string> {
  if (language === 'ne') return Promise.resolve(nepali);

  const key = cacheKey(word, language);
  const cached = loadCache()[key];
  if (cached) return Promise.resolve(cached);

  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = translateWord(word, language)
    .then((translated) => {
      if (!translated) return nepali;
      const cache = loadCache();
      cache[key] = translated;
      saveCache(cache);
      return translated;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}