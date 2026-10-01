import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Heart, ExternalLink, TriangleAlert } from 'lucide-react';
import { DONATION_WALLETS } from '../utils/donations';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(DONATION_WALLETS[0].id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selected = DONATION_WALLETS.find((w) => w.id === selectedId) ?? DONATION_WALLETS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selected.address);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = selected.address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A232E]/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Support with crypto donation"
    >
      <div
        className="w-full max-w-md bg-[#FAF7F0] border border-[#C8BFB0] shadow-xl rounded-sm max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#C8BFB0]/50">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#BA4A2C]" fill="currentColor" />
            <h2 className="font-serif-title italic text-2xl text-[#1A232E] leading-none">
              Support this project
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#7B8B9E] hover:text-[#1A232E] transition-colors"
            aria-label="Close support dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-[#55697D] leading-relaxed">
            If Oxford 3000 helps you learn, consider a small crypto donation.
            Select a network below and scan the QR or copy the address.
          </p>

          {/* Chain selector */}
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-1.5" role="tablist" aria-label="Select network">
            {DONATION_WALLETS.map((w) => (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={selectedId === w.id}
                onClick={() => {
                  setSelectedId(w.id);
                  setCopied(false);
                }}
                className={`px-2 py-2 text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer rounded-xs flex flex-col items-center gap-1.5 ${
                  selectedId === w.id
                    ? 'bg-[#1A232E] text-white border-[#1A232E]'
                    : 'bg-transparent text-[#55697D] border-[#C8BFB0] hover:border-[#1A232E] hover:text-[#1A232E]'
                }`}
              >
                <img
                  src={w.icon}
                  alt={`${w.label} icon`}
                  className="h-6 w-6 rounded-full"
                  loading="lazy"
                />
                {w.label}
              </button>
            ))}
          </div>

          {/* QR + address */}
          <div className="mt-4 flex flex-col items-center bg-white border border-[#C8BFB0]/60 rounded-sm p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              <img src={selected.icon} alt={`${selected.label} icon`} className="h-5 w-5 rounded-full" />
              <span>
                {selected.network} — {selected.symbol}
              </span>
            </div>
            <div className="mt-3 bg-white p-2 border border-[#C8BFB0]/50 rounded-xs">
              <QRCodeSVG value={selected.address} size={180} level="M" includeMargin={false} />
            </div>
            <div className="mt-3 w-full flex items-center gap-2 bg-[#FAF7F0] border border-[#C8BFB0] rounded-xs px-3 py-2">
              <code className="flex-1 text-[11px] text-[#1A232E] break-all font-mono leading-relaxed">
                {selected.address}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#1A232E] text-white rounded-xs hover:bg-[#BA4A2C] transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <a
              href={selected.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#55697D] hover:text-[#BA4A2C] transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Verify on block explorer
            </a>
          </div>

          <div className="mt-3 flex items-start gap-2 bg-[#FFF7E6] border border-[#E8C547]/50 rounded-xs px-3 py-2.5">
            <TriangleAlert className="h-4 w-4 shrink-0 text-[#8a6d00] mt-px" />
            <p className="text-[11px] leading-relaxed text-[#5c4a00]">{selected.note}</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider border border-[#1A232E] text-[#1A232E] hover:bg-[#1A232E] hover:text-white transition-colors rounded-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
