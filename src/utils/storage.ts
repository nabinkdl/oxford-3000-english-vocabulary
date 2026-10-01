import { QuizStats } from '../types/vocab';

const STORAGE_KEY_CHECKED = 'oxford3000_checked_words_v2';
const STORAGE_KEY_STARRED = 'oxford3000_starred_words_v1';
const STORAGE_KEY_QUIZ_STATS = 'oxford3000_quiz_stats_v1';
const LEGACY_STORAGE_KEY = 'oxford3000_letters_v1';

export function loadCheckedWordIds(): Set<string> {
  const result = new Set<string>();
  if (typeof window === 'undefined') return result;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CHECKED);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) {
        arr.forEach((id) => result.add(id));
        return result;
      }
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const obj = JSON.parse(legacy);
      Object.keys(obj).forEach((letter) => {
        const indices = obj[letter];
        if (Array.isArray(indices)) {
          indices.forEach((idx) => result.add(`${letter}-${idx}`));
        }
      });
    }
  } catch (err) {
    console.error('Failed to load checked words:', err);
  }
  return result;
}

export function saveCheckedWordIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHECKED, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Failed to save checked words:', err);
  }
}

export function loadStarredWordIds(): Set<string> {
  const result = new Set<string>();
  if (typeof window === 'undefined') return result;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_STARRED);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) {
        arr.forEach((id) => result.add(id));
      }
    }
  } catch (err) {
    console.error('Failed to load starred words:', err);
  }
  return result;
}

export function saveStarredWordIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STARRED, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Failed to save starred words:', err);
  }
}

export function loadQuizStats(): QuizStats {
  const defaultStats: QuizStats = {
    quizzesPlayed: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
    lastPlayedTimestamp: 0,
    recentScores: [],
  };

  if (typeof window === 'undefined') return defaultStats;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZ_STATS);
    if (raw) {
      return { ...defaultStats, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load quiz stats:', err);
  }
  return defaultStats;
}

export function saveQuizStats(stats: QuizStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_QUIZ_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save quiz stats:', err);
  }
}
