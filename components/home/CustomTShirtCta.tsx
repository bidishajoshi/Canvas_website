import Link from 'next/link';
import Image from 'next/image';
import type { HomepageSection } from '@/lib/types';

export function CustomTShirtCta({ section }: { section: HomepageSection }) {
  return (
    <section className="py-16 sm:py-20 bg-surface/50 border-y border-border">
      <div className="container-page grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-xs">
            <span>👕</span>
            <span>New Custom Clothing Feature</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {section.title || 'Design Your Own Customized T-Shirt'}
          </h2>

          <p className="text-muted text-base leading-relaxed">
            {section.subtitle ||
              'Select 100% premium cotton crewnecks or streetwear oversized tees. Pick colors, place artwork, add custom text lines, and preview live before ordering.'}
          </p>

          <ul className="space-y-2.5 text-xs font-semibold text-text">
            <li className="flex items-center gap-2">
              <span className="text-pink-600 font-bold">✓</span> 180 GSM &amp; 240 GSM Premium Combed Cotton
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-600 font-bold">✓</span> Front Chest &amp; Back Print Options
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-600 font-bold">✓</span> Live Interactive Editor with Custom Text Overlays
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href={section.cta_href || '/custom-t-shirt'}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
            >
              <span>{section.cta_label || 'Customize T-Shirt Now'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Demo Graphic Mockup Visual */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-bg p-6 shadow-xl flex items-center justify-center group">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
              alt="Custom T-Shirt Mockup"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Interactive T-Shirt Customizer
              </span>
              <p className="font-display font-bold text-lg">
                Create Your Style • Rs. 699 Onwards
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
