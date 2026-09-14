'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { CartBadge } from './CartBadge';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import type { MenuItem } from '@/lib/content';

export function NavbarHeaderControls({ menuItems }: { menuItems: MenuItem[] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Icon Button */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search Products"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
        >
          <SearchIcon className="h-4 w-4" />
        </button>

        {/* Wishlist Button */}
        <Link
          href="/account/wishlist"
          aria-label="Wishlist"
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
        >
          <HeartIcon className="h-4 w-4" />
        </Link>

        {/* Cart Drawer Trigger Button */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label="Open Shopping Cart"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm relative"
        >
          <CartIcon className="h-4 w-4" />
          <CartBadge />
        </button>

        <ThemeToggle />

        {/* Account Button */}
        <Link
          href="/account"
          aria-label="Account"
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
        >
          <UserIcon className="h-4 w-4" />
        </Link>

        {/* Mobile Menu */}
        <NavbarMobileMenu menuItems={menuItems} />
      </div>

      {/* Rendered Client Drawers / Modals */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 20s-7-4.35-9.5-8.5C.7 8.1 2.3 5 5.6 5c1.9 0 3.3 1 4.4 2.4C11.1 6 12.5 5 14.4 5c3.3 0 4.9 3.1 3.1 6.5C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2A2 2 0 0 0 9.36 18h7.28a2 2 0 0 0 1.96-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="21" r="1.2" fill="currentColor" />
      <circle cx="17.5" cy="21" r="1.2" fill="currentColor" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c1.4-3.4 4.3-5.2 7.5-5.2s6.1 1.8 7.5 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
