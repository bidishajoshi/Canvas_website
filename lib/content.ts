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
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  email: 'support@affordabledecoration.com.np',
  phone: '+977 9800000000',
  whatsapp_number: '9779800000000',
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
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
};

export async function getSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data } = await supabase.from('settings').select('*').single();
  return (data as Settings) ?? FALLBACK_SETTINGS;
}

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
  { id: '4', label: 'How It Works', href: '/#how-it-works', sort_order: 4 },
  { id: '5', label: 'About', href: '/about', sort_order: 5 },
  { id: '6', label: 'Track Order', href: '/track-order', sort_order: 6 },
  { id: '7', label: 'Contact', href: '/contact', sort_order: 7 },
];

export async function getMenuItems(menuGroup = 'main'): Promise<MenuItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('menu_items')
    .select('id, label, href, sort_order')
    .eq('menu_group', menuGroup)
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  return data && data.length > 0 ? data : DEFAULT_MENU_ITEMS;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  return (data as HomepageSection[]) ?? [];
}
