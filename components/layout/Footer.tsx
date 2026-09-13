import Link from 'next/link';
import { getMenuItems, getSettings } from '@/lib/content';

export async function Footer() {
  const [settings, quickLinks, legalLinks] = await Promise.all([
    getSettings(),
    getMenuItems('footer_quick_links'),
    getMenuItems('footer_legal'),
  ]);

  const defaultQuickLinks = [
    { id: 'q1', label: 'Shop Canvas & Decor', href: '/shop' },
    { id: 'q2', label: 'Custom Photo Canvas', href: '/custom-canvas' },
    { id: 'q2b', label: 'Customize T-Shirt', href: '/custom-t-shirt' },
    { id: 'q3', label: 'Track Order Progress', href: '/track-order' },
    { id: 'q4', label: 'How It Works', href: '/how-it-works' },
    { id: 'q5', label: 'Contact Us', href: '/contact' },
  ];

  const defaultLegalLinks = [
    { id: 'l1', label: 'About Us', href: '/about' },
    { id: 'l2', label: 'Privacy Policy', href: '/privacy' },
    { id: 'l3', label: 'Terms & Conditions', href: '/terms' },
    { id: 'l4', label: 'Shipping & Delivery', href: '/shipping' },
  ];

  const itemsQuick = quickLinks.length > 0 ? quickLinks : defaultQuickLinks;
  const itemsLegal = legalLinks.length > 0 ? legalLinks : defaultLegalLinks;

  return (
    <footer className="border-t border-border bg-surface transition-colors">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Overview */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white font-bold font-display text-xs">
              AD
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-text">
              {settings.business_name}
            </h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
            {settings.short_description ||
              'Beautiful walls don’t have to be expensive. High-quality custom canvas prints and wall decor delivered across Nepal.'}
          </p>
          <div className="mt-4 flex items-center gap-3">
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted hover:border-amber-600 hover:text-amber-600 transition-colors"
              >
                FB
              </a>
            )}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted hover:border-amber-600 hover:text-amber-600 transition-colors"
              >
                IG
              </a>
            )}
            {settings.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted hover:border-amber-600 hover:text-amber-600 transition-colors"
              >
                TK
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2.5">
            {itemsQuick.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="text-xs sm:text-sm text-text/80 transition-colors hover:text-amber-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Customer Care
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-text/80">
            {settings.address && (
              <li className="flex items-start gap-2">
                <span className="font-semibold">Address:</span> {settings.address}
              </li>
            )}
            {settings.phone && (
              <li className="flex items-center gap-2">
                <span className="font-semibold">Phone:</span> {settings.phone}
              </li>
            )}
            {settings.whatsapp_number && (
              <li className="flex items-center gap-2">
                <span className="font-semibold">WhatsApp:</span> +{settings.whatsapp_number}
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <span className="font-semibold">Email:</span> {settings.email}
              </li>
            )}
          </ul>
        </div>

        {/* Payment & Nepal Delivery Info */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Payment &amp; Delivery
          </h4>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            We deliver to Kathmandu Valley and all major cities &amp; districts across Nepal.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-text/70">
            <span className="px-2 py-1 rounded bg-surface-hover border border-border">Cash on Delivery</span>
            <span className="px-2 py-1 rounded bg-surface-hover border border-border">eSewa</span>
            <span className="px-2 py-1 rounded bg-surface-hover border border-border">Khalti</span>
            <span className="px-2 py-1 rounded bg-surface-hover border border-border">Bank Transfer</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.business_name}. All rights reserved. Made with ❤️ for Nepal.
      </div>
    </footer>
  );
}
