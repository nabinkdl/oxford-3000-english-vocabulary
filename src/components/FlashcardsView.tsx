import React, { useState, useEffect } from 'react';
import { MeaningLanguage, WordItem } from '../types/vocab';
import { MEANING_LANGUAGES } from '../utils/meanings';
import { MeaningText } from './MeaningText';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Check,
  Star,
  Shuffle,
  VolumeX,
} from 'lucide-react';
import { playPronunciation } from '../utils/speech';

interface FlashcardsViewProps {
  currentLetter: string;
  words: WordItem[];
  checkedIds: Set<string>;
  starredIds: Set<string>;
  onToggleCheck: (id: string) => void;
  onToggleStar: (id: string) => void;
  language: MeaningLanguage;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  currentLetter,
  words,
  checkedIds,
  starredIds,
  onToggleCheck,
  onToggleStar,
  language,
}) => {
  const [deck, setDeck] = useState<WordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Only reset to card 0 when the category/letter actually changes
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentLetter]);

  // Keep deck in sync with words if words length changes without letter change
  useEffect(() => {
    if (words.length > 0 && deck.length === 0) {
      setDeck(words);
    }
  }, [words]);

  useEffect(() => {
    if (autoPlayAudio && deck.length > 0 && deck[currentIndex]) {
      playPronunciation(deck[currentIndex].word);
    }
  }, [currentIndex, autoPlayAudio, deck]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deck.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck.length]);

  if (deck.length === 0) {
    return (
      <div className="bg-[#FAF7F0] border border-[#C8BFB0] rounded-xs p-12 text-center text-[#55697D]">
        <p className="font-serif-title italic text-3xl text-[#1A232E] mb-2">No flashcards</p>
        <p className="text-xs">Select a letter or reset filters to begin flashcard practice.</p>
      </div>
    );
  }

  const current = deck[currentIndex];
  const isMastered = checkedIds.has(current.id);
  const isStarred = starredIds.has(current.id);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-[#55697D]">
        <div>
          Card <strong className="text-[#1A232E] tabular-nums">{currentIndex + 1}</strong> of{' '}
          <strong className="text-[#1A232E] tabular-nums">{deck.length}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-xs transition-colors cursor-pointer text-xs ${
              autoPlayAudio
                ? 'border-[#1A232E] bg-[#1A232E] text-white'
                : 'border-[#C8BFB0] bg-white text-[#55697D]'
            }`}
          >
            {autoPlayAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Auto-Audio</span>
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1 border border-[#C8BFB0] bg-white text-[#55697D] hover:text-[#1A232E] rounded-xs cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={() => onToggleCheck(current.id)}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-xs transition-colors cursor-pointer text-xs ${
              isMastered
                ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                : 'border-[#C8BFB0] bg-white text-[#55697D] hover:border-[#1A232E]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isMastered ? 'Learned ✓' : 'Mark Learned'}</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[340px] sm:min-h-[380px] bg-[#FAF7F0] border-2 border-[#1A232E] rounded-xs p-8 sm:p-12 shadow-sm flex flex-col justify-between relative select-none cursor-pointer group"
      >
        {/* Top details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider">
            <span className="text-[#6F7D8C] uppercase">{current.type}</span>
            <span className="border border-[#1A232E] px-1.5 py-0.2 text-[#1A232E]">
              {current.level}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(current.id);
              }}
              className={`p-2 border rounded-xs cursor-pointer transition-colors ${
                isStarred
                  ? 'border-[#BA4A2C] bg-[#FFF0ED] text-[#BA4A2C]'
                  : 'border-[#C8BFB0] bg-white text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
              title={isStarred ? 'Unstar word' : 'Star word for review'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playPronunciation(current.word);
              }}
              className="p-2 border border-[#C8BFB0] bg-white text-[#1A232E] hover:border-[#1A232E] rounded-xs cursor-pointer transition-colors"
              title="Listen to pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center content */}
        <div className="text-center my-6">
          {!isFlipped ? (
            <div className="space-y-3">
              <h2 className="font-serif-title italic text-5xl sm:text-6xl text-[#1A232E]">
                {current.word}
              </h2>
              <p className="text-xs text-[#6F7D8C] italic font-serif-title pt-2">
                Click or press Space to reveal meaning
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl sm:text-5xl font-bold font-nepali text-[#1A232E]">
                <MeaningText word={current.word} nepali={current.nepali} language={language} />
              </div>
              <p className="text-sm sm:text-base text-[#4C5B6B] max-w-md mx-auto pt-2 border-t border-[#E0D8CB]">
                {current.english}
              </p>
            </div>
          )}
        </div>

        {/* Card footer hint */}
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#7B8B9E] border-t border-[#E0D8CB] pt-3">
          <span>
            {isFlipped
              ? `Meaning (${MEANING_LANGUAGES.find((option) => option.code === language)?.nativeLabel})`
              : 'Prompt (English)'}
          </span>
          <span className="flex items-center gap-1 text-[#BA4A2C]">
            <RotateCw className="w-3 h-3" /> Flip
          </span>
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prevCard}
          className="flex-1 py-3 px-4 bg-white border border-[#C8BFB0] hover:border-[#1A232E] text-[#1A232E] text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={nextCard}
          className="flex-1 py-3 px-4 bg-[#1A232E] hover:bg-[#2A3B4E] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
