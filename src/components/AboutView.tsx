import React from 'react';
import { BookOpen, Cloud, Languages, Star, ExternalLink, FileText, Mail } from 'lucide-react';
import type { MeaningLanguage } from '../types/vocab';
import { getMeaningLanguageLabel, MEANING_LANGUAGES } from '../utils/meanings';

interface AboutViewProps {
  language: MeaningLanguage;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const languageLabel = getMeaningLanguageLabel(language);
  const languageCount = MEANING_LANGUAGES.length;
  return (
    <section className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-[#D5CDBD] pb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
          About the library
        </div>
        <h2 className="mt-2 font-serif-title italic text-4xl sm:text-5xl text-[#1A232E]">
          Learn words at your own pace.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#55697D]">
          Oxford 3000 Vocabulary Practice is a focused study space for building a stronger everyday
          English vocabulary with meanings in {languageLabel} and {languageCount - 1} other
          languages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="border border-[#D5CDBD] bg-[#FAF7F0] p-5 rounded-xs">
          <BookOpen className="h-5 w-5 text-[#BA4A2C]" />
          <h3 className="mt-3 font-serif-title italic text-2xl text-[#1A232E]">Study your way</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#55697D]">
            Move between the vocabulary table, flashcards, quizzes, and analytics as your study
            session changes.
          </p>
        </article>

        <article className="border border-[#D5CDBD] bg-[#FAF7F0] p-5 rounded-xs">
          <Languages className="h-5 w-5 text-[#007A78]" />
          <h3 className="mt-3 font-serif-title italic text-2xl text-[#1A232E]">Meaning that stays</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#55697D]">
            {languageLabel} meanings are bundled with the library, so the core meaning remains
            available even when you are offline.
          </p>
        </article>

        <article className="border border-[#D5CDBD] bg-[#FAF7F0] p-5 rounded-xs">
          <Star className="h-5 w-5 text-[#BA4A2C]" />
          <h3 className="mt-3 font-serif-title italic text-2xl text-[#1A232E]">Save for later</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#55697D]">
            Mark difficult words for later and review your personal collection whenever you are
            ready.
          </p>
        </article>

        <article className="border border-[#D5CDBD] bg-[#FAF7F0] p-5 rounded-xs">
          <Cloud className="h-5 w-5 text-[#2D8A55]" />
          <h3 className="mt-3 font-serif-title italic text-2xl text-[#1A232E]">Keep your progress</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#55697D]">
            Your learning progress and saved words are kept locally and synced to your account when
            cloud progress is available.
          </p>
        </article>
      </div>

      {/* Official source of the word list */}
      <div className="border border-[#D5CDBD] bg-[#EDE8DD] p-5 rounded-xs">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#BA4A2C]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
            Official word list
          </h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#55697D]">
          This app is built from the official Oxford 3000 word list. Download the original PDF from
          Oxford Learner's Dictionaries to see the full list with definitions, examples, and
          pronunciation guides.
        </p>
        <a
          href="https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/American_Oxford_3000.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 border border-[#1A232E] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#1A232E] transition-colors hover:bg-[#1A232E] hover:text-white rounded-xs"
        >
          <span>Open Oxford 3000 PDF</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="mt-3 text-[11px] leading-relaxed text-[#6F7D8C]">
          &ldquo;Oxford&rdquo; and the Oxford 3000 word list are property of Oxford University Press.
          This is an unofficial study tool and is not affiliated with or endorsed by OUP.
        </p>
      </div>

      {/* Contact */}
      <div className="border border-[#D5CDBD] bg-[#FAF7F0] p-5 rounded-xs">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#007A78]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
            Contact developer
          </h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#55697D]">
          Found a mistake in a meaning, spotted a bug, or want to request a feature? Send a note and
          it will be read.
        </p>
        <a
          href="mailto:hi.nabinkdl@gmail.com"
          className="mt-4 inline-flex items-center gap-2 border border-[#1A232E] px-4 py-2 text-[11px] font-semibold tracking-wide text-[#1A232E] transition-colors hover:bg-[#1A232E] hover:text-white rounded-xs break-all"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span>hi.nabinkdl@gmail.com</span>
        </a>
      </div>
    </section>
  );
};
