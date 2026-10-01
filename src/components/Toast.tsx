import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <div className="bg-[#1A232E] text-white px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider shadow-lg border border-[#C8BFB0]/30 flex items-center gap-2">
        <span>{message}</span>
      </div>
    </div>
  );
};
