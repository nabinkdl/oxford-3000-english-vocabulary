export interface WordItem {
  id: string;
  word: string;
  type: string;
  level: string;
  english: string;
  nepali: string;
  letter: string;
}

export type MeaningLanguage =
  | 'ne'
  | 'zh-CN'
  | 'hi'
  | 'es'
  | 'ar'
  | 'fr'
  | 'bn'
  | 'pt'
  | 'ru'
  | 'id'
  | 'ur';

export interface MeaningLanguageOption {
  code: MeaningLanguage;
  label: string;
  nativeLabel: string;
}

export type ViewMode = 'table' | 'flashcards' | 'quiz' | 'analytics';
export type FilterStatus = 'all' | 'checked' | 'unchecked' | 'starred';
export type CEFRFilter = 'ALL' | 'A1' | 'A2' | 'B1' | 'B2';

export interface QuizStats {
  quizzesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  currentStreak: number;
  lastPlayedTimestamp: number;
  recentScores: { date: string; score: number; total: number }[];
}
