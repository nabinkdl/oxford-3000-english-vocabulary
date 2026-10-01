import React from 'react';
import { MeaningLanguage, MeaningLanguageOption, ViewMode } from '../types/vocab';
import { BarChart3, Heart, Info, LogOut, Save, CloudUpload } from 'lucide-react';

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
  isSignedIn: boolean;
  onSignOut: () => void;
  onSupportClick: () => void;
  onSaveClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  language,
  languageOptions,
  onLanguageChange,
  cloudTodoCount,
  userEmail,
  isSignedIn,
  onSignOut,
  onSupportClick,
  onSaveClick,
}) => {
  return (
    <header className="pt-8 pb-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
        {/* Main Title: Oxford 3000 in italic serif */}
        <div className="flex flex-col gap-2.5">
          <h1 className="font-serif-title italic text-5xl sm:text-6xl text-[#1A232E] tracking-tight leading-none select-none">
            Oxford 3000
          </h1>
          <div className="text-left">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#55697D] uppercase">
              Vocabulary Practice
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="font-serif-title italic text-2xl text-[#1A232E] leading-tight">
                English – {languageOptions.find((option) => option.code === language)?.label}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6F7D8C]">
                  Language
                </span>
                <select
                  value={language}
                  onChange={(event) => onLanguageChange(event.target.value as MeaningLanguage)}
                  className="border-b border-[#C8BFB0] bg-transparent py-0.5 text-xs font-semibold text-[#55697D] focus:outline-none"
                  aria-label="Meaning language"
                >
                  {languageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label} ({option.nativeLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Subtitle and Mode switcher */}
        <div className="flex flex-col sm:items-end">
          <div className="sm:text-right">
            {cloudTodoCount > 0 && (
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#6F7D8C]">
                {cloudTodoCount} shared {cloudTodoCount === 1 ? 'todo' : 'todos'}
              </div>
            )}
            <div className="mt-3 border-t border-[#E0D8CB] pt-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6F7D8C]">
                {isSignedIn ? 'Account' : 'Guest mode'}
              </div>
              {isSignedIn ? (
                <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-semibold text-[#6F7D8C]">
                  <span className="max-w-[180px] truncate" title={userEmail}>
                    {userEmail}
                  </span>
                  <button
                    type="button"
                    onClick={onSaveClick}
                    className="inline-flex items-center gap-1 text-[#55697D] transition-colors hover:text-[#1A232E]"
                    title="Cloud save"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Cloud save</span>
                  </button>
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
              ) : (
                <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-semibold text-[#6F7D8C]">
                  <span className="hidden sm:inline">Saved on this device</span>
                  <button
                    type="button"
                    onClick={onSaveClick}
                    className="inline-flex items-center gap-1 border border-[#1A232E] px-2 py-1 text-[#1A232E] transition-colors hover:bg-[#1A232E] hover:text-white rounded-xs"
                    title="Sign in to cloud save your progress across devices"
                  >
                    <CloudUpload className="h-3.5 w-3.5" />
                    <span>Cloud save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent dark horizontal rule */}
      <div className="mt-3 mb-4 border-b-[1.5px] border-[#1A232E] flex items-center justify-center sm:justify-end">
        <nav className="flex items-center gap-1 flex-wrap py-1.5">
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
            <span className="text-[#C8BFB0] text-xs">/</span>
            <button
              onClick={() => onViewModeChange('about')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'about'
                  ? 'border-b-2 border-[#1A232E] text-[#1A232E]'
                  : 'text-[#7B8B9E] hover:text-[#1A232E]'
              }`}
              title="About this vocabulary practice"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
        </nav>
      </div>
    </header>
  );
};
