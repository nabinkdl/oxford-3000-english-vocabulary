import React from 'react';
import { LETTERS, VOCAB_BY_LETTER, TOTAL_WORD_COUNT } from '../data/oxford3000';
import { Check } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface LetterNavProps {
  currentLetter: string; // 'ALL' or 'A'-'Z'
  onSelectLetter: (letter: string) => void;
  checkedIds: Set<string>;
  /**
   * Ads are hidden on quiz and flashcards. Those views are focused, timed or
   * full-attention surfaces, and a slot after Z would compete with the card
   * controls.
   */
  showAd?: boolean;
}

export const LetterNav: React.FC<LetterNavProps> = ({
  currentLetter,
  onSelectLetter,
  checkedIds,
  showAd = true,
}) => {
  const isTotalActive = currentLetter === 'ALL';
  const totalMastered = checkedIds.size;
  const isTotalComplete = TOTAL_WORD_COUNT > 0 && totalMastered === TOTAL_WORD_COUNT;

  return (
    <div className="space-y-2 mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        {/* TOTAL Tile */}
        <button
          onClick={() => onSelectLetter('ALL')}
          title={`All Oxford 3000 words (${totalMastered}/${TOTAL_WORD_COUNT} learned) ${
            isTotalComplete ? '(CATEGORY COMPLETED ✓)' : ''
          }`}
          className={`flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[58px] px-2 rounded-xs transition-all cursor-pointer select-none relative ${
            isTotalComplete
              ? isTotalActive
                ? 'bg-[#15803d] text-white ring-2 ring-[#15803d] ring-offset-2 ring-offset-[#FAF7F0] shadow-sm'
                : 'bg-[#166534] text-white hover:bg-[#15803d] shadow-xs'
              : isTotalActive
              ? 'bg-[#1D2A3A] text-white shadow-xs'
              : 'bg-[#EDE8DD] hover:bg-[#E5DFD3] text-[#1A232E]'
          }`}
        >
          <span className="font-serif-title text-base sm:text-lg font-medium leading-tight flex items-center gap-1">
            ALL {isTotalComplete && <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-200" />}
          </span>
          <span
            className={`text-[10px] tabular-nums leading-none mt-1 font-sans ${
              isTotalComplete || isTotalActive ? 'text-white/95 font-medium' : 'text-[#55697D]'
            }`}
          >
            {TOTAL_WORD_COUNT}
          </span>
          {isTotalComplete && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#FAF7F0]" />
          )}
        </button>

        {/* Letters A-Z Tiles */}
        {LETTERS.map((letter) => {
          const words = VOCAB_BY_LETTER[letter] || [];
          const count = words.length;
          const isActive = letter === currentLetter;
          const checkedCount = words.filter((w) => checkedIds.has(w.id)).length;
          const isComplete = count > 0 && checkedCount === count;

          return (
            <button
              key={letter}
              onClick={() => onSelectLetter(letter)}
              disabled={count === 0}
              title={`Letter ${letter} — ${checkedCount}/${count} learned ${
                isComplete ? '(COMPLETED GROUP ✓)' : ''
              }`}
              className={`flex flex-col items-center justify-center min-w-[42px] sm:min-w-[48px] h-[58px] px-1 rounded-xs transition-all cursor-pointer select-none relative ${
                count === 0
                  ? 'opacity-30 cursor-not-allowed bg-[#EFEBE4] text-[#A0AEC0]'
                  : isComplete
                  ? isActive
                    ? 'bg-[#15803d] text-white ring-2 ring-[#15803d] ring-offset-2 ring-offset-[#FAF7F0] shadow-sm'
                    : 'bg-[#166534] text-white hover:bg-[#15803d] shadow-xs'
                  : isActive
                  ? 'bg-[#1D2A3A] text-white shadow-xs'
                  : 'bg-[#EDE8DD] hover:bg-[#E5DFD3] text-[#1A232E]'
              }`}
            >
              <span className="font-serif-title text-xl sm:text-2xl font-normal leading-tight flex items-center gap-0.5">
                {letter}
                {isComplete && <Check className="w-3 h-3 stroke-[3] text-emerald-200" />}
              </span>
              <span
                className={`text-[10px] tabular-nums leading-none mt-1 font-sans ${
                  isComplete || isActive ? 'text-white/95 font-medium' : 'text-[#55697D]'
                }`}
              >
                {count}
              </span>
              {isComplete && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#FAF7F0]" />
              )}
              {!isComplete && checkedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#BA4A2C] rounded-full ring-2 ring-[#FAF7F0]" />
              )}
            </button>
          );
        })}

        {/* Ad slot sits inline after the Z tile and stretches to fill the
            remaining width and height of the row, wrapping to its own line
            when the letter tiles need the full width. */}
        {showAd && (
          <div className="basis-full sm:basis-auto sm:flex-1 sm:ml-2 min-w-[180px]">
            <AdSlot id="letternav-inline" format="letternav" />
          </div>
        )}
      </div>
    </div>
  );
};
