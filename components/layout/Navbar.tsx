import Image from 'next/image';
import Link from 'next/link';
import { getMenuItems, getSettings } from '@/lib/content';
import { ThemeToggle } from './ThemeToggle';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { NavLinks } from './NavLinks';
import { CartBadge } from './CartBadge';

export async function Navbar() {
  const [settings, menuItems] = await Promise.all([
    getSettings(),
    getMenuItems('main'),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border glass-header transition-colors">
      <div className="container-page flex h-16 sm:h-20 items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={settings.business_name}
              width={40}
              height={40}
              className="rounded-lg object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold font-display text-base shadow-sm group-hover:bg-amber-700 transition-colors">
                AD
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-text group-hover:text-amber-600 transition-colors">
                  {settings.business_name}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted -mt-1 hidden sm:block">
                  Canvas &amp; Wall Decor Nepal
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Center Nav Links (Simplified: Home | Shop | Canvas | T-Shirts | Categories | Offers | More ▾) */}
        <NavLinks menuItems={menuItems} />

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/search"
            aria-label="Search Products"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
          >
            <SearchIcon className="h-4 w-4" />
          </Link>

          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
          >
            <HeartIcon className="h-4 w-4" />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm relative"
          >
            <CartIcon className="h-4 w-4" />
            <CartBadge />
          </Link>

          <ThemeToggle />

          <Link
            href="/account"
            aria-label="Account"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-all hover:border-amber-600 hover:text-amber-600 shadow-sm"
          >
            <UserIcon className="h-4 w-4" />
          </Link>

          <NavbarMobileMenu menuItems={menuItems} />
        </div>
      </div>
    </header>
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
