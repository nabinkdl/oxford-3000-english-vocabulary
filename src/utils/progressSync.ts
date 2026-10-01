import { MeaningLanguage, QuizStats } from '../types/vocab';
import { supabase } from './supabase';

export interface ProgressSnapshot {
  checkedIds: Set<string>;
  starredIds: Set<string>;
  quizStats: QuizStats;
  meaningLanguage: MeaningLanguage;
}

interface ProgressRow {
  checked_ids: string[] | null;
  starred_ids: string[] | null;
  quiz_stats: QuizStats | null;
  meaning_language: MeaningLanguage | null;
}

export async function loadRemoteProgress(userId: string): Promise<ProgressSnapshot | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('checked_ids, starred_ids, quiz_stats, meaning_language')
    .eq('user_id', userId)
    .maybeSingle<ProgressRow>();

  if (error) {
    console.error('Failed to load cloud progress:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    checkedIds: new Set(data.checked_ids || []),
    starredIds: new Set(data.starred_ids || []),
    quizStats: data.quiz_stats || {
      quizzesPlayed: 0,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      bestStreak: 0,
      currentStreak: 0,
      lastPlayedTimestamp: 0,
      recentScores: [],
    },
    meaningLanguage: data.meaning_language || 'ne',
  };
}

export async function saveRemoteProgress(
  userId: string,
  progress: ProgressSnapshot
): Promise<void> {
  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      checked_ids: Array.from(progress.checkedIds),
      starred_ids: Array.from(progress.starredIds),
      quiz_stats: progress.quizStats,
      meaning_language: progress.meaningLanguage,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to save cloud progress:', error.message);
  }
}

/**
 * Combine guest (localStorage) progress with existing cloud progress.
 *
 * Word lists are unioned so nothing a guest marked is lost, quiz stats keep the
 * best recorded values, and recent scores are concatenated newest-last. The
 * meaning language prefers whatever the account already had.
 */
export function mergeProgress(
  local: ProgressSnapshot,
  remote: ProgressSnapshot | null
): ProgressSnapshot {
  if (!remote) return local;

  const checkedIds = new Set<string>([...remote.checkedIds, ...local.checkedIds]);
  const starredIds = new Set<string>([...remote.starredIds, ...local.starredIds]);

  const recentScores = [...remote.quizStats.recentScores, ...local.quizStats.recentScores]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  return {
    checkedIds,
    starredIds,
    meaningLanguage: remote.meaningLanguage || local.meaningLanguage,
    quizStats: {
      quizzesPlayed: Math.max(remote.quizStats.quizzesPlayed, local.quizStats.quizzesPlayed),
      totalQuestionsAnswered: Math.max(
        remote.quizStats.totalQuestionsAnswered,
        local.quizStats.totalQuestionsAnswered
      ),
      totalCorrect: Math.max(remote.quizStats.totalCorrect, local.quizStats.totalCorrect),
      bestStreak: Math.max(remote.quizStats.bestStreak, local.quizStats.bestStreak),
      currentStreak: 0,
      lastPlayedTimestamp: Math.max(
        remote.quizStats.lastPlayedTimestamp,
        local.quizStats.lastPlayedTimestamp
      ),
      recentScores,
    },
  };
}
