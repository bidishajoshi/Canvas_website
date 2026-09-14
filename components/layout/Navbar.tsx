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

        {/* Right Interactive Action Controls (Search Modal, Cart Drawer, Wishlist, Theme, Mobile Menu) */}
        <NavbarHeaderControls menuItems={menuItems} />
      </div>
    </header>
  );
}
