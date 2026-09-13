// Shared types mirroring supabase/schema.sql.
// Money is always stored/passed as integer paisa (NPR smallest unit).

export type ContentStatus = 'draft' | 'published' | 'hidden';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'designing'
  | 'preview_ready'
  | 'approved'
  | 'printing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'designing'
  | 'preview_sent'
  | 'approved'
  | 'printing'
  | 'ready'
  | 'delivered'
  | 'cancelled'
  | 'revision_requested';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  status: ContentStatus;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  main_image_url: string | null;
  category_id: string | null;
  tags: string[];
  base_price_paisa: number;
  discount_price_paisa: number | null;
  stock: number | null;
  material: string | null;
  weight_grams: number | null;
  dimensions: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface PanelType {
  id: string;
  panel_count: number;
  name: string;
  description: string | null;
  preview_image_url: string | null;
  status: ContentStatus;
  sort_order: number;
}

export interface CanvasSize {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'inch' | 'cm';
  panel_type_id: string | null;
  price_adjustment_paisa: number;
  is_recommended: boolean;
  active: boolean;
  sort_order: number;
}

export interface Frame {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  price_paisa: number;
  status: ContentStatus;
  sort_order: number;
}

export interface Finish {
  id: string;
  name: string;
  description: string | null;
  price_paisa: number;
  status: ContentStatus;
  sort_order: number;
}

export interface PanelCropData {
  panelIndex: number;
  offsetX: number; // 0-1, fraction of image width
  offsetY: number; // 0-1, fraction of image height
  zoom: number; // 1 = fit, >1 = zoomed in
}

export interface CanvasConfiguration {
  id?: string;
  customer_id?: string | null;
  session_id?: string | null;
  uploaded_image_url: string;
  uploaded_image_meta?: {
    width: number;
    height: number;
    size_bytes: number;
    quality_rating: 'excellent' | 'good' | 'low_resolution';
  };
  panel_type_id: string;
  canvas_size_id: string;
  frame_id: string | null;
  finish_id: string | null;
  panel_gap_mm: number;
  crop_data: PanelCropData[];
  mockup_background_id?: string | null;
  preview_image_url?: string | null;
  calculated_price_paisa: number;
  quantity: number;
}

export interface CanvasInquiry {
  id?: string;
  inquiry_number?: string;
  canvas_configuration_id?: string | null;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  message?: string | null;
  status?: InquiryStatus;
}

export interface Faq {
  id: string;
  category_id: string | null;
  question: string;
  answer: string;
  status: ContentStatus;
  sort_order: number;
}

export interface ChatKnowledge {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  keywords: string[];
  status: ContentStatus;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  media: Record<string, string>;
  settings: Record<string, unknown>;
  enabled: boolean;
  sort_order: number;
}

export interface Settings {
  business_name: string;
  tagline: string | null;
  short_description: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  google_maps_embed: string | null;
  opening_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  currency: string;
  order_prefix: string;
  guest_checkout_enabled: boolean;
  max_upload_size_mb: number;
  min_recommended_dpi: number;
  default_panel_gap_mm: number;
  chatbot_enabled: boolean;
  chatbot_greeting: string | null;
}
