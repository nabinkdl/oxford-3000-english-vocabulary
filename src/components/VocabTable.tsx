import React, { useState, useMemo } from 'react';
import { MeaningLanguage, WordItem } from '../types/vocab';
import { MEANING_LANGUAGES } from '../utils/meanings';
import { MeaningText } from './MeaningText';
import { Volume2, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { playPronunciation } from '../utils/speech';

interface VocabTableProps {
  words: WordItem[];
  checkedIds: Set<string>;
  starredIds: Set<string>;
  onToggleCheck: (id: string) => void;
  onToggleStar: (id: string) => void;
  currentLetter: string;
  language: MeaningLanguage;
}

export const VocabTable: React.FC<VocabTableProps> = ({
  words,
  checkedIds,
  starredIds,
  onToggleCheck,
  onToggleStar,
  currentLetter,
  language,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50; // smooth pagination for large sets
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  const totalPages = Math.ceil(words.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedWords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return words.slice(start, start + pageSize);
  }, [words, safePage, pageSize]);

  // CEFR Badge style matching screenshot
  const getLevelStyle = (level: string) => {
    if (level.includes('A1')) {
      return 'border-[#2D8A55] text-[#2D8A55]';
    }
    if (level.includes('A2')) {
      return 'border-[#007A78] text-[#007A78]';
    }
    if (level.includes('B1')) {
      return 'border-[#9C5B00] text-[#9C5B00]';
    }
    if (level.includes('B2')) {
      return 'border-[#BA4A2C] text-[#BA4A2C]';
    }
    return 'border-[#55697D] text-[#55697D]';
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[#E0D8CB] text-xs font-serif-title italic text-[#55697D]">
              <th className="py-3 px-3 w-12 text-center"></th>
              <th className="py-3 px-3 w-12 text-left">№</th>
              <th className="py-3 px-4 min-w-[180px]">Word</th>
              <th className="py-3 px-3 w-16 text-center">Level</th>
              <th className="py-3 px-4 min-w-[280px]">English</th>
              <th className="py-3 px-4 min-w-[200px]">
                {MEANING_LANGUAGES.find((option) => option.code === language)?.label}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE4D8]">
            {paginatedWords.map((item, idx) => {
              const isChecked = checkedIds.has(item.id);
              const absoluteIdx = (safePage - 1) * pageSize + idx + 1;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors group hover:bg-[#F3EDE2] ${
                    isChecked ? 'bg-[#E9EFE6]' : 'bg-[#FAF7F0]'
                  }`}
                >
                  {/* Checkbox cell */}
                  <td className="py-3 px-3 text-center align-middle">
                    <button
                      onClick={() => onToggleCheck(item.id)}
                      className={`w-[18px] h-[18px] rounded-xs flex items-center justify-center transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#2A593D] text-white'
                          : 'border border-[#C8BFB0] bg-white hover:border-[#1A232E]'
                      }`}
                      title={isChecked ? 'Mark unlearned' : 'Mark learned'}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Number cell */}
                  <td className="py-3 px-3 text-xs text-[#6F7D8C] tabular-nums font-mono align-middle">
                    {absoluteIdx}
                  </td>

                  {/* Word & Part of speech */}
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-baseline gap-2">
                      <span
                        onClick={() => setSelectedWord(item)}
                        className={`font-serif-title text-xl font-normal tracking-tight cursor-pointer ${
                          isChecked
                            ? 'word-learned'
                            : 'text-[#1A232E] hover:text-[#BA4A2C]'
                        }`}
                      >
                        {item.word}
                      </span>

                      <span className="text-[10px] font-sans tracking-wider text-[#6F7D8C] uppercase">
                        {item.type}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(item.word);
                        }}
                        className="opacity-40 group-hover:opacity-100 hover:text-[#BA4A2C] transition-opacity p-0.5 cursor-pointer ml-1"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Level Box */}
                  <td className="py-3 px-3 text-center align-middle">
                    <span
                      className={`inline-block px-1.5 py-0.5 border text-[11px] font-bold tracking-wider font-mono rounded-xs ${getLevelStyle(
                        item.level
                      )}`}
                    >
                      {item.level}
                    </span>
                  </td>

                  {/* English Definition */}
                  <td className="py-3 px-4 text-sm text-[#2C3B49] leading-relaxed align-middle">
                    {item.english}
                  </td>

                  {/* Nepali Meaning */}
                  <td className="py-3 px-4 text-base font-bold font-nepali text-[#1A232E] leading-relaxed align-middle">
                    <MeaningText word={item.word} nepali={item.nepali} language={language} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-2 border-t border-[#E0D8CB] text-xs text-[#55697D]">
          <div>
            Showing <strong className="text-[#1A232E]">{(safePage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-[#1A232E]">
              {Math.min(safePage * pageSize, words.length)}
            </strong>{' '}
            of <strong className="text-[#1A232E]">{words.length}</strong> words
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1 rounded-xs border border-[#C8BFB0] bg-white text-[#1A232E] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif-title italic text-sm">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1 rounded-xs border border-[#C8BFB0] bg-white text-[#1A232E] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {words.length === 0 && (
        <div className="py-16 text-center text-[#55697D]">
          <p className="font-serif-title italic text-2xl mb-1 text-[#1A232E]">No words found</p>
          <p className="text-xs">Adjust your search or filter to see vocabulary items.</p>
        </div>
      )}

      {/* Word Detail Drawer / Modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#C8BFB0] p-6 sm:p-8 max-w-lg w-full shadow-2xl rounded-xs space-y-4 text-[#1A232E]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E0D8CB] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6F7D8C]">
                    {selectedWord.type}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 border text-[10px] font-bold font-mono rounded-xs ${getLevelStyle(
                      selectedWord.level
                    )}`}
                  >
                    {selectedWord.level}
                  </span>
                </div>
                <h2 className="font-serif-title text-4xl text-[#1A232E] italic">
                  {selectedWord.word}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playPronunciation(selectedWord.word)}
                  className="p-2 border border-[#C8BFB0] bg-white text-[#1A232E] hover:border-[#1A232E] rounded-xs cursor-pointer"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="p-2 text-[#55697D] hover:text-[#1A232E] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-[#EDE8DD] p-4 rounded-xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#55697D]">
                {MEANING_LANGUAGES.find((option) => option.code === language)?.label} Meaning
                ({MEANING_LANGUAGES.find((option) => option.code === language)?.nativeLabel})
              </div>
              <div className="text-2xl font-bold font-nepali text-[#1A232E]">
                <MeaningText
                  word={selectedWord.word}
                  nepali={selectedWord.nepali}
                  language={language}
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#55697D]">
                English Definition
              </div>
              <p className="text-sm text-[#2C3B49] leading-relaxed">
                {selectedWord.english}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E0D8CB] flex justify-end">
              <button
                onClick={() => {
                  onToggleCheck(selectedWord.id);
                  setSelectedWord(null);
                }}
                className="px-4 py-2 bg-[#1A232E] hover:bg-[#2A3B4E] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
              >
                {checkedIds.has(selectedWord.id) ? 'Mark as Unlearned' : 'Mark as Learned ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
