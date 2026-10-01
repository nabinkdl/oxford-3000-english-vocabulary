import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MeaningLanguage, WordItem } from '../types/vocab';
import { getMeaning } from '../utils/meanings';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Shuffle,
  Settings2,
  Trophy,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { playPronunciation } from '../utils/speech';

interface QuizViewProps {
  currentLetter: string;
  categoryWords: WordItem[];
  allWords: WordItem[];
  onMarkMastered: (id: string) => void;
  onRecordQuizResult?: (score: number, total: number) => void;
  onSelectLetter?: (letter: string) => void;
  language: MeaningLanguage;
}

interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  target: WordItem;
  options: ChoiceOption[];
}

type QuestionCountChoice = 10 | 25 | 50 | 'all';

export const QuizView: React.FC<QuizViewProps> = ({
  currentLetter,
  categoryWords,
  allWords,
  onMarkMastered,
  onRecordQuizResult,
  language,
}) => {
  // User settings
  const [questionLimit, setQuestionLimit] = useState<QuestionCountChoice>('all');
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [alwaysShowHints, setAlwaysShowHints] = useState<boolean>(false);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Ref to hold alwaysShowHints for use in callbacks without recreating them
  const alwaysShowHintsRef = useRef(alwaysShowHints);
  useEffect(() => {
    alwaysShowHintsRef.current = alwaysShowHints;
  }, [alwaysShowHints]);

  const isTotal = currentLetter === 'ALL';
  const categoryTitle = isTotal ? 'Total Library (All Words)' : `Letter ${currentLetter}`;

  // Core quiz generator: completely deterministic & fast
  const generateQuiz = useCallback(
    async (customLimit?: QuestionCountChoice) => {
      // Questions strictly come from the selected category
      const targetPool = categoryWords.length > 0 ? categoryWords : allWords;
      if (targetPool.length === 0) {
        setQuestions([]);
        return;
      }

      // Shuffle candidate targets
      const shuffledTargets = [...targetPool].sort(() => 0.5 - Math.random());

      // Calculate question count
      const limit = customLimit !== undefined ? customLimit : questionLimit;
      let count = shuffledTargets.length;
      if (typeof limit === 'number') {
        count = Math.min(limit, shuffledTargets.length);
      }
      const selectedTargets = shuffledTargets.slice(0, count);

      const generated: QuizQuestion[] = await Promise.all(selectedTargets.map(async (target) => {
        const targetMeaning = await getMeaning(target.word, target.nepali, language).catch(
          () => target.word
        );
        const distractorWords = [...allWords]
          .filter((word) => word.id !== target.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const candidateDistractors = await Promise.all(
          distractorWords.map((word) => getMeaning(word.word, word.nepali, language).catch(() => word.word))
        );

        const correctChoice: ChoiceOption = {
          id: `opt-correct-${target.id}`,
          text: targetMeaning,
          isCorrect: true,
        };

        const wrongChoices: ChoiceOption[] = candidateDistractors.map((text, i) => ({
          id: `opt-wrong-${target.id}-${i}`,
          text,
          isCorrect: false,
        }));

        let finalOptions = [correctChoice, ...wrongChoices];
        if (shuffleOptions) {
          finalOptions = finalOptions.sort(() => 0.5 - Math.random());
        }

        return {
          target,
          options: finalOptions,
        };
      }));

      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setShowHint(alwaysShowHintsRef.current);
      setScore(0);
      setIsFinished(false);
      setStreak(0);
      setMaxStreak(0);
    },
    [categoryWords, allWords, language, questionLimit, shuffleOptions]
  );

  // Initialize ONLY when currentLetter changes or on first mount
  const prevQuizKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const quizKey = `${currentLetter}:${language}`;
    if (prevQuizKeyRef.current !== quizKey) {
      prevQuizKeyRef.current = quizKey;
      generateQuiz();
    }
  }, [currentLetter, language, generateQuiz]);

  // Handle choice selection
  const handleSelectOption = (option: ChoiceOption) => {
    if (selectedOptionId !== null) return; // Prevent multiple clicks
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      // Mark as mastered without disrupting the quiz!
      const currentQ = questions[currentIndex];
      if (currentQ) {
        onMarkMastered(currentQ.target.id);
      }
    } else {
      setStreak(0);
    }
  };

  // Next question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowHint(alwaysShowHints);
    } else {
      // Calculate final score
      const finalScore = score + (selectedOptionId && questions[currentIndex]?.options.find(o => o.id === selectedOptionId)?.isCorrect ? 0 : 0);
      setIsFinished(true);
      if (onRecordQuizResult) {
        onRecordQuizResult(score, questions.length);
      }
    }
  };

  // Keyboard navigation for fast quiz answering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || questions.length === 0) return;
      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      // When answering: keys 1, 2, 3, 4 or A, B, C, D
      if (selectedOptionId === null) {
        let optIdx = -1;
        if (e.key === '1' || e.key.toLowerCase() === 'a') optIdx = 0;
        else if (e.key === '2' || e.key.toLowerCase() === 'b') optIdx = 1;
        else if (e.key === '3' || e.key.toLowerCase() === 'c') optIdx = 2;
        else if (e.key === '4' || e.key.toLowerCase() === 'd') optIdx = 3;

        if (optIdx >= 0 && optIdx < currentQ.options.length) {
          e.preventDefault();
          handleSelectOption(currentQ.options[optIdx]);
        }
      } else {
        // When feedback is visible: Enter or Space advances to Next Question
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOptionId, currentIndex, questions, isFinished, score]);

  // Reshuffle current quiz manually
  const handleReshuffle = () => {
    generateQuiz();
  };

  // Change question limit
  const handleChangeLimit = (limit: QuestionCountChoice) => {
    setQuestionLimit(limit);
    generateQuiz(limit);
  };

  // Toggle hints visibility without resetting quiz
  const handleToggleAlwaysHints = () => {
    setAlwaysShowHints((prev) => {
      const next = !prev;
      setShowHint(next);
      return next;
    });
  };

  // Empty state if category has no words
  if (categoryWords.length === 0) {
    return (
      <div className="bg-[#FAF7F0] border border-[#C8BFB0] rounded-xs p-10 text-center text-[#55697D] space-y-3">
        <p className="font-serif-title italic text-3xl text-[#1A232E]">
          No words in {categoryTitle}
        </p>
        <p className="text-xs text-[#55697D]">
          Please select another letter group or click <strong>ALL</strong> in the letter bar above to quiz across the full dictionary.
        </p>
      </div>
    );
  }

  // Quiz Finished Result Screen
  if (isFinished) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="max-w-md mx-auto bg-[#FAF7F0] border-2 border-[#1A232E] rounded-xs p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 bg-[#1A232E] text-white rounded-xs flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-7 h-7 text-[#FFB84D]" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
            {categoryTitle}
          </span>
          <h2 className="font-serif-title italic text-4xl text-[#1A232E] mt-1">Quiz Completed!</h2>
          <p className="text-xs text-[#55697D] mt-1">
            Vocabulary retention score for this round
          </p>
        </div>

        <div className="bg-[#EDE8DD] p-6 rounded-xs space-y-2 border border-[#C8BFB0]">
          <div className="font-serif-title italic text-5xl text-[#1A232E] tabular-nums">{pct}%</div>
          <div className="text-xs text-[#1A232E] font-bold uppercase tracking-wider">
            {score} of {questions.length} questions correct
          </div>
          {maxStreak > 1 && (
            <div className="text-[11px] text-[#2D6A4F] font-semibold">
              ★ Best streak: {maxStreak} in a row
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => generateQuiz()}
            className="w-full py-3 px-4 bg-[#1A232E] hover:bg-[#2A3B4E] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice {categoryTitle} Again</span>
          </button>

          <button
            onClick={() => {
              handleChangeLimit(questionLimit === 'all' ? 10 : 'all');
            }}
            className="w-full py-2.5 px-4 bg-white border border-[#C8BFB0] hover:border-[#1A232E] text-[#1A232E] text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            {questionLimit === 'all' ? 'Switch to Quick 10-Question Quiz' : `Quiz All ${categoryWords.length} Words`}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Quiz Header: Category Title, Question Count Selector, Shuffle & Hints */}
      <div className="bg-[#EDE8DD] border border-[#C8BFB0] p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
            Active Category
          </div>
          <div className="font-serif-title italic text-2xl text-[#1A232E] leading-tight">
            {categoryTitle}
          </div>
          <div className="text-[11px] text-[#55697D] tabular-nums">
            {categoryWords.length} words in this pool
          </div>
        </div>

        {/* Right side controls: Question count selector, Shuffle button & Hints toggle */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Question Limit Pills */}
          <div className="flex items-center bg-[#FAF7F0] border border-[#C8BFB0] p-0.5 rounded-xs text-[11px] font-bold uppercase">
            {([10, 25, 50, 'all'] as const).map((opt) => {
              if (typeof opt === 'number' && opt > categoryWords.length && categoryWords.length > 5) {
                return null;
              }
              const isActive = questionLimit === opt;
              const label = opt === 'all' ? `All (${categoryWords.length})` : `${opt}Q`;

              return (
                <button
                  key={opt}
                  onClick={() => handleChangeLimit(opt)}
                  className={`px-2 py-1 rounded-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1A232E] text-white'
                      : 'text-[#55697D] hover:text-[#1A232E]'
                  }`}
                  title={`Quiz ${opt === 'all' ? 'all words' : `${opt} questions`}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Shuffle Questions button */}
          <button
            onClick={handleReshuffle}
            title="Reshuffle question order"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C8BFB0] hover:border-[#1A232E] text-[#1A232E] text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          {/* Hints Toggle: Toggles hint mode without restarting quiz */}
          <button
            onClick={handleToggleAlwaysHints}
            title={`Hint display mode: ${alwaysShowHints ? 'Always Show' : 'Show on request'}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xs text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              alwaysShowHints
                ? 'bg-[#1A232E] text-white border-[#1A232E]'
                : 'bg-white text-[#55697D] border-[#C8BFB0] hover:border-[#1A232E] hover:text-[#1A232E]'
            }`}
          >
            {alwaysShowHints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Hints:</span>
            <span>{alwaysShowHints ? 'ON' : 'OFF'}</span>
          </button>

          {/* Shuffle Options Toggle */}
          <button
            onClick={() => setShuffleOptions((prev) => !prev)}
            title={`Option order shuffling: ${shuffleOptions ? 'ON' : 'OFF'}`}
            className={`p-1.5 border rounded-xs cursor-pointer transition-colors ${
              shuffleOptions
                ? 'bg-[#1A232E] text-white border-[#1A232E]'
                : 'bg-white text-[#8A9BA8] border-[#C8BFB0]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Score Bar */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#55697D] px-1">
        <span>
          Question <strong className="text-[#1A232E] tabular-nums">{currentIndex + 1}</strong> of{' '}
          <strong className="text-[#1A232E] tabular-nums">{questions.length}</strong>
        </span>
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="text-[#BA4A2C] font-mono lowercase text-[11px]">
              🔥 streak {streak}
            </span>
          )}
          <span className="text-[#2D6A4F]">
            Score: <strong className="tabular-nums">{score}</strong> / {questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#FAF7F0] border-2 border-[#1A232E] rounded-xs p-6 sm:p-8 space-y-5 shadow-xs">
        {/* Word prompt header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 font-mono text-xs font-bold">
              <span className="text-[#6F7D8C] uppercase">{q.target.type}</span>
              <span className="border border-[#1A232E] px-1.5 py-0.2 text-[#1A232E]">
                {q.target.level}
              </span>
              <span className="text-[10px] text-[#8A9BA8] uppercase font-sans">
                {isTotal ? `Letter ${q.target.letter}` : categoryTitle}
              </span>
            </div>
            <h2 className="font-serif-title italic text-4xl sm:text-5xl text-[#1A232E] leading-tight">
              {q.target.word}
            </h2>

            {/* Hide/Show Hint like: wage (pay: hide/show) */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {showHint || alwaysShowHints ? (
                <div className="inline-flex items-center gap-2 bg-[#EDE8DD] border border-[#C8BFB0] px-2.5 py-1 rounded-xs animate-in fade-in duration-150">
                  <span className="text-xs text-[#55697D] font-mono uppercase font-bold">Hint:</span>
                  <span className="font-serif-title italic text-base text-[#1A232E]">
                    {q.target.english}
                  </span>
                  {!alwaysShowHints && (
                    <button
                      onClick={() => setShowHint(false)}
                      className="text-[10px] text-[#55697D] hover:text-[#BA4A2C] cursor-pointer font-sans uppercase font-bold flex items-center gap-0.5 ml-1 transition-colors border-l border-[#C8BFB0] pl-2"
                      title="Hide hint"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>hide</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F0] border border-[#C8BFB0] hover:border-[#1A232E] rounded-xs text-[#55697D] hover:text-[#1A232E] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  title={`Show hint for "${q.target.word}"`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Show Hint</span>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => playPronunciation(q.target.word)}
            className="p-2.5 border border-[#C8BFB0] bg-white text-[#1A232E] hover:border-[#1A232E] rounded-xs cursor-pointer transition-colors shadow-2xs"
            title="Listen to native English pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Choices in Nepali */}
        <div className="grid grid-cols-1 gap-2.5 pt-2">
          {q.options.map((option, optIdx) => {
            const isSelected = selectedOptionId === option.id;
            const showFeedback = selectedOptionId !== null;

            let btnStyle =
              'bg-[#EDE8DD] border-[#C8BFB0] text-[#1A232E] hover:bg-[#E5DFD3] hover:border-[#1A232E]';
            if (showFeedback) {
              if (option.isCorrect) {
                btnStyle = 'bg-[#E9EFE6] border-[#15803d] text-[#15803d] font-bold shadow-xs';
              } else if (isSelected) {
                btnStyle = 'bg-[#FFF0ED] border-[#BA4A2C] text-[#BA4A2C] font-bold';
              } else {
                btnStyle = 'bg-[#FAF7F0] border-[#E0D8CB] text-[#A0AEC0] opacity-50';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={showFeedback}
                className={`w-full py-3.5 px-4 border rounded-xs text-left font-nepali text-base sm:text-lg font-semibold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#8A9BA8] not-italic">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <span>{option.text}</span>
                </div>

                {showFeedback && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-[#15803d] shrink-0 ml-2" />
                )}
                {showFeedback && isSelected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-[#BA4A2C] shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Question / Results Button */}
        {selectedOptionId !== null && (
          <div className="pt-2 animate-in fade-in duration-150">
            <button
              onClick={handleNext}
              className="w-full py-3.5 px-4 bg-[#1A232E] hover:bg-[#2A3B4E] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question (Space / Enter)' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
