import Link from 'next/link';
import type { HomepageSection } from '@/lib/types';

export function CustomCanvasCta({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-accent-pink/15">
      <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
        {section.title && (
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="max-w-xl text-muted">{section.subtitle}</p>
        )}
        <Link
          href={section.cta_href ?? '/custom-canvas'}
          className="mt-2 rounded-card bg-accent-yellow px-6 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
        >
          {section.cta_label ?? 'Create Your Canvas'}
        </Link>
      </div>
    </section>
  );
}
