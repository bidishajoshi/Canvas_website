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
      <div className="container-page flex h-16 sm:h-20 items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group transition-all">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white p-1 shadow-sm logo-glow border border-border flex items-center justify-center">
            <Image
              src={settings.logo_url || '/images/logo.png'}
              alt={settings.business_name}
              width={44}
              height={44}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-text group-hover:text-amber-600 active:text-amber-700 transition-colors">
              {settings.business_name}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted -mt-1 hidden sm:block">
              Canvas &amp; Wall Decor Nepal
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Simplified: Home | Shop | Canvas | T-Shirts | Categories | Offers | More ▾) */}
        <NavLinks menuItems={menuItems} />

        {/* Right Interactive Action Controls (Search Modal, Cart Drawer, Wishlist, Theme, Mobile Menu) */}
        <NavbarHeaderControls menuItems={menuItems} />
      </div>
    </header>
  );
}
