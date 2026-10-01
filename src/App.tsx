import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { MeaningLanguage, WordItem, ViewMode, FilterStatus, CEFRFilter, QuizStats } from './types/vocab';
import { VOCAB_BY_LETTER, ALL_WORDS, TOTAL_WORD_COUNT } from './data/oxford3000';
import { loadMeaningLanguage, MEANING_LANGUAGES, saveMeaningLanguage } from './utils/meanings';
import { supabase } from './utils/supabase';
import { loadRemoteProgress, saveRemoteProgress, mergeProgress } from './utils/progressSync';
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
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { AdSlot } from './components/AdSlot';

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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isProgressReady, setIsProgressReady] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [cefrFilter, setCefrFilter] = useState<CEFRFilter>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const isTotal = currentLetter === 'ALL';
  const isSignedIn = Boolean(session);

  useEffect(() => {
    let mounted = true;

    // Runs for guests too: a returning signed-in user should land on their
    // cloud progress without the app ever gating behind the login screen.
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
        if (event === 'SIGNED_OUT') setIsPasswordRecovery(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // On sign-in, merge any guest progress already in localStorage into the
  // account instead of discarding it or blindly overwriting the cloud copy.
  const guestSnapshotRef = useRef<{
    checkedIds: Set<string>;
    starredIds: Set<string>;
    quizStats: QuizStats;
    meaningLanguage: MeaningLanguage;
  } | null>(null);
  // Captured once per page load. Without this guard, signing out of account A
  // and into account B would re-capture A's progress and merge it into B.
  const guestCapturedRef = useRef(false);

  useEffect(() => {
    if (!session) {
      setIsProgressReady(false);
      if (!guestCapturedRef.current) {
        guestCapturedRef.current = true;
        guestSnapshotRef.current = {
          checkedIds,
          starredIds,
          quizStats,
          meaningLanguage,
        };
      }
      return;
    }

    let active = true;
    setIsProgressReady(false);

    const guest = guestSnapshotRef.current;
    const hasGuestProgress =
      Boolean(guest) &&
      ((guest?.checkedIds.size ?? 0) > 0 ||
        (guest?.starredIds.size ?? 0) > 0 ||
        (guest?.quizStats.quizzesPlayed ?? 0) > 0);

    loadRemoteProgress(session.user.id).then(async (remoteProgress) => {
      if (!active) return;

      if (hasGuestProgress && guest) {
        const merged = mergeProgress(
          {
            checkedIds: guest.checkedIds,
            starredIds: guest.starredIds,
            quizStats: guest.quizStats,
            meaningLanguage: guest.meaningLanguage,
          },
          remoteProgress
        );

        setCheckedIds(merged.checkedIds);
        setStarredIds(merged.starredIds);
        setQuizStats(merged.quizStats);
        setMeaningLanguage(merged.meaningLanguage);

        // Persist the merged result so cloud and device agree from now on.
        await saveRemoteProgress(session.user.id, merged);
        if (!active) return;
        guestSnapshotRef.current = null;
        setIsProgressReady(true);
        setIsAuthModalOpen(false);
        showToast('Signed in — progress cloud saved');
        return;
      }

      if (remoteProgress) {
        setCheckedIds(remoteProgress.checkedIds);
        setStarredIds(remoteProgress.starredIds);
        setQuizStats(remoteProgress.quizStats);
        setMeaningLanguage(remoteProgress.meaningLanguage);
      }

      setIsProgressReady(true);
      setIsAuthModalOpen(false);
    });

    return () => {
      active = false;
    };
    // Intentionally keyed on the session only: merging must happen once, at the
    // moment of sign-in, not on every progress change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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

  useEffect(() => {
    if (!session || !isProgressReady) return;

    const timeout = window.setTimeout(() => {
      void saveRemoteProgress(session.user.id, {
        checkedIds,
        starredIds,
        quizStats,
        meaningLanguage,
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [session, isProgressReady, checkedIds, starredIds, quizStats, meaningLanguage]);

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
  const scopeLaterCount = scopeWords.filter((word) => starredIds.has(word.id)).length;

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast('Signed out — progress stays saved on this device');
  };

  // Guests get the full app; login is only requested when they want to cloud save.
  const handleSaveClick = () => {
    if (isSignedIn) {
      if (!session || !isProgressReady) return;
      void saveRemoteProgress(session.user.id, {
        checkedIds,
        starredIds,
        quizStats,
        meaningLanguage,
      }).then(() => showToast('Progress cloud saved'));
      return;
    }
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1A232E]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pb-0">
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
          userEmail={session?.user.email ?? ''}
          isSignedIn={isSignedIn}
          onSignOut={handleSignOut}
          onSupportClick={() => setIsSupportOpen(true)}
          onSaveClick={handleSaveClick}
        />

        {/* Analytics Dashboard View */}
        {viewMode === 'analytics' ? (
          <GameAnalyticsDashboard
            checkedIds={checkedIds}
            starredIds={starredIds}
            quizStats={quizStats}
            onSelectLetter={(letter) => {
              setCurrentLetter(letter);
              setViewMode('table');
            }}
            onStartQuiz={() => setViewMode('quiz')}
            onOpenFlashcards={() => setViewMode('flashcards')}
            onOpenCollection={() => {
              setCurrentLetter('ALL');
              setFilterStatus('starred');
              setSearchQuery('');
              setCefrFilter('ALL');
              setViewMode('table');
            }}
            language={meaningLanguage}
          />
        ) : viewMode === 'about' ? (
          <AboutView language={meaningLanguage} />
        ) : (
          <>
            {/* 1. Letter A–Z Grid + TOTAL (Category Selector at top) */}
            <LetterNav
              currentLetter={currentLetter}
              onSelectLetter={handleSelectLetter}
              checkedIds={checkedIds}
              showAd={viewMode !== 'quiz' && viewMode !== 'flashcards'}
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
                laterCount={scopeLaterCount}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                cefrFilter={cefrFilter}
                onCEFRChange={setCefrFilter}
                onCheckAll={handleCheckAllCurrent}
                onResetScope={handleOpenResetModal}
                language={meaningLanguage}
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

        {/* Ad slot between the study content (incl. pagination) and the footer.
            Hidden on quiz and flashcards so those views stay distraction free. */}
        {viewMode !== 'quiz' && viewMode !== 'flashcards' && (
          <AdSlot id="below-content" format="wide-banner" className="mt-16 mb-16" />
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

      {/* Sign-in prompt for guests who want to save progress */}
      {isAuthModalOpen && !isSignedIn && (
        <AuthScreen onClose={() => setIsAuthModalOpen(false)} />
      )}

      <Footer
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSupportClick={() => setIsSupportOpen(true)}
        onSaveClick={handleSaveClick}
        isSignedIn={isSignedIn}
        masteredCount={checkedIds.size}
        userEmail={session?.user.email ?? ''}
        language={meaningLanguage}
      />
    </div>
  );
}
