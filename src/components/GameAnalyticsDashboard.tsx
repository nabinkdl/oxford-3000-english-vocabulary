import React from 'react';
import { QuizStats } from '../types/vocab';
import { LETTERS, VOCAB_BY_LETTER, ALL_WORDS, TOTAL_WORD_COUNT } from '../data/oxford3000';
import { Trophy, CheckCircle2, Target, Flame, Play, ArrowRight, Award } from 'lucide-react';

interface GameAnalyticsDashboardProps {
  checkedIds: Set<string>;
  quizStats: QuizStats;
  onSelectLetter: (letter: string) => void;
  onStartQuiz: () => void;
  onOpenFlashcards: () => void;
}

export const GameAnalyticsDashboard: React.FC<GameAnalyticsDashboardProps> = ({
  checkedIds,
  quizStats,
  onSelectLetter,
  onStartQuiz,
  onOpenFlashcards,
}) => {
  const totalMastered = checkedIds.size;
  const overallPct =
    TOTAL_WORD_COUNT > 0 ? Math.round((totalMastered / TOTAL_WORD_COUNT) * 100) : 0;

  // Completed groups count
  const completedLetters = LETTERS.filter((L) => {
    const words = VOCAB_BY_LETTER[L] || [];
    return words.length > 0 && words.every((w) => checkedIds.has(w.id));
  });

  // CEFR Levels calculations
  const cefrLevels = ['A1', 'A2', 'B1', 'B2'] as const;
  const levelStats = cefrLevels.map((lvl) => {
    const words = ALL_WORDS.filter((w) => w.level.includes(lvl));
    const mastered = words.filter((w) => checkedIds.has(w.id)).length;
    const pct = words.length > 0 ? Math.round((mastered / words.length) * 100) : 0;
    return { level: lvl, total: words.length, mastered, pct };
  });

  // Rank / Title
  const getRank = (count: number) => {
    if (count >= 2000) return { title: 'Grand Lexicographer', tier: 'Master Tier', color: '#BA4A2C' };
    if (count >= 1200) return { title: 'Oxford Scholar', tier: 'Senior Tier', color: '#9C5B00' };
    if (count >= 600) return { title: 'Proficient Reader', tier: 'Intermediate Tier', color: '#007A78' };
    if (count >= 200) return { title: 'Active Apprentice', tier: 'Junior Tier', color: '#2D8A55' };
    return { title: 'Initiate Learner', tier: 'Beginner Tier', color: '#55697D' };
  };

  const rank = getRank(totalMastered);
  const quizAccuracy =
    quizStats.totalQuestionsAnswered > 0
      ? Math.round((quizStats.totalCorrect / quizStats.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Rank & Title */}
      <div className="bg-[#EDE8DD] border border-[#C8BFB0] p-6 sm:p-8 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xs bg-[#1A232E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Trophy className="w-8 h-8 text-[#FFB84D]" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              {rank.tier}
            </div>
            <h2 className="font-serif-title italic text-3xl sm:text-4xl text-[#1A232E]">
              {rank.title}
            </h2>
            <p className="text-xs text-[#55697D] mt-0.5">
              {totalMastered} words mastered across English–Nepali vocabulary
            </p>
          </div>
        </div>

        {/* Quick Game Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onStartQuiz}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A232E] hover:bg-[#2A3B4E] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Practice Quiz</span>
          </button>
          <button
            onClick={onOpenFlashcards}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#C8BFB0] hover:border-[#1A232E] text-[#1A232E] text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            <span>Review Flashcards</span>
          </button>
        </div>
      </div>

      {/* 4 Core Game Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Words */}
        <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-5 rounded-xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#55697D]">
            Total Words Mastered
          </div>
          <div className="font-serif-title italic text-4xl text-[#1A232E] tabular-nums">
            {totalMastered}
            <span className="text-lg font-sans not-italic text-[#7B8B9E] font-normal">
              {' '}/ {TOTAL_WORD_COUNT}
            </span>
          </div>
          <div className="h-[3px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div className="h-full bg-[#1A232E]" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="text-xs text-[#55697D] font-medium">{overallPct}% Oxford 3000 completed</div>
        </div>

        {/* Card 2: Completed Letter Groups */}
        <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-5 rounded-xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#55697D]">
            Completed Groups
          </div>
          <div className="font-serif-title italic text-4xl text-[#2A593D] tabular-nums flex items-baseline gap-2">
            <span>{completedLetters.length}</span>
            <span className="text-lg font-sans not-italic text-[#7B8B9E] font-normal">/ 26</span>
          </div>
          <div className="h-[3px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2A593D]"
              style={{ width: `${(completedLetters.length / 26) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#2A593D] font-medium">
            {completedLetters.length === 26 ? 'All letters completed!' : `${26 - completedLetters.length} letters remaining`}
          </div>
        </div>

        {/* Card 3: Quiz Accuracy */}
        <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-5 rounded-xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#55697D]">
            Quiz Accuracy Rate
          </div>
          <div className="font-serif-title italic text-4xl text-[#BA4A2C] tabular-nums">
            {quizAccuracy}%
          </div>
          <div className="h-[3px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div className="h-full bg-[#BA4A2C]" style={{ width: `${quizAccuracy}%` }} />
          </div>
          <div className="text-xs text-[#55697D] font-medium">
            {quizStats.totalCorrect} of {quizStats.totalQuestionsAnswered} questions correct
          </div>
        </div>

        {/* Card 4: Best Streak & Rounds */}
        <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-5 rounded-xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#55697D]">
            Game Rounds Played
          </div>
          <div className="font-serif-title italic text-4xl text-[#1A232E] tabular-nums flex items-baseline gap-2">
            <span>{quizStats.quizzesPlayed}</span>
            <span className="text-sm font-sans not-italic text-[#55697D]">rounds</span>
          </div>
          <div className="h-[3px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9C5B00]"
              style={{ width: `${Math.min(100, quizStats.quizzesPlayed * 10)}%` }}
            />
          </div>
          <div className="text-xs text-[#55697D] font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#BA4A2C]" />
            <span>Best Streak: {quizStats.bestStreak} words</span>
          </div>
        </div>
      </div>

      {/* CEFR Level Breakdown */}
      <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-6 rounded-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E0D8CB] pb-3">
          <div>
            <h3 className="font-serif-title italic text-2xl text-[#1A232E]">
              CEFR Level Competency
            </h3>
            <p className="text-xs text-[#55697D]">
              Mastery distribution across European Framework vocabulary tiers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {levelStats.map((lvl) => {
            let borderColor = 'border-[#2D8A55] text-[#2D8A55]';
            let barColor = 'bg-[#2D8A55]';
            if (lvl.level === 'A2') {
              borderColor = 'border-[#007A78] text-[#007A78]';
              barColor = 'bg-[#007A78]';
            } else if (lvl.level === 'B1') {
              borderColor = 'border-[#9C5B00] text-[#9C5B00]';
              barColor = 'bg-[#9C5B00]';
            } else if (lvl.level === 'B2') {
              borderColor = 'border-[#BA4A2C] text-[#BA4A2C]';
              barColor = 'bg-[#BA4A2C]';
            }

            return (
              <div
                key={lvl.level}
                className="bg-[#EDE8DD] p-4 rounded-xs border border-[#C8BFB0] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 border text-xs font-bold font-mono ${borderColor}`}>
                    {lvl.level}
                  </span>
                  <span className="font-serif-title italic text-xl text-[#1A232E] tabular-nums">
                    {lvl.pct}%
                  </span>
                </div>
                <div className="h-[4px] bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: `${lvl.pct}%` }} />
                </div>
                <div className="text-xs text-[#55697D] tabular-nums flex justify-between">
                  <span>Learned: {lvl.mastered}</span>
                  <span>Total: {lvl.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter-by-Letter Completion Matrix */}
      <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-6 rounded-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E0D8CB] pb-3">
          <div>
            <h3 className="font-serif-title italic text-2xl text-[#1A232E]">
              Letter Group Completion Matrix
            </h3>
            <p className="text-xs text-[#55697D]">
              Completed groups are highlighted in vibrant green (Click any letter to study)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#2A593D]">
              <span className="w-3 h-3 bg-[#2A593D] rounded-xs" /> Completed ({completedLetters.length})
            </span>
            <span className="flex items-center gap-1.5 text-[#55697D]">
              <span className="w-3 h-3 bg-[#EDE8DD] border border-[#C8BFB0] rounded-xs" /> In Progress ({26 - completedLetters.length})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
          {LETTERS.map((letter) => {
            const words = VOCAB_BY_LETTER[letter] || [];
            const count = words.length;
            const mastered = words.filter((w) => checkedIds.has(w.id)).length;
            const isDone = count > 0 && mastered === count;
            const pct = count > 0 ? Math.round((mastered / count) * 100) : 0;

            return (
              <button
                key={letter}
                onClick={() => onSelectLetter(letter)}
                disabled={count === 0}
                className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                  count === 0
                    ? 'opacity-30 bg-[#EFEBE4] border-[#E0D8CB] cursor-not-allowed'
                    : isDone
                    ? 'bg-[#2A593D] text-white border-[#2A593D] shadow-xs hover:bg-[#234A33]'
                    : 'bg-[#EDE8DD] border-[#C8BFB0] text-[#1A232E] hover:bg-[#E5DFD3] hover:border-[#1A232E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif-title text-2xl leading-none">{letter}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <span className="text-[10px] font-sans tabular-nums text-[#55697D]">
                      {pct}%
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-2">
                  <div className="h-[2.5px] bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isDone ? 'bg-white' : 'bg-[#BA4A2C]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div
                    className={`text-[10px] tabular-nums font-mono ${
                      isDone ? 'text-white/80' : 'text-[#6F7D8C]'
                    }`}
                  >
                    {mastered} / {count}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz Game History */}
      {quizStats.recentScores.length > 0 && (
        <div className="bg-[#FAF7F0] border border-[#D5CDBD] p-6 rounded-xs space-y-4">
          <h3 className="font-serif-title italic text-2xl text-[#1A232E]">
            Recent Quiz History
          </h3>
          <div className="divide-y divide-[#E0D8CB]">
            {quizStats.recentScores.slice(-5).reverse().map((rec, i) => {
              const pct = Math.round((rec.score / rec.total) * 100);
              return (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-[#55697D] font-mono">{rec.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1A232E] tabular-nums">
                      {rec.score} / {rec.total} correct
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-xs font-mono font-bold ${
                        pct >= 80
                          ? 'bg-[#E9EFE6] text-[#2A593D]'
                          : pct >= 50
                          ? 'bg-[#FFF6E5] text-[#9C5B00]'
                          : 'bg-[#FFF0ED] text-[#BA4A2C]'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
