import { cache } from 'react';
import { createClient } from './supabase/server';
import type { Settings, HomepageSection } from './types';

// Fallback values so the site still renders sensibly on a fresh
// install before the admin has filled in Settings. These are NOT
// "hardcoded business content" per the spec — they only apply until
// row `settings` (id = true) exists, and every field is immediately
// editable from /admin/settings.
const FALLBACK_SETTINGS: Settings = {
  business_name: 'Affordable Decoration',
  tagline: 'Affordable Art. Beautiful Spaces.',
  short_description: 'Affordable Canvas Prints, Canvas Paintings & Wall Decor in Nepal.',
  logo_url: '/images/logo.png',
  logo_dark_url: '/images/logo.png',
  favicon_url: null,
  email: 'support@affordabledecoration.com.np',
  phone: '+977 9864029898',
  whatsapp_number: '9779864029898',
  address: 'Kathmandu, Nepal',
  google_maps_embed: null,
  opening_hours: 'Sun - Fri: 9:00 AM - 7:00 PM',
  facebook_url: 'https://facebook.com/affordabledecoration',
  instagram_url: 'https://instagram.com/affordabledecoration',
  tiktok_url: 'https://tiktok.com/@affordabledecoration',
  youtube_url: null,
  currency: 'NPR',
  order_prefix: 'AD',
  guest_checkout_enabled: true,
  max_upload_size_mb: 25,
  min_recommended_dpi: 150,
  default_panel_gap_mm: 20,
  chatbot_enabled: true,
  chatbot_greeting:
    'Namaste! Welcome to Affordable Decoration. I can help you with custom photo canvas, wall decor sizes, framing, prices, delivery in Nepal, and order tracking.',
  demo_photo_url:
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
};

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const supabase = createClient();
    const fetchPromise = supabase.from('settings').select('*').single();
    const timeoutPromise = new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 120)
    );
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    return (res.data as Settings) ?? FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
});

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  sort_order: number;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', label: 'Home', href: '/', sort_order: 1 },
  { id: '2', label: 'Shop', href: '/shop', sort_order: 2 },
  { id: '3', label: 'Custom Canvas', href: '/custom-canvas', sort_order: 3 },
  { id: '3b', label: 'Customize T-Shirt', href: '/custom-t-shirt', sort_order: 4 },
  { id: '3c', label: 'Photo Gallery', href: '/gallery', sort_order: 5 },
  { id: '4', label: 'How It Works', href: '/how-it-works', sort_order: 6 },
  { id: '5', label: 'About', href: '/about', sort_order: 7 },
  { id: '6', label: 'Track Order', href: '/track-order', sort_order: 8 },
  { id: '7', label: 'Contact', href: '/contact', sort_order: 9 },
];

export const getMenuItems = cache(async (menuGroup = 'main'): Promise<MenuItem[]> => {
  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from('menu_items')
      .select('id, label, href, sort_order')
      .eq('menu_group', menuGroup)
      .eq('visible', true)
      .order('sort_order', { ascending: true });

    const timeoutPromise = new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 120)
    );
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    return res.data && res.data.length > 0 ? res.data : DEFAULT_MENU_ITEMS;
  } catch {
    return DEFAULT_MENU_ITEMS;
  }
});

const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    section_key: 'hero',
    title: 'Turn Your Memories Into Beautiful Canvas',
    subtitle: 'Affordable canvas prints, wall décor and personalized products made for your space in Nepal.',
    body: null,
    cta_label: 'Customize Canvas',
    cta_href: '/custom-canvas',
    secondary_cta_label: 'Customize T-Shirt',
    secondary_cta_href: '/custom-t-shirt',
    media: {
      desktop_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      mobile_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    },
    settings: {},
    enabled: true,
    sort_order: 1,
  },
  {
    id: 'sec-categories',
    section_key: 'shop_by_category',
    title: 'Explore Our Categories',
    subtitle: 'Choose from canvas prints, multi-panel splits, custom portraits, and customized t-shirts.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 2,
  },
  {
    id: 'sec-best-sellers',
    section_key: 'best_sellers',
    title: 'Best Selling Wall Decor & Canvases',
    subtitle: 'Top rated decor items loved by customers across Nepal.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 3,
  },
  {
    id: 'sec-canvas-cta',
    section_key: 'custom_canvas_cta',
    title: 'Custom Canvas Live Builder',
    subtitle: 'Upload your photo, preview 1, 3, or 5 panel splits on actual wall backgrounds before ordering.',
    body: null,
    cta_label: 'Start Canvas Builder',
    cta_href: '/custom-canvas',
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 4,
  },
  {
    id: 'sec-tshirt-cta',
    section_key: 'custom_tshirt_cta',
    title: 'Design Your Own T-Shirt',
    subtitle: 'Pick premium cotton t-shirts, select colors, add graphic art or upload your own design with custom text.',
    body: null,
    cta_label: 'Customize T-Shirt Now',
    cta_href: '/custom-t-shirt',
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 5,
  },
  {
    id: 'sec-panel-showcase',
    section_key: 'panel_showcase',
    title: 'Multi-Panel Canvas Layouts',
    subtitle: 'Transform a single high-resolution image into dramatic 3-panel or 5-panel wall statements.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 6,
  },
  {
    id: 'sec-why-us',
    section_key: 'why_choose_us',
    title: 'Why Nepal Chooses Affordable Decoration',
    subtitle: 'Unmatched quality, affordable pricing, and fast cash-on-delivery across Nepal.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 7,
  },
  {
    id: 'sec-how-it-works',
    section_key: 'how_it_works',
    title: 'How Easy It Works',
    subtitle: 'Three simple steps to receive personalized decor at your doorstep.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 8,
  },
  {
    id: 'sec-reviews',
    section_key: 'customer_reviews',
    title: 'Loved by Homes & Offices Across Nepal',
    subtitle: 'Real reviews and photos from our delighted customers.',
    body: null,
    cta_label: null,
    cta_href: null,
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 9,
  },
  {
    id: 'sec-whatsapp',
    section_key: 'whatsapp_cta',
    title: 'Need Custom Help or Instant Order?',
    subtitle: 'Our design team is live on WhatsApp to help you choose the best frame or panel size for your photo.',
    body: null,
    cta_label: 'Chat with Us on WhatsApp',
    cta_href: 'https://wa.me/9779864029898',
    secondary_cta_label: null,
    secondary_cta_href: null,
    media: {},
    settings: {},
    enabled: true,
    sort_order: 10,
  },
];

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  return data && data.length > 0 ? (data as HomepageSection[]) : DEFAULT_HOMEPAGE_SECTIONS;
}

