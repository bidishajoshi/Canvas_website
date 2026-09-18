'use me';
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { CartBadge } from './CartBadge';
import { WishlistBadge } from './WishlistBadge';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import type { MenuItem } from '@/lib/content';

export function NavbarHeaderControls({ menuItems }: { menuItems: MenuItem[] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Icon Button */}
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search Products"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all duration-100 hover:border-amber-600 hover:text-amber-600 active:scale-90 shadow-sm gpu-layer"
        >
          <SearchIcon className="h-4 w-4" />
        </button>

        {/* Wishlist / Love Button */}
        <Link
          href="/wishlist"
          prefetch={true}
          aria-label="Wishlist Love Items"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-pink-600 hover:text-pink-700 transition-all duration-100 hover:border-pink-500 active:scale-90 shadow-sm relative gpu-layer"
        >
          <HeartIcon className="h-4 w-4" />
          <WishlistBadge />
        </Link>

        {/* Cart Drawer Trigger Button */}
        <button
          type="button"
          onClick={openCart}
          aria-label="Open Shopping Cart"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-amber-600 hover:text-amber-700 transition-all duration-100 hover:border-amber-600 active:scale-90 shadow-sm relative gpu-layer"
        >
          <CartIcon className="h-4 w-4" />
          <CartBadge />
        </button>

        <ThemeToggle />

        {/* Account Button */}
        <Link
          href="/account"
          prefetch={true}
          aria-label="Account & Sign In"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all duration-100 hover:border-amber-600 hover:text-amber-600 active:scale-90 shadow-sm gpu-layer"
        >
          <UserIcon className="h-4 w-4" />
        </Link>

        {/* Mobile Menu */}
        <NavbarMobileMenu menuItems={menuItems} />
      </div>

      {/* Rendered Client Drawers / Modals */}
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <SearchModal open={searchOpen} onClose={closeSearch} />
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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
