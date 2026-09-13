'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { MenuItem } from '@/lib/content';

export function NavbarMobileMenu({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-surface"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-border bg-bg shadow-lg">
          <nav className="container-page flex flex-col py-4">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm font-medium text-text last:border-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
