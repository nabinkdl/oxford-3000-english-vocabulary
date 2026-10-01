import React, { useEffect } from 'react';
import { Mail, X, TrendingUp, Eye } from 'lucide-react';

/**
 * Rate card shown when an advertiser clicks an empty ad slot.
 *
 * The prices below are placeholders — edit `AD_RATES` to change them. Slot ids
 * match the `id` passed to each <AdSlot> in the app, so an advertiser can see
 * exactly which placement a rate applies to.
 */

interface AdRate {
  /** Slot this rate applies to. A bundle lists several, comma separated. */
  slotId: string;
  placement: string;
  spec: string;
  period: string;
  price: string;
}

const AD_RATES: AdRate[] = [
  {
    slotId: 'letternav-inline',
    placement: 'Letter bar',
    spec: '728×90 responsive, inline after Z',
    period: 'per month',
    price: '$60',
  },
  {
    slotId: 'analytics-top',
    placement: 'Analytics dashboard, top',
    spec: '970×90 / 728×90 responsive banner',
    period: 'per week',
    price: '$25',
  },
  {
    slotId: 'below-content',
    placement: 'Below content, above footer',
    spec: '970×250 / 728×250 rectangle',
    period: 'per week',
    price: '$13',
  },
];

/** True when the clicked slot is part of the given rate row. */
const rateMatchesSlot = (rate: AdRate, slotId: string) =>
  rate.slotId.split(',').map((id) => id.trim()).includes(slotId);

const AD_EMAIL = 'hi.nabinkdl@gmail.com';

interface AdInquiryModalProps {
  isOpen: boolean;
  /** Slot the visitor clicked, used to highlight the matching rate. */
  slotId: string;
  onClose: () => void;
}

export const AdInquiryModal: React.FC<AdInquiryModalProps> = ({ isOpen, slotId, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchingRates = AD_RATES.filter((rate) => rateMatchesSlot(rate, slotId));
  const matchingSummary = matchingRates
    .map((rate) => `${rate.placement} (${rate.price} ${rate.period})`)
    .join(', ');

  const mailSubject = encodeURIComponent(`Ad placement enquiry — ${slotId}`);
  const mailBody = encodeURIComponent(
    `Hello,\n\nI would like to place an ad on Oxford 3000 Vocabulary Practice.\n\n` +
      `Slot clicked: ${slotId}\n` +
      `Rates that cover it:\n${matchingSummary}\n\n` +
      `Package I am interested in:\n` +
      `My website / product:\n` +
      `Target start date:\n\n` +
      `Thanks.`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1A232E]/75 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Advertising rates"
    >
      <div
        className="w-full max-w-lg bg-[#FAF7F0] border border-[#C8BFB0] shadow-2xl rounded-xs"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C8BFB0] px-5 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#BA4A2C]" />
            <h2 className="font-serif-title italic text-2xl leading-none text-[#1A232E]">
              Advertise here
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#7B8B9E] transition-colors hover:text-[#1A232E]"
            aria-label="Close advertising rates"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <p className="text-sm leading-relaxed text-[#55697D]">
            This space is available. Rates cover display on desktop and mobile. Ads do not appear on
            the quiz or flashcard views.
          </p>

          {/* Rate table */}
          <div className="border border-[#D5CDBD]">
            <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-[#D5CDBD] bg-[#EDE8DD] px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
                Placement
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
                Rate
              </span>
            </div>
            {AD_RATES.map((rate) => {
              const isClicked = rateMatchesSlot(rate, slotId);
              return (
                <div
                  key={rate.slotId}
                  className={`grid grid-cols-[1fr_auto] items-center gap-x-4 border-b border-[#E0D8CB] px-4 py-3 last:border-b-0 ${
                    isClicked ? 'bg-[#F3EDE2]' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#1A232E]">{rate.placement}</span>
                      {isClicked && (
                        <span className="bg-[#BA4A2C] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#6F7D8C]">{rate.spec}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-[#9AA5AE]">{rate.slotId}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif-title text-2xl italic leading-none text-[#1A232E]">
                      {rate.price}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-[#9AA5AE]">
                      {rate.period}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audience note */}
          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-[#6F7D8C]">
            <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Audiences are English learners studying the Oxford 3000. Placements are labelled
              &ldquo;Advertisement&rdquo; and appear on the word list, analytics, and about views only.
            </span>
          </div>

          {/* Contact */}
          <a
            href={`mailto:${AD_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
            className="inline-flex items-center gap-2 border border-[#1A232E] bg-[#1A232E] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2A3B4E] rounded-xs"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Contact developer</span>
          </a>
          <p className="text-[11px] text-[#6F7D8C]">
            Prefer to write directly?{' '}
            <a
              href={`mailto:${AD_EMAIL}`}
              className="font-semibold text-[#1A232E] underline underline-offset-2 hover:text-[#BA4A2C]"
            >
              {AD_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
