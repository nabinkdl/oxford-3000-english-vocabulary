import React, { useEffect, useRef, useState } from 'react';
import { AdInquiryModal } from './AdInquiryModal';

/**
 * Lightweight ad slot.
 *
 * No ad network is wired up yet — this provides the layout, responsive sizing,
 * labelling, and lazy loading so a network script (AdSense, Adsterra, etc.) can
 * be dropped in later without touching the page structure.
 *
 * To activate a slot, set the matching `VITE_AD_*` variable in `.env.local` and
 * add the network's script/inscription markup inside the provider callback.
 */

export type AdFormat =
  | 'leaderboard'
  | 'rectangle'
  | 'mobile-banner'
  | 'wide-banner'
  | 'letternav';

export interface AdSlotProps {
  /** Logical slot name, useful for ad network reporting. */
  id: string;
  format?: AdFormat;
  className?: string;
}

const FORMAT_STYLES: Record<AdFormat, { box: string; slot: string; label: string }> = {
  leaderboard: {
    box: 'w-full',
    slot: 'min-h-[110px] sm:min-h-[120px]',
    label: 'Advertisement',
  },
  rectangle: {
    box: 'w-full',
    slot: 'min-h-[280px]',
    label: 'Advertisement',
  },
  'mobile-banner': {
    box: 'w-full',
    slot: 'min-h-[50px]',
    label: 'Advertisement',
  },
  // Wide, short strip used on the analytics dashboard. Sized for a
  // 728x90 / 970x90 responsive banner.
  'wide-banner': {
    box: 'w-full',
    slot: 'min-h-[70px] sm:min-h-[90px]',
    label: 'Advertisement',
  },
  // Compact block sized to sit inline after the Z tile in the letter bar.
  // Stretches to fill whatever width is left in the row and matches the height
  // of the letter tiles, so a wide banner still lands inside a shallow slot.
  letternav: {
    box: 'w-full h-full',
    slot: 'min-h-[58px]',
    label: 'Ad',
  },
};

export const AdSlot: React.FC<AdSlotProps> = ({ id, format = 'leaderboard', className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = React.useState(false);

  // Only load an ad once the slot is close to the viewport. Keeps first paint
  // fast and avoids requesting ads for content the user never scrolls to.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const styles = FORMAT_STYLES[format];
  // Compact slots skip the lazy placeholder stage and the metadata line so they
  // stay legible at the smaller inline size.
  const isCompact = format === 'letternav' || format === 'mobile-banner';

  return (
    <aside
      ref={containerRef}
      data-ad-slot={id}
      data-ad-format={format}
      aria-label={styles.label}
      className={`${styles.box} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsInquiryOpen(true)}
        title="Advertise in this space"
        aria-label={`Advertisement slot ${id}. Click to see advertising rates.`}
        className={`w-full cursor-pointer border border-dashed border-[#C8BFB0] bg-[#F3EDE2] text-center transition-colors hover:border-[#BA4A2C] hover:bg-[#EDE8DD] ${
          isCompact ? 'h-full' : ''
        }`}
      >
        {isCompact ? (
          <div
            className={`flex flex-col items-center justify-center gap-0.5 px-2 ${styles.slot}`}
            data-ad-mount={id}
          >
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#9AA5AE]">
              {styles.label}
            </span>
            <span className="font-serif-title text-sm italic leading-tight text-[#9AA5AE]">
              Put your ads here
            </span>
          </div>
        ) : (
          <>
            <span className="block pt-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#9AA5AE]">
              {styles.label}
            </span>
            {isVisible ? (
              <div
                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 ${styles.slot}`}
                data-ad-mount={id}
              >
                <span className="font-serif-title text-xl sm:text-2xl italic text-[#9AA5AE]">
                  Put your ads here
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4BDC5]">
                  {id} &middot; {format}
                </span>
              </div>
            ) : (
              <div className={styles.slot} aria-hidden="true" />
            )}
          </>
        )}
      </button>

      <AdInquiryModal
        isOpen={isInquiryOpen}
        slotId={id}
        onClose={() => setIsInquiryOpen(false)}
      />
    </aside>
  );
};

/**
 * Sticky bottom banner for mobile. Hidden on desktop where the in-content
 * leaderboards already cover the page.
 */
export const AdStickyBar: React.FC = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C8BFB0] bg-[#FAF7F0]/95 px-3 py-2 backdrop-blur-sm sm:hidden">
      <AdSlot id="sticky-mobile" format="mobile-banner" />
    </div>
  );
};
