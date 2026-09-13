import Link from 'next/link';

const NAV_GROUPS: Array<{ label: string; items: Array<{ label: string; href: string }> }> = [
  {
    label: '',
    items: [{ label: 'Dashboard', href: '/admin/dashboard' }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products' },
      { label: 'Categories', href: '/admin/categories' },
    ],
  },
  {
    label: 'Canvas Builder',
    items: [
      { label: 'Panel Types / Sizes / Frames / Finishes', href: '/admin/canvas-builder' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Custom Inquiries', href: '/admin/inquiries' },
      { label: 'Coupons', href: '/admin/coupons' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Homepage', href: '/admin/homepage' },
      { label: 'Reviews', href: '/admin/reviews' },
      { label: 'FAQs', href: '/admin/faqs' },
      { label: 'Gallery', href: '/admin/gallery' },
      { label: 'AI Assistant', href: '/admin/ai-assistant' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Shipping', href: '/admin/shipping' },
      { label: 'Payments', href: '/admin/payments' },
      { label: 'WhatsApp & Social', href: '/admin/social' },
      { label: 'SEO', href: '/admin/seo' },
      { label: 'Settings', href: '/admin/settings' },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border p-4">
      <Link href="/admin/dashboard" className="block px-2 py-2 font-display text-lg font-semibold">
        Admin
      </Link>
      <nav className="mt-4 space-y-6">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.label && (
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </p>
            )}
            <ul className="mt-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-card px-2 py-2 text-sm hover:bg-surface"
                  >
                    {item.label}
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
