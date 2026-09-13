'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/content';

export function NavbarMobileMenu({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:border-amber-600 transition-all shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm border-l border-border bg-bg p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <span className="font-display font-bold text-lg text-text">Navigation</span>
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10">
                  Affordable Decoration
                </span>
              </div>

              {/* Quick Builder Banner Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <Link
                  href="/custom-canvas"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 font-bold text-xs text-center transition-transform active:scale-95 shadow-sm"
                >
                  <span className="text-xl mb-1">🖼️</span>
                  <span>Custom Canvas</span>
                </Link>
                <Link
                  href="/customize-tshirt"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface text-text font-bold text-xs text-center transition-transform active:scale-95 shadow-sm"
                >
                  <span className="text-xl mb-1">👕</span>
                  <span>Customize T-Shirt</span>
                </Link>
              </div>

              {/* Main Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold text-text hover:bg-surface-hover hover:text-amber-600 transition-colors"
                  >
                    <span>{item.label}</span>
                    <span className="text-muted text-xs">→</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions inside mobile drawer */}
            <div className="pt-6 border-t border-border mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-surface text-text hover:border-amber-600"
                >
                  <span>🔍</span> Search
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-surface text-text hover:border-amber-600"
                >
                  <span>❤️</span> Wishlist
                </Link>
              </div>
              <Link
                href="/track-order"
                onClick={() => setOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-sm hover:bg-amber-700 transition-colors"
              >
                📦 Track Order Progress
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
