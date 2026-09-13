import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

export async function Testimonials({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .limit(6);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.id} className="rounded-card border border-border p-5">
            <blockquote className="text-sm text-text">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {t.customer_image_url && (
                <div className="relative h-9 w-9 overflow-hidden rounded-full">
                  <Image
                    src={t.customer_image_url}
                    alt={t.customer_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-sm font-medium">{t.customer_name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
