import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

const DEFAULT_TESTIMONIALS = [
  {
    id: 't1',
    customer_name: 'Bina Shrestha',
    customer_location: 'Kathmandu',
    quote: 'The 3-panel Fewa Lake canvas looks absolutely breathtaking in my living room! High quality printing and sturdy frame.',
    customer_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't2',
    customer_name: 'Rohan Sharma',
    customer_location: 'Lalitpur',
    quote: 'Created a personalized photo canvas for my parents’ anniversary. They loved it so much! Super fast cash on delivery.',
    customer_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't3',
    customer_name: 'Suman Gurung',
    customer_location: 'Pokhara',
    quote: 'Customized streetwear t-shirt quality exceeded my expectations. Soft combed cotton and vibrant print!',
    customer_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
];

export async function Testimonials({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .limit(6);

  const testimonials = data && data.length > 0 ? data : DEFAULT_TESTIMONIALS;

  return (
    <section className="container-page py-16 border-t border-border">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
          {section.title || 'Loved by Homes & Offices Across Nepal'}
        </h2>
        <p className="text-muted text-xs sm:text-sm">
          See what our happy customers have to say about our canvas prints and customized clothing.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.id} className="rounded-2xl border border-border p-6 bg-surface shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                {'★'.repeat(t.rating || 5)}
              </div>
              <blockquote className="text-sm text-text leading-relaxed font-medium">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </div>

            <figcaption className="flex items-center gap-3 pt-3 border-t border-border/60">
              {t.customer_image_url && (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-amber-600/30">
                  <Image
                    src={t.customer_image_url}
                    alt={t.customer_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-sm font-bold block text-text">{t.customer_name}</span>
                {t.customer_location && (
                  <span className="text-xs text-muted block">{t.customer_location}, Nepal</span>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

