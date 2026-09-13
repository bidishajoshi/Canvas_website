-- =====================================================================
-- AFFORDABLE DECORATION — DATABASE SCHEMA (PostgreSQL / Supabase)
-- =====================================================================
-- Notes:
--   * All customer-facing content lives in tables, never in frontend code.
--   * `status` enums use draft/published/hidden pattern where relevant.
--   * Row Level Security (RLS) should be enabled on every table; policies
--     are sketched at the bottom. Admin writes go through service-role
--     API routes only — never expose the service key to the client.
--   * Money stored as integer paisa (smallest NPR unit) to avoid float
--     rounding errors. Divide by 100 for display in rupees.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type content_status as enum ('draft', 'published', 'hidden');
create type order_status as enum (
  'pending','confirmed','designing','preview_ready','approved',
  'printing','packed','shipped','delivered','cancelled'
);
create type inquiry_status as enum (
  'new','contacted','confirmed','designing','preview_sent',
  'approved','printing','ready','delivered','cancelled','revision_requested'
);
create type discount_type as enum ('percentage', 'fixed');
create type size_unit as enum ('inch', 'cm');
create type user_role as enum ('customer', 'admin', 'staff');

-- ---------------------------------------------------------------------
-- USERS / AUTH  (Supabase auth.users holds credentials; this extends it)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customer_addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  label text,                         -- "Home", "Office"
  full_name text not null,
  phone text not null,
  province text,
  district text,
  municipality text,
  ward text,
  tole_area text,
  address_line text,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SITE SETTINGS  (single-row key/value + typed columns for core fields)
-- ---------------------------------------------------------------------
create table settings (
  id boolean primary key default true check (id),  -- enforces single row
  business_name text not null default 'Affordable Decoration',
  tagline text default 'Affordable Art. Beautiful Spaces.',
  short_description text,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  email text,
  phone text,
  whatsapp_number text,               -- E.164 format, e.g. 9779800000000
  address text,
  google_maps_embed text,
  opening_hours text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  currency text not null default 'NPR',
  timezone text not null default 'Asia/Kathmandu',
  order_prefix text not null default 'AD',
  guest_checkout_enabled boolean not null default true,
  max_upload_size_mb int not null default 25,
  min_recommended_dpi int not null default 150,
  default_panel_gap_mm int not null default 20,
  chatbot_enabled boolean not null default true,
  chatbot_greeting text default 'Hi! I can help you with canvas sizes, prices, panel options, framing, delivery and ordering.',
  updated_at timestamptz not null default now()
);

create table shipping_rules (
  id uuid primary key default uuid_generate_v4(),
  zone_name text not null,            -- "Kathmandu Valley", "Outside Valley"
  charge_paisa int not null default 0,
  free_shipping_threshold_paisa int,
  estimated_days_min int,
  estimated_days_max int,
  active boolean not null default true,
  sort_order int not null default 0
);

create table payment_methods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                 -- "Cash on Delivery", "eSewa", "Khalti"
  code text not null unique,          -- 'cod', 'esewa', 'khalti', 'bank_transfer'
  instructions text,
  active boolean not null default true,
  sort_order int not null default 0,
  config jsonb default '{}'::jsonb    -- non-secret config only; keys live in env vars
);

create table social_links (
  id uuid primary key default uuid_generate_v4(),
  platform text not null,             -- 'facebook','instagram','tiktok','whatsapp','youtube'
  url text not null,
  username text,
  icon text,
  active boolean not null default true,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- NAVIGATION / PAGES / HOMEPAGE BUILDER
-- ---------------------------------------------------------------------
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  menu_group text not null default 'main', -- 'main','footer_quick_links','footer_legal'
  label text not null,
  href text not null,
  parent_id uuid references menu_items(id) on delete cascade,
  sort_order int not null default 0,
  visible boolean not null default true
);

create table pages (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,          -- 'about','privacy-policy','terms', etc.
  title text not null,
  content jsonb not null default '{}'::jsonb, -- structured blocks, rendered by frontend
  seo_title text,
  seo_description text,
  og_image_url text,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table homepage_sections (
  id uuid primary key default uuid_generate_v4(),
  section_key text not null unique,   -- 'hero','shop_by_category','best_sellers', etc.
  title text,
  subtitle text,
  body text,
  cta_label text,
  cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  media jsonb default '{}'::jsonb,    -- { desktop_image, mobile_image, video_url }
  settings jsonb default '{}'::jsonb, -- section-specific extra config
  enabled boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table announcement_bar (
  id boolean primary key default true check (id),
  message text,
  link_href text,
  enabled boolean not null default false,
  bg_color_light text,
  bg_color_dark text
);

-- ---------------------------------------------------------------------
-- CATALOG
-- ---------------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references categories(id) on delete set null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  seo_title text,
  seo_description text
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  short_description text,
  main_image_url text,
  category_id uuid references categories(id) on delete set null,
  tags text[] default '{}',
  base_price_paisa int not null default 0,
  discount_price_paisa int,
  stock int,
  material text,
  weight_grams int,
  dimensions text,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- CUSTOM CANVAS BUILDER CONFIGURATION  (fully admin-controlled)
-- ---------------------------------------------------------------------
create table panel_types (
  id uuid primary key default uuid_generate_v4(),
  panel_count int not null,           -- 1, 3, 5 ...
  name text not null,                 -- "Triptych Canvas"
  description text,
  preview_image_url text,
  status content_status not null default 'published',
  sort_order int not null default 0
);

create table canvas_sizes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                 -- "16 x 24"
  width numeric not null,
  height numeric not null,
  unit size_unit not null default 'inch',
  panel_type_id uuid references panel_types(id) on delete set null,
  price_adjustment_paisa int not null default 0,
  is_recommended boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0
);

create table frames (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                 -- "Black Frame", "No Frame"
  image_url text,
  description text,
  price_paisa int not null default 0,
  status content_status not null default 'published',
  sort_order int not null default 0
);

create table finishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                 -- "Matte", "Glossy"
  description text,
  price_paisa int not null default 0,
  status content_status not null default 'published',
  sort_order int not null default 0
);

-- Which sizes are selectable (and at what override price) for a given ready-made product
create table product_size_options (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  canvas_size_id uuid not null references canvas_sizes(id) on delete restrict,
  price_override_paisa int
);

create table mockup_backgrounds (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                 -- "Living Room", "Office"
  image_url text not null,
  wall_area jsonb not null,           -- { x, y, width, height, perspective? } for overlay placement
  active boolean not null default true,
  sort_order int not null default 0
);

-- A customer's in-progress or saved custom canvas configuration
create table canvas_configurations (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles(id) on delete set null,
  session_id text,                    -- for guests, before login
  uploaded_image_url text not null,
  uploaded_image_meta jsonb,          -- { width, height, size_bytes, quality_rating }
  panel_type_id uuid references panel_types(id),
  canvas_size_id uuid references canvas_sizes(id),
  frame_id uuid references frames(id),
  finish_id uuid references finishes(id),
  panel_gap_mm int,
  crop_data jsonb,                    -- per-panel crop/zoom/position from the editor
  mockup_background_id uuid references mockup_backgrounds(id),
  preview_image_url text,             -- rendered composite preview
  calculated_price_paisa int,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CUSTOM CANVAS INQUIRIES  (the core lead-gen flow)
-- ---------------------------------------------------------------------
create table canvas_inquiries (
  id uuid primary key default uuid_generate_v4(),
  inquiry_number text not null unique,   -- e.g. AD-INQ-2026-00001
  canvas_configuration_id uuid references canvas_configurations(id) on delete set null,
  customer_id uuid references profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  message text,
  status inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table canvas_previews (
  id uuid primary key default uuid_generate_v4(),
  inquiry_id uuid not null references canvas_inquiries(id) on delete cascade,
  preview_image_url text not null,
  notes text,
  sent_at timestamptz not null default now(),
  customer_response text,             -- 'approved','revision_requested', null = pending
  responded_at timestamptz
);

-- ---------------------------------------------------------------------
-- ORDERS / CART
-- ---------------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,     -- e.g. AD-2026-00001
  customer_id uuid references profiles(id) on delete set null,
  guest_name text,
  guest_phone text,
  guest_email text,
  shipping_address jsonb not null,       -- snapshot at time of order
  payment_method_id uuid references payment_methods(id),
  shipping_rule_id uuid references shipping_rules(id),
  coupon_code text,
  subtotal_paisa int not null,
  discount_paisa int not null default 0,
  shipping_paisa int not null default 0,
  total_paisa int not null,
  status order_status not null default 'pending',
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  canvas_configuration_id uuid references canvas_configurations(id) on delete set null,
  name_snapshot text not null,           -- product/canvas name at time of order
  image_snapshot_url text,
  size_snapshot text,
  frame_snapshot text,
  finish_snapshot text,
  quantity int not null default 1,
  unit_price_paisa int not null,
  subtotal_paisa int not null
);

create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value int not null,           -- percentage (0-100) or fixed paisa
  min_order_paisa int,
  max_discount_paisa int,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  active boolean not null default true
);

-- ---------------------------------------------------------------------
-- REVIEWS / TESTIMONIALS / GALLERY
-- ---------------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  customer_name text not null,
  customer_image_url text,
  rating int not null check (rating between 1 and 5),
  comment text,
  canvas_image_url text,                 -- photo of the delivered canvas
  is_featured boolean not null default false,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_image_url text,
  quote text not null,
  is_featured boolean not null default false,
  status content_status not null default 'draft',
  sort_order int not null default 0
);

create table gallery_items (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  category text,                         -- 'homepage','before_after','customer_canvas', etc.
  is_featured boolean not null default false,
  status content_status not null default 'published',
  sort_order int not null default 0
);

create table media_library (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  cloudinary_public_id text,
  folder text not null default 'other', -- 'products','canvas','homepage','gallery', etc.
  alt_text text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------
create table faq_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sort_order int not null default 0
);

create table faqs (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references faq_categories(id) on delete set null,
  question text not null,
  answer text not null,
  status content_status not null default 'published',
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- AI CHAT ASSISTANT
-- ---------------------------------------------------------------------
create table chat_knowledge (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  keywords text[] default '{}',
  status content_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table chat_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  customer_id uuid references profiles(id),
  user_message text not null,
  ai_response text,
  matched_knowledge_id uuid references chat_knowledge(id),
  needs_human boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CONTACT / NOTIFICATIONS
-- ---------------------------------------------------------------------
create table contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_type text not null,          -- 'admin' | 'customer'
  recipient_id uuid,                     -- profile id if customer
  type text not null,                    -- 'new_order','new_inquiry','new_review', etc.
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------------------
create table wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  canvas_configuration_id uuid references canvas_configurations(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ANALYTICS (privacy-conscious, first-party only)
-- ---------------------------------------------------------------------
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  event_type text not null,   -- 'page_view','product_view','canvas_builder_start','whatsapp_click','add_to_cart', etc.
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
create index idx_products_category on products(category_id);
create index idx_products_status on products(status);
create index idx_product_images_product on product_images(product_id);
create index idx_canvas_sizes_panel_type on canvas_sizes(panel_type_id);
create index idx_orders_customer on orders(customer_id);
create index idx_order_items_order on order_items(order_id);
create index idx_canvas_inquiries_status on canvas_inquiries(status);
create index idx_reviews_product on reviews(product_id);
create index idx_chat_logs_session on chat_logs(session_id);
create index idx_analytics_event_type on analytics_events(event_type);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (sketch — expand per-table in Supabase)
-- ---------------------------------------------------------------------
-- Pattern:
--   * Public read on published/active rows (products, categories, faqs, etc.)
--   * Admin role bypasses via service-role key in API routes (never client-side)
--   * Customers can only read/write their own rows (orders, addresses, wishlist)
--
-- Example:
-- alter table products enable row level security;
-- create policy "public read published products"
--   on products for select using (status = 'published');
--
-- alter table orders enable row level security;
-- create policy "customers see own orders"
--   on orders for select using (auth.uid() = customer_id);
