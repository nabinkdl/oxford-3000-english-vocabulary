import React from 'react';
import { FilterStatus, CEFRFilter } from '../types/vocab';
import { X, CheckCheck, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  currentLetter: string;
  totalCount: number;
  learnedCount: number;
  remainingCount: number;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cefrFilter: CEFRFilter;
  onCEFRChange: (lvl: CEFRFilter) => void;
  onCheckAll: () => void;
  onResetScope: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentLetter,
  totalCount,
  learnedCount,
  remainingCount,
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  cefrFilter,
  onCEFRChange,
  onCheckAll,
  onResetScope,
}) => {
  const isTotal = currentLetter === 'ALL';

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left Segmented Control: TOTAL X, LEARNED Y, REMAINING Z */}
        <div className="flex items-center bg-[#EDE8DD] p-1 rounded-xs gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-white text-[#1A232E] shadow-xs'
                : 'text-[#55697D] hover:text-[#1A232E]'
            }`}
          >
            TOTAL {totalCount}
          </button>

          <button
            onClick={() => onFilterChange('checked')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterStatus === 'checked'
                ? learnedCount === totalCount && totalCount > 0
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-white text-[#2D6A4F] shadow-xs'
                : learnedCount === totalCount && totalCount > 0
                ? 'text-[#15803d] font-black hover:bg-[#E9EFE6]'
                : 'text-[#55697D] hover:text-[#2D6A4F]'
            }`}
          >
            <span>LEARNED {learnedCount}</span>
            {learnedCount === totalCount && totalCount > 0 && <span>✓</span>}
          </button>

          <button
            onClick={() => onFilterChange('unchecked')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'unchecked'
                ? 'bg-white text-[#BA4A2C] shadow-xs'
                : 'text-[#55697D] hover:text-[#BA4A2C]'
            }`}
          >
            REMAINING {remainingCount}
          </button>
        </div>

        {/* Center: Underline Search Box */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isTotal
                ? 'Search all words — English or Nepali...'
                : `Search in ${currentLetter} — English or Nepali...`
            }
            className="w-full bg-transparent border-b border-[#C8BFB0] py-1.5 px-1 text-sm italic font-serif-title text-[#1A232E] placeholder-[#8A9BA8] focus:outline-none focus:border-[#1A232E] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-[#8A9BA8] hover:text-[#1A232E] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Actions: MARK ALL LEARNED, RESET LETTER */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider self-end lg:self-auto">
          <button
            onClick={onCheckAll}
            className="pb-0.5 border-b-2 border-[#BA4A2C] text-[#1A232E] hover:text-[#BA4A2C] transition-colors cursor-pointer"
          >
            MARK ALL LEARNED
          </button>

          <button
            onClick={onResetScope}
            className="flex items-center gap-1 text-[#7B8B9E] hover:text-[#BA4A2C] transition-colors cursor-pointer"
            title={`Reset progress for ${isTotal ? 'Total Library' : `Letter ${currentLetter}`}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isTotal ? 'RESET TOTAL' : 'RESET LETTER'}</span>
          </button>
        </div>
      </div>

      {/* Secondary filter: CEFR Level chips */}
      <div className="flex items-center gap-1.5 pt-1 text-xs text-[#55697D]">
        <span className="font-semibold uppercase tracking-wider text-[10px]">Filter Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as CEFRFilter[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => onCEFRChange(lvl)}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer text-xs font-semibold ${
              cefrFilter === lvl
                ? 'bg-[#1A232E] text-white'
                : 'text-[#55697D] hover:bg-[#EDE8DD] hover:text-[#1A232E]'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>
    </div>
  );
};
