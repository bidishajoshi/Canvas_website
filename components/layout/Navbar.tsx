import Image from 'next/image';
import Link from 'next/link';
import { getMenuItems, getSettings } from '@/lib/content';
import { NavLinks } from './NavLinks';
import { NavbarHeaderControls } from './NavbarHeaderControls';

export async function Navbar() {
  const [settings, menuItems] = await Promise.all([
    getSettings(),
    getMenuItems('main'),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border glass-header transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex h-16 sm:h-20 lg:h-24 items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group transition-all">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 overflow-hidden rounded-xl bg-white p-1 shadow-sm logo-glow border border-border flex items-center justify-center shrink-0">
            <Image
              src={settings.logo_url || '/images/logo.png'}
              alt={settings.business_name}
              width={56}
              height={56}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex flex-col shrink-0">
            <span className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-text group-hover:text-amber-600 active:text-amber-700 transition-colors whitespace-nowrap">
              {settings.business_name}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-muted -mt-0.5 hidden sm:block whitespace-nowrap">
              Canvas &amp; Wall Decor Nepal
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Simplified: Home | Shop | Canvas | T-Shirts | Categories | Gallery | Offers | More ▾) */}
        <NavLinks menuItems={menuItems} />

        {/* Right Interactive Action Controls (Search Modal, Cart Drawer, Wishlist, Theme, Mobile Menu) */}
        <NavbarHeaderControls menuItems={menuItems} />
      </div>
    </header>
  );
}
