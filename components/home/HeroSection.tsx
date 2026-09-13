import Image from 'next/image';
import Link from 'next/link';
import type { HomepageSection } from '@/lib/types';

export function HeroSection({ section }: { section: HomepageSection }) {
  const desktopImage = section.media?.desktop_image;
  const mobileImage = section.media?.mobile_image;

  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          {section.title && (
            <h1 className="font-display text-4xl font-semibold leading-tight text-text sm:text-5xl">
              {section.title}
            </h1>
          )}
          {section.subtitle && (
            <p className="mt-4 max-w-md text-base text-muted">{section.subtitle}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {section.cta_label && section.cta_href && (
              <Link
                href={section.cta_href}
                className="rounded-card bg-accent-yellow px-6 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)] transition-transform hover:scale-[1.02]"
              >
                {section.cta_label}
              </Link>
            )}
            {section.secondary_cta_label && section.secondary_cta_href && (
              <Link
                href={section.secondary_cta_href}
                className="rounded-card border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-bg"
              >
                {section.secondary_cta_label}
              </Link>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card">
          {desktopImage ? (
            <>
              <Image
                src={desktopImage}
                alt={section.title ?? 'Custom canvas art'}
                fill
                className="hidden object-cover sm:block"
                priority
              />
              <Image
                src={mobileImage ?? desktopImage}
                alt={section.title ?? 'Custom canvas art'}
                fill
                className="block object-cover sm:hidden"
                priority
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent-pink/20 text-sm text-muted">
              Hero image not yet set — upload one in Admin → Homepage → Hero
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
