'use me';
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '@/lib/content';

export function NavbarMobileMenu({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={toggleOpen}
        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:border-amber-600 active:scale-90 transition-all duration-100 shadow-sm gpu-layer"
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
        <div className="fixed inset-0 top-16 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-150 gpu-layer">
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm border-l border-border bg-bg p-6 shadow-2xl overflow-y-auto flex flex-col justify-between transform transition-transform duration-150 ease-out gpu-layer">
            <div>
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <span className="font-display font-bold text-lg text-text">Navigation</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  Affordable Decoration
                </span>
              </div>

              {/* Quick Builder Banner Buttons */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <Link
                  href="/custom-canvas"
                  prefetch={true}
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 font-bold text-xs text-center transition-all active:scale-95 shadow-sm hover:bg-amber-500/20"
                >
                  <span className="text-2xl mb-1">🖼️</span>
                  <span>Custom Canvas</span>
                </Link>
                <Link
                  href="/custom-t-shirt"
                  prefetch={true}
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-border bg-surface text-text font-bold text-xs text-center transition-all active:scale-95 shadow-sm hover:border-amber-600"
                >
                  <span className="text-2xl mb-1">👕</span>
                  <span>Customize T-Shirt</span>
                </Link>
              </div>

              {/* Main Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    prefetch={true}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-text hover:bg-surface-hover hover:text-amber-600 active:scale-[0.98] transition-all duration-100"
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
                  prefetch={true}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-surface text-text hover:border-amber-600 active:scale-95 transition-all"
                >
                  <span>🔍</span> Search
                </Link>
                <Link
                  href="/wishlist"
                  prefetch={true}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-surface text-text hover:border-amber-600 active:scale-95 transition-all"
                >
                  <span>❤️</span> Wishlist
                </Link>
              </div>
              <Link
                href="/track-order"
                prefetch={true}
                onClick={closeMenu}
                className="block text-center w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 active:scale-95 transition-all"
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
