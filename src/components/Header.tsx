import React from 'react';
import { MeaningLanguage, MeaningLanguageOption, ViewMode } from '../types/vocab';
import { BarChart3, Heart, LogOut } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalMastered: number;
  totalWords: number;
  onResetAll: () => void;
  language: MeaningLanguage;
  languageOptions: MeaningLanguageOption[];
  onLanguageChange: (language: MeaningLanguage) => void;
  cloudTodoCount: number;
  userEmail: string;
  onSignOut: () => void;
  onSupportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  language,
  languageOptions,
  onLanguageChange,
  cloudTodoCount,
  userEmail,
  onSignOut,
  onSupportClick,
}) => {
  return (
    <header className="pt-8 pb-4">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        {/* Main Title: Oxford 3000 in italic serif */}
        <div>
          <h1 className="font-serif-title italic text-5xl sm:text-6xl text-[#1A232E] tracking-tight leading-none select-none">
            Oxford 3000
          </h1>
        </div>

        {/* Right side: Subtitle and Mode switcher */}
        <div className="flex flex-col sm:items-end gap-2.5">
          <div className="sm:text-right">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#55697D] uppercase">
              Vocabulary Practice
            </div>
            <div className="font-serif-title italic text-2xl text-[#1A232E] leading-tight">
              English – {languageOptions.find((option) => option.code === language)?.label}
            </div>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as MeaningLanguage)}
              className="mt-2 w-full sm:w-auto border-b border-[#C8BFB0] bg-transparent py-1 text-xs font-semibold text-[#55697D] focus:outline-none"
              aria-label="Meaning language"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} ({option.nativeLabel})
                </option>
              ))}
            </select>
            {cloudTodoCount > 0 && (
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#6F7D8C]">
                {cloudTodoCount} shared {cloudTodoCount === 1 ? 'todo' : 'todos'}
              </div>
            )}
            <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#6F7D8C]">
              <span className="max-w-[180px] truncate normal-case tracking-normal" title={userEmail}>
                {userEmail}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1 text-[#55697D] transition-colors hover:text-[#BA4A2C]"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Clean Editorial Study Modes including Analytics Dashboard */}
          <div className="flex items-center gap-1 pt-1 flex-wrap">
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'border-b-2 border-[#1A232E] text-[#1A232E]'
                  : 'text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
            >
              Table View
            </button>
            <span className="text-[#C8BFB0] text-xs">/</span>
            <button
              onClick={() => onViewModeChange('flashcards')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'flashcards'
                  ? 'border-b-2 border-[#1A232E] text-[#1A232E]'
                  : 'text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
            >
              Flashcards
            </button>
            <span className="text-[#C8BFB0] text-xs">/</span>
            <button
              onClick={() => onViewModeChange('quiz')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'quiz'
                  ? 'border-b-2 border-[#1A232E] text-[#1A232E]'
                  : 'text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
            >
              Quiz Mode
            </button>
            <span className="text-[#C8BFB0] text-xs">/</span>
            <button
              onClick={() => onViewModeChange('analytics')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'analytics'
                  ? 'border-b-2 border-[#1A232E] text-[#1A232E]'
                  : 'text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <span className="text-[#C8BFB0] text-xs">/</span>
            <button
              onClick={onSupportClick}
              className="px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 text-[#BA4A2C] hover:text-[#1A232E]"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent dark horizontal rule */}
      <div className="border-b-[1.5px] border-[#1A232E] mt-5 mb-6" />
    </header>
  );
};
