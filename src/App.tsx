import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { MeaningLanguage, WordItem, ViewMode, FilterStatus, CEFRFilter, QuizStats } from './types/vocab';
import { VOCAB_BY_LETTER, ALL_WORDS, TOTAL_WORD_COUNT } from './data/oxford3000';
import { loadMeaningLanguage, MEANING_LANGUAGES, saveMeaningLanguage } from './utils/meanings';
import { supabase } from './utils/supabase';
import {
  loadCheckedWordIds,
  saveCheckedWordIds,
  loadStarredWordIds,
  saveStarredWordIds,
  loadQuizStats,
  saveQuizStats,
} from './utils/storage';
import { Header } from './components/Header';
import { LetterNav } from './components/LetterNav';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { VocabTable } from './components/VocabTable';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { GameAnalyticsDashboard } from './components/GameAnalyticsDashboard';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { Toast } from './components/Toast';
import { AuthScreen } from './components/AuthScreen';
import { SupportModal } from './components/SupportModal';

interface Todo {
  id: number;
  name: string;
}

export default function App() {
  const [currentLetter, setCurrentLetter] = useState<string>('A'); // 'ALL' or 'A'-'Z'
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => loadCheckedWordIds());
  const [starredIds, setStarredIds] = useState<Set<string>>(() => loadStarredWordIds());
  const [quizStats, setQuizStats] = useState<QuizStats>(() => loadQuizStats());
  const [meaningLanguage, setMeaningLanguage] = useState<MeaningLanguage>(() => loadMeaningLanguage());
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [cefrFilter, setCefrFilter] = useState<CEFRFilter>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  const isTotal = currentLetter === 'ALL';

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
        if (event === 'SIGNED_OUT') setIsPasswordRecovery(false);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    saveCheckedWordIds(checkedIds);
  }, [checkedIds]);

  useEffect(() => {
    saveStarredWordIds(starredIds);
  }, [starredIds]);

  useEffect(() => {
    saveQuizStats(quizStats);
  }, [quizStats]);

  useEffect(() => {
    saveMeaningLanguage(meaningLanguage);
  }, [meaningLanguage]);

  // Load shared todos when the Supabase table is available.
  useEffect(() => {
    if (!session) {
      setTodos([]);
      return;
    }

    async function getTodos() {
      const { data, error } = await supabase.from('todos').select('id, name');

      if (error) {
        console.error('Failed to load Supabase todos:', error.message);
        return;
      }

      if (data) {
        setTodos(data as Todo[]);
      }
    }

    getTodos();
  }, [session]);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2000);
  };

  // Switch letter or TOTAL
  const handleSelectLetter = (letter: string) => {
    setCurrentLetter(letter);
    setSearchQuery('');
  };

  // Toggle Check/Mastered status
  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Mark single word mastered (used in Quiz view)
  const handleMarkMastered = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Record completed quiz in analytics
  const handleRecordQuizResult = (score: number, total: number) => {
    setQuizStats((prev) => {
      const isPerfect = score === total;
      const currentStreak = isPerfect ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);
      const today = new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      return {
        quizzesPlayed: prev.quizzesPlayed + 1,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + total,
        totalCorrect: prev.totalCorrect + score,
        currentStreak,
        bestStreak,
        lastPlayedTimestamp: Date.now(),
        recentScores: [...prev.recentScores.slice(-10), { date: today, score, total }],
      };
    });
    showToast(`Quiz completed: ${score}/${total} score recorded!`);
  };

  // Toggle Star / Favorite
  const handleToggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from starred');
      } else {
        next.add(id);
        showToast('Added to starred favorites');
      }
      return next;
    });
  };

  // Current scope pool of words
  const scopeWords = useMemo(() => {
    if (isTotal) return ALL_WORDS;
    return VOCAB_BY_LETTER[currentLetter] || [];
  }, [currentLetter, isTotal]);

  const scopeCheckedCount = useMemo(() => {
    return scopeWords.filter((w) => checkedIds.has(w.id)).length;
  }, [scopeWords, checkedIds]);

  const scopeRemainingCount = scopeWords.length - scopeCheckedCount;

  // Bulk: Check all in current scope (Letter or Total)
  const handleCheckAllCurrent = () => {
    if (isTotal) {
      if (window.confirm(`Mark all ${TOTAL_WORD_COUNT} words in Oxford 3000 as learned?`)) {
        setCheckedIds((prev) => {
          const next = new Set(prev);
          ALL_WORDS.forEach((w) => next.add(w.id));
          return next;
        });
        showToast(`✓ All ${TOTAL_WORD_COUNT} words marked as learned`);
      }
      return;
    }

    setCheckedIds((prev) => {
      const next = new Set(prev);
      scopeWords.forEach((w) => next.add(w.id));
      return next;
    });
    showToast(`✓ All ${scopeWords.length} words in Letter ${currentLetter} learned`);
  };

  // Open confirmation modal for scope reset (prevents accidental reset)
  const handleOpenResetModal = () => {
    setIsResetModalOpen(true);
  };

  // Confirmed reset action from modal
  const handleConfirmResetScope = () => {
    if (isTotal) {
      setCheckedIds(new Set());
      showToast(`↻ Reset progress for all ${TOTAL_WORD_COUNT} words`);
      return;
    }

    setCheckedIds((prev) => {
      const next = new Set(prev);
      scopeWords.forEach((w) => next.delete(w.id));
      return next;
    });
    showToast(`↻ Reset progress for Letter ${currentLetter}`);
  };

  // Filtered words
  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopeWords.filter((item) => {
      const isChecked = checkedIds.has(item.id);
      const isStarred = starredIds.has(item.id);

      // Status filter
      if (filterStatus === 'checked' && !isChecked) return false;
      if (filterStatus === 'unchecked' && isChecked) return false;
      if (filterStatus === 'starred' && !isStarred) return false;

      // CEFR Level filter
      if (cefrFilter !== 'ALL' && !item.level.includes(cefrFilter)) return false;

      // Search Query
      if (query) {
        const haystack = `${item.word} ${item.type} ${item.level} ${item.english} ${item.nepali}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [scopeWords, checkedIds, starredIds, filterStatus, cefrFilter, searchQuery]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] text-sm text-[#55697D]">
        Loading your account...
      </div>
    );
  }

  if (isPasswordRecovery && session) {
    return (
      <AuthScreen
        initialMode="resetPassword"
        onPasswordUpdated={() => {
          setIsPasswordRecovery(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1A232E]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-16">
        {/* Header with Navigation modes & Oxford 3000 serif branding */}
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalMastered={checkedIds.size}
          totalWords={TOTAL_WORD_COUNT}
          onResetAll={handleOpenResetModal}
          language={meaningLanguage}
          languageOptions={MEANING_LANGUAGES}
          onLanguageChange={setMeaningLanguage}
          cloudTodoCount={todos.length}
          userEmail={session.user.email ?? ''}
          onSignOut={handleSignOut}
          onSupportClick={() => setIsSupportOpen(true)}
        />

        {/* Analytics Dashboard View */}
        {viewMode === 'analytics' ? (
          <GameAnalyticsDashboard
            checkedIds={checkedIds}
            quizStats={quizStats}
            onSelectLetter={(letter) => {
              setCurrentLetter(letter);
              setViewMode('table');
            }}
            onStartQuiz={() => setViewMode('quiz')}
            onOpenFlashcards={() => setViewMode('flashcards')}
          />
        ) : (
          <>
            {/* 1. Letter A–Z Grid + TOTAL (Category Selector at top) */}
            <LetterNav
              currentLetter={currentLetter}
              onSelectLetter={handleSelectLetter}
              checkedIds={checkedIds}
            />

            {/* 2. Progress Bar (shown for Table and Flashcards view) */}
            {viewMode !== 'quiz' && (
              <StatsBar
                currentLetter={currentLetter}
                scopeTotalWords={scopeWords.length}
                scopeCheckedCount={scopeCheckedCount}
              />
            )}

            {/* 3. Control Toolbar: (Only needed for Table View) */}
            {viewMode === 'table' && (
              <FilterBar
                currentLetter={currentLetter}
                totalCount={scopeWords.length}
                learnedCount={scopeCheckedCount}
                remainingCount={scopeRemainingCount}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                cefrFilter={cefrFilter}
                onCEFRChange={setCefrFilter}
                onCheckAll={handleCheckAllCurrent}
                onResetScope={handleOpenResetModal}
              />
            )}

            {/* 4. Active Study View */}
            {viewMode === 'table' && (
              <VocabTable
                words={filteredWords}
                checkedIds={checkedIds}
                starredIds={starredIds}
                onToggleCheck={handleToggleCheck}
                onToggleStar={handleToggleStar}
                currentLetter={currentLetter}
                language={meaningLanguage}
              />
            )}

            {viewMode === 'flashcards' && (
              <FlashcardsView
                currentLetter={currentLetter}
                words={scopeWords}
                checkedIds={checkedIds}
                starredIds={starredIds}
                onToggleCheck={handleToggleCheck}
                onToggleStar={handleToggleStar}
                language={meaningLanguage}
              />
            )}

            {viewMode === 'quiz' && (
              <QuizView
                currentLetter={currentLetter}
                categoryWords={scopeWords}
                allWords={ALL_WORDS}
                onMarkMastered={handleMarkMastered}
                onRecordQuizResult={handleRecordQuizResult}
                onSelectLetter={handleSelectLetter}
                language={meaningLanguage}
              />
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal to prevent accidental resets */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetScope}
        scopeTitle={isTotal ? 'Total Library' : `Letter ${currentLetter}`}
        wordsCount={scopeCheckedCount}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Crypto donation / support modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
