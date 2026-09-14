import { createClient } from '@/lib/supabase/server';
import { TestimonialsClientContainer } from './TestimonialsClientContainer';
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

export async function Testimonials({ section }: { section?: HomepageSection }) {
  const supabase = createClient();
  const [{ data: dbTestimonials }, { data: dbReviews }] = await Promise.all([
    supabase.from('testimonials').select('*').eq('status', 'published').limit(6),
    supabase.from('reviews').select('*').eq('status', 'published').limit(6),
  ]);

  const combined = [
    ...(dbTestimonials || []).map((t) => ({ ...t, quote: t.quote })),
    ...(dbReviews || []).map((r) => ({ ...r, quote: r.comment, customer_location: r.location })),
  ];

  const testimonials = combined.length > 0 ? combined : DEFAULT_TESTIMONIALS;

  return (
    <TestimonialsClientContainer
      title={section?.title || 'Loved by Homes & Offices Across Nepal'}
      subtitle={section?.subtitle || 'See what our happy customers have to say about our canvas prints and customized clothing.'}
      testimonials={testimonials}
    />
  );
}
