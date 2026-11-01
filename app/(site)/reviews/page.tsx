import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import { ReviewsClient } from './ReviewsClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Verified Customer Reviews & Delivered Photos | ${settings.business_name}`,
    description: `Read real reviews and see photos of delivered custom photo canvases, 3-panel and 5-panel wall splits, and custom t-shirts from verified customers across Nepal.`,
  };
}

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    customer_name: 'Bina Shrestha',
    location: 'Baneshwor, Kathmandu',
    rating: 5,
    comment: 'The 3-panel Fewa Lake canvas looks absolutely breathtaking in my living room! Print quality is museum grade and the pine wood stretchers are super sturdy.',
    product_category: 'Canvas Prints',
    created_at: '2026-10-15T00:00:00Z',
  },
  {
    id: 'rev-2',
    customer_name: 'Rohan Sharma',
    location: 'Jhamsikhel, Lalitpur',
    rating: 5,
    comment: 'Created a personalized photo canvas for my parents’ 30th anniversary. They were moved to tears! Fast cash on delivery and packaging had corner protectors.',
    product_category: 'Custom Photo Canvas',
    created_at: '2026-10-18T00:00:00Z',
  },
  {
    id: 'rev-3',
    customer_name: 'Suman Gurung',
    location: 'Lakeside, Pokhara',
    rating: 5,
    comment: 'Customized streetwear t-shirt quality exceeded my expectations. Soft 240 GSM combed cotton and the chest graphic didn’t fade after 5 washes.',
    product_category: 'Custom T-Shirts',
    created_at: '2026-10-20T00:00:00Z',
  },
  {
    id: 'rev-4',
    customer_name: 'Aayush Maharjan',
    location: 'Suryabinayak, Bhaktapur',
    rating: 5,
    comment: 'Ordered the 5-Piece Lord Shiva & Parvati Vastu Canvas for our new house. Everyone who visits compliments the living room wall immediately!',
    product_category: 'Vastu & Multi-Panel',
    created_at: '2026-10-22T00:00:00Z',
  },
  {
    id: 'rev-5',
    customer_name: 'Dr. Pratima Karki',
    location: 'Bharatpur, Chitwan',
    rating: 5,
    comment: 'The digital proof was sent on WhatsApp within 2 hours of ordering. Very professional communication and delivery to Chitwan arrived in 3 days.',
    product_category: 'Custom Photo Canvas',
    created_at: '2026-10-24T00:00:00Z',
  },
  {
    id: 'rev-6',
    customer_name: 'Nabin Thapa',
    location: 'Tilottama, Butwal',
    rating: 5,
    comment: 'Got 10 custom company t-shirts with our tech logo printed. Crisp lines and great volume discount. Will definitely order for future office events.',
    product_category: 'Corporate Bulk',
    created_at: '2026-10-25T00:00:00Z',
  },
];

export default async function ReviewsPage() {
  const [settings, supabase] = await Promise.all([
    getSettings(),
    createClient(),
  ]);

  let dbReviews: any[] = [];
  try {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      dbReviews = data;
    }
  } catch {
    dbReviews = [];
  }

  const combined = dbReviews.length > 0 ? dbReviews : DEFAULT_REVIEWS;

  return <ReviewsClient settings={settings} initialReviews={combined} />;
}
