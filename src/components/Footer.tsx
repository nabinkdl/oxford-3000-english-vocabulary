import React from 'react';
import { Mail, Heart, BookOpen, Layers, BarChart3, Sparkles, CloudUpload } from 'lucide-react';
import type { ViewMode, MeaningLanguage } from '../types/vocab';
import { TOTAL_WORD_COUNT } from '../data/oxford3000';
import { getMeaningLanguageLabel, MEANING_LANGUAGES } from '../utils/meanings';

interface FooterProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSupportClick: () => void;
  onSaveClick: () => void;
  isSignedIn: boolean;
  masteredCount: number;
  userEmail: string;
  language: MeaningLanguage;
}

const STUDY_LINKS: { mode: ViewMode; label: string; icon: React.ElementType }[] = [
  { mode: 'table', label: 'Word List', icon: BookOpen },
  { mode: 'flashcards', label: 'Flashcards', icon: Layers },
  { mode: 'quiz', label: 'Quiz Mode', icon: Sparkles },
  { mode: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const Footer: React.FC<FooterProps> = ({
  viewMode,
  onViewModeChange,
  onSupportClick,
  onSaveClick,
  isSignedIn,
  masteredCount,
  userEmail,
  language,
}) => {
  const year = new Date().getFullYear();
  const progressPercent = TOTAL_WORD_COUNT > 0 ? Math.round((masteredCount / TOTAL_WORD_COUNT) * 100) : 0;

  return (
    <footer className="mt-16 border-t-[1.5px] border-[#1A232E] bg-[#FAF7F0]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Upper: brand + columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="font-serif-title italic text-3xl leading-none text-[#1A232E]">
              Oxford 3000
            </div>
            <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              Vocabulary Practice
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#55697D]">
              A quiet study space for building everyday English vocabulary, with meanings in{' '}
              {getMeaningLanguageLabel(language)} and {MEANING_LANGUAGES.length - 1} other
              languages.
            </p>
          </div>

          {/* Study */}
          <nav aria-label="Study modes">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              Study
            </h3>
            <ul className="mt-4 space-y-2.5">
              {STUDY_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = viewMode === link.mode;
                return (
                  <li key={link.mode}>
                    <button
                      type="button"
                      onClick={() => onViewModeChange(link.mode)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group inline-flex items-center gap-2 text-sm transition-colors ${
                        isActive
                          ? 'font-bold text-[#1A232E]'
                          : 'text-[#55697D] hover:text-[#1A232E]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className={isActive ? 'border-b border-[#1A232E] pb-px' : ''}>
                        {link.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Progress */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              Your progress
            </h3>
            <p className="mt-4 font-serif-title text-4xl italic leading-none text-[#1A232E]">
              {progressPercent}%
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#55697D]">
              {masteredCount} of {TOTAL_WORD_COUNT} words marked as learned.
            </p>
            <div className="mt-3 h-1 w-full max-w-[180px] bg-[#E0D8CB]">
              <div
                className="h-full bg-[#2D6A4F] transition-[width] duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              Support
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#55697D]">
              This app is free and always will be. If it helps you learn, you can chip in with crypto.
            </p>
            <button
              type="button"
              onClick={onSaveClick}
              className="mt-4 mr-2 inline-flex items-center gap-2 border border-[#1A232E] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#1A232E] transition-colors hover:bg-[#1A232E] hover:text-white rounded-xs cursor-pointer"
            >
              <CloudUpload className="h-3.5 w-3.5" />
              <span>Cloud save</span>
            </button>
            <button
              type="button"
              onClick={onSupportClick}
              className="mt-4 inline-flex items-center gap-2 border border-[#BA4A2C] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#BA4A2C] transition-colors hover:bg-[#BA4A2C] hover:text-white rounded-xs cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Donate</span>
            </button>
            {!isSignedIn && (
              <p className="mt-3 text-[11px] leading-relaxed text-[#6F7D8C]">
                You are studying as a guest. Progress stays in this browser until you cloud save it
                to your account.
              </p>
            )}
          </div>
        </div>

        {/* Rule */}
        <div className="border-t border-[#C8BFB0]/60" />

        {/* Lower: legal + contact */}
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[#6F7D8C]">
            <span className="font-semibold">&copy; {year} Oxford 3000 Vocabulary Practice.</span>{' '}
            <span>Built for language learners.</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {userEmail && (
              <span className="max-w-[200px] truncate text-[#6F7D8C]" title={userEmail}>
                {userEmail}
              </span>
            )}
            <a
              href="mailto:hi.nabinkdl@gmail.com"
              className="inline-flex items-center gap-1.5 text-[#55697D] transition-colors hover:text-[#BA4A2C]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact developer</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
