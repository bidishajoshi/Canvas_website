import Image from 'next/image';
import Link from 'next/link';

const NAV_GROUPS: Array<{ label: string; items: Array<{ label: string; href: string; icon?: string }> }> = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: '📊' }],
  },
  {
    label: 'Apparel & T-Shirts',
    items: [
      { label: 'T-Shirt Builder', href: '/admin/tshirt-builder', icon: '👕' },
      { label: 'T-Shirt Categories', href: '/admin/tshirt-categories', icon: '🏷️' },
      { label: 'T-Shirt Designs', href: '/admin/tshirt-designs', icon: '🎨' },
      { label: 'Apparel Sizes', href: '/admin/sizes', icon: '📏' },
      { label: 'Apparel Colors', href: '/admin/colors', icon: '🎨' },
    ],
  },
  {
    label: 'Canvas & Wall Decor',
    items: [
      { label: 'Canvas Builder', href: '/admin/canvas-builder', icon: '🖼️' },
      { label: 'Canvas Sizes', href: '/admin/canvas-sizes', icon: '📐' },
      { label: 'Ready-Made Products', href: '/admin/canvas-products', icon: '🛒' },
      { label: 'Categories', href: '/admin/categories', icon: '📁' },
    ],
  },
  {
    label: 'Sales & Discounts',
    items: [
      { label: 'Customer Orders', href: '/admin/orders', icon: '📦' },
      { label: 'Sales & Custom Inquiries', href: '/admin/inquiries', icon: '📩' },
      { label: 'Promo & Coupon Codes', href: '/admin/coupons', icon: '🎟️' },
    ],
  },
  {
    label: 'Storefront Content',
    items: [
      { label: 'Homepage & Banners', href: '/admin/homepage', icon: '🏠' },
      { label: 'Review Moderation', href: '/admin/reviews', icon: '⭐' },
      { label: 'AI Knowledge & FAQs', href: '/admin/ai-assistant', icon: '🤖' },
      { label: 'Social & WhatsApp', href: '/admin/social', icon: '💬' },
      { label: 'Store Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface p-4 min-h-screen">
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-3 border-b border-border mb-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm logo-glow border border-border">
          <Image
            src="/images/logo.png"
            alt="Affordable Decoration Logo"
            width={36}
            height={36}
            priority
            className="object-contain w-full h-full"
          />
        </div>
        <div>
          <span className="font-display text-base font-bold text-text block leading-tight">Admin Portal</span>
          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block">E-Commerce Management</span>
        </div>
      </Link>

      <nav className="space-y-5">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.label && (
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-text/80 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                  >
                    <span>{item.icon || '•'}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
