'use client';

import Link from 'next/link';

export function AnnouncementBar({
  message,
  href,
}: {
  message?: string | null;
  href?: string | null;
}) {
  const defaultMessage =
    '🇳🇵 Free Delivery Across Kathmandu Valley on Orders Over Rs. 2,000! Express Cash on Delivery Available.';
  const defaultHref = 'https://affordabledecoration.vercel.app/custom-canvas';

  const activeMessage = message || defaultMessage;
  const targetHref = href || defaultHref;

  // Repeat items for a rich continuous horizontal marquee
  const tickerItems = [
    activeMessage,
    '🖼️ Handcrafted 1 to 7 Panel Custom Photo Canvas Wall Art',
    activeMessage,
    '⚡ Express Cash on Delivery Available Across All 77 Districts in Nepal',
  ];

  const renderSingleItem = (text: string, index: number) => {
    const isExternal = targetHref.startsWith('http://') || targetHref.startsWith('https://');

    const itemInner = (
      <span className="inline-flex items-center gap-2.5 px-3 text-xs sm:text-sm font-semibold tracking-wide text-amber-950 dark:text-amber-100 hover:text-amber-900 transition-colors">
        <span>{text}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/10 dark:bg-white/20 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white group-hover:bg-slate-900 group-hover:text-white transition-all shadow-xs">
          Order Now →
        </span>
        <span className="ml-2 font-bold text-amber-800/40 dark:text-amber-200/40">✦</span>
      </span>
    );

    if (isExternal) {
      return (
        <a
          key={`marquee-item-${index}`}
          href={targetHref}
          target="_self"
          className="inline-block transition-transform duration-150 hover:scale-[1.01] focus:outline-none"
        >
          {itemInner}
        </a>
      );
    }

    return (
      <Link
        key={`marquee-item-${index}`}
        href={targetHref}
        className="inline-block transition-transform duration-150 hover:scale-[1.01] focus:outline-none"
      >
        {itemInner}
      </Link>
    );
  };

  return (
    <div
      className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600 py-2 border-b border-amber-500/30 shadow-xs select-none"
      aria-label="Announcement marquee carousel"
    >
      {/* Subtle fade edges for seamless entrance/exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-amber-400 dark:from-amber-600 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-amber-400 dark:from-amber-600 to-transparent" />

      <div className="flex w-max animate-marquee">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center space-x-4">
          {tickerItems.map((item, idx) => renderSingleItem(item, idx))}
        </div>
        {/* Track 2 (Duplicate for continuous 100% infinite loop) */}
        <div className="flex shrink-0 items-center space-x-4" aria-hidden="true">
          {tickerItems.map((item, idx) => renderSingleItem(item, idx + tickerItems.length))}
        </div>
      </div>
    </div>
  );
}
