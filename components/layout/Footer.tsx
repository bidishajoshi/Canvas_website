import Link from 'next/link';
import { getMenuItems, getSettings } from '@/lib/content';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from './SocialIcons';

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

  const waHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('Hello Affordable Decoration, I have an inquiry about custom canvas or wall decor...')}`
    : 'https://wa.me/9779800000000';

  return (
    <footer className="border-t border-border bg-surface transition-colors">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Overview & Official Social Logos */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white font-bold font-display text-sm shadow-sm">
              AD
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-text">
              {settings.business_name}
            </h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
            {settings.short_description ||
              'High-quality custom photo canvas prints, multi-panel wall art, and personalized apparel delivered across Nepal.'}
          </p>

          {/* Social Media Links with Official Vector Logos */}
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Follow Us on Social Media
            </span>
            <div className="flex items-center gap-2.5">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-bg text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all shadow-sm"
                  title="Facebook"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-bg text-[#E4405F] hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all shadow-sm"
                  title="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-bg text-text hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                  title="TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              )}
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-bg text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm"
                title="WhatsApp Direct Chat"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-bg text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all shadow-sm"
                  title="YouTube Channel"
                >
                  <YouTubeIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Quick Navigation
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

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Customer Care &amp; Support
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-text/80">
            {settings.address && (
              <li className="flex items-start gap-2">
                <span className="font-semibold text-text">📍 Address:</span> {settings.address}
              </li>
            )}
            {settings.phone && (
              <li className="flex items-center gap-2">
                <span className="font-semibold text-text">📞 Call Us:</span> {settings.phone}
              </li>
            )}
            {settings.whatsapp_number && (
              <li className="flex items-center gap-2">
                <span className="font-semibold text-text">💬 WhatsApp:</span> +{settings.whatsapp_number}
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <span className="font-semibold text-text">✉️ Email:</span> {settings.email}
              </li>
            )}
          </ul>
        </div>

        {/* Nepal Delivery & Payment Support */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Fast Nepal Delivery &amp; Payments
          </h4>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            Express shipping across Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, Butwal, Biratnagar &amp; 77 districts in Nepal.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-text">
            <span className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border">Cash on Delivery</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">eSewa</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600">Khalti</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600">Bank Transfer</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.business_name}. All rights reserved. Nepal’s Premier Custom Canvas &amp; Wall Art Store.
      </div>
    </footer>
  );
}
