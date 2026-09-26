import type { Category, Product, GalleryItem, CanvasProduct } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, DEFAULT_GALLERY_ITEMS } from './defaultProducts';

// Central store for tracking deleted items in local dev & placeholder database modes
const deletedIdsSet = new Set<string>();

export function markIdAsDeleted(id: string) {
  if (id) {
    deletedIdsSet.add(id);
  }
}

export function isIdDeleted(id: string): boolean {
  return deletedIdsSet.has(id);
}

export function filterDeleted<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item) => item && !deletedIdsSet.has(item.id));
}

// 1. In-memory category store
const categoriesStore: Category[] = [...DEFAULT_CATEGORIES];

export function getCategoriesStore(): Category[] {
  return filterDeleted(categoriesStore);
}

export function saveCategoryToStore(category: Category): Category {
  const existingIdx = categoriesStore.findIndex((c) => c.id === category.id);
  if (existingIdx >= 0) {
    categoriesStore[existingIdx] = { ...categoriesStore[existingIdx], ...category };
  } else {
    categoriesStore.unshift(category);
  }
  return category;
}

// 2. In-memory product store
const productsStore: Product[] = [...DEFAULT_PRODUCTS];

export function getProductsStore(): Product[] {
  return filterDeleted(productsStore);
}

export function saveProductToStore(product: Product): Product {
  const existingIdx = productsStore.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    productsStore[existingIdx] = { ...productsStore[existingIdx], ...product };
  } else {
    productsStore.unshift(product);
  }
  return product;
}

// 3. In-memory gallery items store
const galleryStore: GalleryItem[] = [...DEFAULT_GALLERY_ITEMS];

export function getGalleryStore(): GalleryItem[] {
  return filterDeleted(galleryStore);
}

export function saveGalleryItemToStore(item: GalleryItem): GalleryItem {
  const existingIdx = galleryStore.findIndex((g) => g.id === item.id);
  if (existingIdx >= 0) {
    galleryStore[existingIdx] = { ...galleryStore[existingIdx], ...item };
  } else {
    galleryStore.unshift(item);
  }
  return item;
}

// 4. In-memory Ready-Made Canvas Products store
const INITIAL_CANVAS_PRODUCTS: CanvasProduct[] = [
  {
    id: 'demo-1',
    name: '7 Running Horses Vastu Wall Canvas',
    slug: '7-running-horses-vastu-wall-canvas',
    description: 'Breathtaking 5-piece staggered Vastu horse canvas for positive energy.',
    main_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    panel_count: 5,
    size_label: '60" × 32" Total',
    frame_label: 'Black Floating Frame',
    original_price_paisa: 690000,
    discount_price_paisa: 552000,
    discount_percentage: 20,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: false,
    show_on_homepage: true,
    status: 'published',
    sort_order: 1,
  },
  {
    id: 'demo-2',
    name: 'Himalayan Sunrise Mountain Triptych',
    slug: 'himalayan-sunrise-mountain-triptych',
    description: 'Serene 3-piece mountain peak panorama in warm morning light.',
    main_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    panel_count: 3,
    size_label: '48" × 24" Total',
    frame_label: 'Natural Wood Frame',
    original_price_paisa: 480000,
    discount_price_paisa: 399000,
    discount_percentage: 17,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 2,
  },
  {
    id: 'demo-3',
    name: 'Serene Temple Lotus Buddha Art',
    slug: 'serene-temple-lotus-buddha-art',
    description: 'Tranquil single focal canvas print for peaceful living rooms.',
    main_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    panel_count: 1,
    size_label: '24" × 36" Single Canvas',
    frame_label: 'Luxury Gold Frame',
    original_price_paisa: 450000,
    discount_price_paisa: 382500,
    discount_percentage: 15,
    is_best_seller: false,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 3,
  },
];

const canvasProductsStore: CanvasProduct[] = [...INITIAL_CANVAS_PRODUCTS];

export function getCanvasProductsStore(): CanvasProduct[] {
  return filterDeleted(canvasProductsStore);
}

export function saveCanvasProductToStore(product: CanvasProduct): CanvasProduct {
  const idx = canvasProductsStore.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    canvasProductsStore[idx] = { ...canvasProductsStore[idx], ...product };
  } else {
    canvasProductsStore.unshift(product);
  }
  return product;
}

// 5. In-memory Hero Slides store
const INITIAL_HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Custom Canvas Wall Art',
    subtitle: 'Turn your favorite photos into high-definition 1 to 7 panel canvas wall compositions delivered across Nepal.',
    badge: '🇳🇵 Nepal’s Premier Custom Store • Rs. 700 Onwards',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    cta_text: 'Customize Canvas Now 🖼️',
    cta_href: '/custom-canvas',
    secondary_cta_text: 'Explore Collections',
    secondary_cta_href: '/shop',
    active: true,
    sort_order: 1,
  },
  {
    id: 'slide-2',
    title: 'Pinterest Aesthetic Bedroom Photo Canvas',
    subtitle: 'Cozy memory wall galleries and multi-panel photo splits starting from Rs. 700 to Rs. 3,500.',
    badge: '✨ Aesthetic Room Decor • Rs. 1,900',
    image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=1600&q=80',
    cta_text: 'Create Your Photo Wall 🖼️',
    cta_href: '/custom-canvas',
    secondary_cta_text: 'View Best Sellers',
    secondary_cta_href: '/shop',
    active: true,
    sort_order: 2,
  },
];

const heroSlidesStore: any[] = [...INITIAL_HERO_SLIDES];

export function getHeroSlidesStore(): any[] {
  return filterDeleted(heroSlidesStore);
}

export function saveHeroSlideToStore(slide: any): any {
  const idx = heroSlidesStore.findIndex((s) => s.id === slide.id);
  if (idx >= 0) {
    heroSlidesStore[idx] = { ...heroSlidesStore[idx], ...slide };
  } else {
    heroSlidesStore.push(slide);
  }
  return slide;
}

// 6. In-memory T-Shirt Types, Colors, Locations, Designs, Categories
const tshirtTypesStore: any[] = [
  { id: 'type-1', name: 'Premium Oversized Streetwear Tee', description: '240 GSM Combed Cotton Heavyweight', base_price_paisa: 79900, is_active: true, sort_order: 1 },
  { id: 'type-2', name: 'Classic Unisex Cotton T-Shirt', description: '180 GSM Bio-Washed Soft Touch', base_price_paisa: 65000, is_active: true, sort_order: 2 },
];

export function getTShirtTypesStore(): any[] {
  return filterDeleted(tshirtTypesStore);
}

export function saveTShirtTypeToStore(type: any): any {
  const idx = tshirtTypesStore.findIndex((t) => t.id === type.id);
  if (idx >= 0) tshirtTypesStore[idx] = { ...tshirtTypesStore[idx], ...type };
  else tshirtTypesStore.unshift(type);
  return type;
}

const tshirtColorsStore: any[] = [
  { id: 'col-1', name: 'Crisp White', color_hex: '#FFFFFF', is_active: true, sort_order: 1 },
  { id: 'col-2', name: 'Pitch Black', color_hex: '#18181B', is_active: true, sort_order: 2 },
  { id: 'col-3', name: 'Deep Navy', color_hex: '#1E293B', is_active: true, sort_order: 3 },
  { id: 'col-4', name: 'Vintage Maroon', color_hex: '#800020', is_active: true, sort_order: 4 },
];

export function getTShirtColorsStore(): any[] {
  return filterDeleted(tshirtColorsStore);
}

export function saveTShirtColorToStore(color: any): any {
  const idx = tshirtColorsStore.findIndex((c) => c.id === color.id);
  if (idx >= 0) tshirtColorsStore[idx] = { ...tshirtColorsStore[idx], ...color };
  else tshirtColorsStore.push(color);
  return color;
}

const printLocationsStore: any[] = [
  { id: 'loc-1', name: 'Front Chest Center (A4)', additional_price_paisa: 0, is_active: true, sort_order: 1 },
  { id: 'loc-2', name: 'Full Back Graphic Print', additional_price_paisa: 20000, is_active: true, sort_order: 2 },
  { id: 'loc-3', name: 'Left Sleeve Logo', additional_price_paisa: 10000, is_active: true, sort_order: 3 },
];

export function getPrintLocationsStore(): any[] {
  return filterDeleted(printLocationsStore);
}

export function savePrintLocationToStore(loc: any): any {
  const idx = printLocationsStore.findIndex((l) => l.id === loc.id);
  if (idx >= 0) printLocationsStore[idx] = { ...printLocationsStore[idx], ...loc };
  else printLocationsStore.push(loc);
  return loc;
}

const tshirtDesignsStore: any[] = [
  { id: 'des-1', name: 'Kathmandu Minimalist Skyline', theme: 'Urban', image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', price_paisa: 0, is_active: true, sort_order: 1 },
  { id: 'des-2', name: 'Retro Himalayan Mountain Contour', theme: 'Nature', image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', price_paisa: 15000, is_active: true, sort_order: 2 },
];

export function getTShirtDesignsStore(): any[] {
  return filterDeleted(tshirtDesignsStore);
}

export function saveTShirtDesignToStore(design: any): any {
  const idx = tshirtDesignsStore.findIndex((d) => d.id === design.id);
  if (idx >= 0) tshirtDesignsStore[idx] = { ...tshirtDesignsStore[idx], ...design };
  else tshirtDesignsStore.unshift(design);
  return design;
}

const tshirtCategoriesStore: any[] = [
  { id: 'cat-1', name: 'Logo & Brand T-Shirts', slug: 'logo-brand', description: 'Corporate logos and minimalist brand graphic tees.', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-2', name: 'Couple & Matching T-Shirts', slug: 'couple-matching', description: 'Matching couple quotes, split heart designs, and anniversary prints.', image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-3', name: 'Birthday & Celebration T-Shirts', slug: 'birthday-celebration', description: 'Fun milestone birthday prints and squad tees.', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80' },
];

export function getTShirtCategoriesStore(): any[] {
  return filterDeleted(tshirtCategoriesStore);
}

export function saveTShirtCategoryToStore(cat: any): any {
  const idx = tshirtCategoriesStore.findIndex((c) => c.id === cat.id);
  if (idx >= 0) tshirtCategoriesStore[idx] = { ...tshirtCategoriesStore[idx], ...cat };
  else tshirtCategoriesStore.unshift(cat);
  return cat;
}

// 7. In-memory Payment Methods store
const paymentMethodsStore: any[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery (COD + Advance Delivery Fee)',
    code: 'cod',
    instructions: 'Pay cash on delivery! Note: A small advance delivery charge (e.g. Rs. 150) must be paid via QR code before delivery dispatch to confirm your address.',
    active: true,
    sort_order: 1,
    config: { qr_code_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  },
  {
    id: 'esewa',
    name: 'eSewa Mobile Wallet (Online QR Pay)',
    code: 'esewa',
    instructions: 'Scan the official Affordable Decoration eSewa QR Code below to make instant payment to eSewa ID: 9864029898.',
    active: true,
    sort_order: 2,
    config: { qr_code_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  },
  {
    id: 'bank_transfer',
    name: 'Direct Bank Transfer (NABIL / NIC Asia)',
    code: 'bank_transfer',
    instructions: 'Transfer directly to NABIL Bank A/C: 0101017500001 (Affordable Decoration Pvt Ltd). Enter transaction reference or statement ID below.',
    active: true,
    sort_order: 3,
    config: { qr_code_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  },
];

export function getPaymentMethodsStore(): any[] {
  return filterDeleted(paymentMethodsStore);
}

export function savePaymentMethodToStore(method: any): any {
  const idx = paymentMethodsStore.findIndex((m) => m.id === method.id);
  if (idx >= 0) paymentMethodsStore[idx] = { ...paymentMethodsStore[idx], ...method };
  else paymentMethodsStore.push(method);
  return method;
}

// 8. Announcement Bar & Homepage Sections
let announcementBarStore = {
  id: 'ann-1',
  enabled: true,
  message: '🇳🇵 Free Delivery Across Kathmandu Valley on Orders Over Rs. 2,000! Express Cash on Delivery Available.',
  link_href: '/custom-canvas',
};

export function getAnnouncementBarStore() {
  return announcementBarStore;
}

export function saveAnnouncementBarToStore(data: any) {
  announcementBarStore = { ...announcementBarStore, ...data };
  return announcementBarStore;
}

export interface CanvasCategoryStoreItem {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  description?: string | null;
}

const customCanvasCategories: CanvasCategoryStoreItem[] = [];

export function addCustomCanvasCategory(cat: CanvasCategoryStoreItem) {
  customCanvasCategories.push(cat);
}

export function getCustomCanvasCategories(): CanvasCategoryStoreItem[] {
  return filterDeleted(customCanvasCategories);
}
