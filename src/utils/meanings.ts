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

function loadCache(): MeaningCache {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as MeaningCache;
  } catch {
    return {};
  }
}

function saveCache(cache: MeaningCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Translation remains available for the current session if storage is full.
  }
}

export async function getMeaning(
  word: string,
  nepali: string,
  language: MeaningLanguage
): Promise<string> {
  if (language === 'ne') return nepali;

  const cache = loadCache();
  const key = `${language}:${word.toLowerCase()}`;
  if (cache[key]) return cache[key];

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
    const fallbackResponse = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${language}`
    );
    if (fallbackResponse.ok) {
      const fallbackData = (await fallbackResponse.json()) as {
        responseData?: { translatedText?: string };
      };
      translated = fallbackData.responseData?.translatedText?.trim() || '';
    }
  }

  if (!translated) throw new Error('Translation was unavailable');

  cache[key] = translated;
  saveCache(cache);
  return translated;
}