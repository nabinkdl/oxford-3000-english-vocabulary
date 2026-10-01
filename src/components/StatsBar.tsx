import React from 'react';

interface StatsBarProps {
  currentLetter: string; // 'ALL' or 'A'-'Z'
  scopeTotalWords: number;
  scopeCheckedCount: number;
  overallTotalWords?: number;
  overallCheckedCount?: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  currentLetter,
  scopeTotalWords,
  scopeCheckedCount,
}) => {
  const isTotal = currentLetter === 'ALL';
  const scopePct =
    scopeTotalWords > 0 ? Math.round((scopeCheckedCount / scopeTotalWords) * 100) : 0;

  return (
    <div className="mb-6 space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-[0.2em] text-[#55697D] uppercase flex items-center gap-1.5">
          {isTotal ? 'Total Library Progress' : `Letter ${currentLetter} Progress`}
          {scopePct === 100 && (
            <span className="text-[#15803d] font-bold lowercase text-[10px] bg-[#E9EFE6] px-1.5 py-0.5 rounded-xs">
              completed ✓
            </span>
          )}
        </span>
        <span
          className={`font-serif-title italic text-2xl tabular-nums ${
            scopePct === 100 ? 'text-[#15803d]' : 'text-[#BA4A2C]'
          }`}
        >
          {scopePct} <span className="text-lg font-normal">%</span>
        </span>
      </div>

      {/* Progress line with emerald green if complete, else terracotta */}
      <div className="h-[4px] w-full bg-[#E5DFD3] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            scopePct === 100 ? 'bg-[#15803d]' : 'bg-[#BA4A2C]'
          }`}
          style={{ width: `${scopePct}%` }}
        />
      </div>

      <div className="text-xs text-[#55697D] tabular-nums pt-0.5 flex justify-between items-center">
        <span>
          {scopeCheckedCount} of {scopeTotalWords} words in {isTotal ? 'Total Library' : `Letter ${currentLetter}`} learned
        </span>
        {scopePct === 100 && (
          <span className="text-[#15803d] font-bold font-sans text-[11px]">Group Mastered!</span>
        )}
      </div>
    </div>
  );
};
