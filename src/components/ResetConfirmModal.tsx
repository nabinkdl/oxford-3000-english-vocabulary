import React, { useEffect } from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scopeTitle: string; // e.g. "Letter A" or "Total Library"
  wordsCount: number; // e.g. number of learned words that will be unlearned
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  scopeTitle,
  wordsCount,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#FAF7F0] border-2 border-[#1A232E] w-full max-w-md p-6 sm:p-7 rounded-xs shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#8A9BA8] hover:text-[#1A232E] rounded-xs cursor-pointer transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xs bg-[#FFF0ED] border border-[#BA4A2C] text-[#BA4A2C] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BA4A2C]">
              Confirm Reset
            </div>
            <h3 className="font-serif-title italic text-2xl sm:text-3xl text-[#1A232E] leading-tight mt-0.5">
              Reset {scopeTitle}?
            </h3>
          </div>
        </div>

        {/* Informative text */}
        <div className="bg-[#EDE8DD] border border-[#C8BFB0] p-4 rounded-xs text-xs text-[#55697D] space-y-1.5 leading-relaxed">
          <p className="text-[#1A232E] font-medium">
            Are you sure you want to reset your learning progress for{' '}
            <strong className="underline decoration-dotted">{scopeTitle}</strong>?
          </p>
          <p>
            This action will uncheck{' '}
            <strong className="text-[#BA4A2C] font-mono">{wordsCount}</strong> learned word
            {wordsCount !== 1 ? 's' : ''} in this section.
          </p>
          <p className="text-[11px] text-[#8A9BA8]">
            Starred words and quiz scores will be preserved.
          </p>
        </div>

        {/* Action Buttons: Cancel (safe) vs Reset (destructive) */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-[#C8BFB0] hover:border-[#1A232E] text-[#1A232E] text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            Keep My Progress
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#BA4A2C] hover:bg-[#A33D22] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yes, Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
