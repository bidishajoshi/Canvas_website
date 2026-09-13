import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import { CanvasBuilderClient } from '@/components/custom-canvas/CanvasBuilderClient';
import type { CanvasSize, Finish, Frame, PanelType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Custom Canvas Builder — Affordable Decoration Nepal',
  description:
    'Design and customize 1, 2, 3, 4, 5, 6, and 7 panel canvas wall art for your home or office. Real-time live visual editor with Vastu 7 Running Horses demo art.',
};

const FALLBACK_PANELS: PanelType[] = [
  { id: 'panel-1', name: '1 Piece (Single)', panel_count: 1, description: null, status: 'published', sort_order: 1, is_active: true },
  { id: 'panel-2', name: '2 Piece (Diptych)', panel_count: 2, description: null, status: 'published', sort_order: 2, is_active: true },
  { id: 'panel-3', name: '3 Piece (Triptych)', panel_count: 3, description: null, status: 'published', sort_order: 3, is_active: true },
  { id: 'panel-4', name: '4 Piece (Quad)', panel_count: 4, description: null, status: 'published', sort_order: 4, is_active: true },
  { id: 'panel-5', name: '5 Piece (Pentaptych)', panel_count: 5, description: null, status: 'published', sort_order: 5, is_active: true },
  { id: 'panel-6', name: '6 Piece (Hexaptych)', panel_count: 6, description: null, status: 'published', sort_order: 6, is_active: true },
  { id: 'panel-7', name: '7 Piece (Panoramic)', panel_count: 7, description: null, status: 'published', sort_order: 7, is_active: true },
];

const FALLBACK_SIZES: CanvasSize[] = [
  // 1 Panel sizes
  {
    id: 'size-1-sm',
    panel_type_id: 'panel-1',
    name: '12" × 18" Small Accent',
    width: 12,
    height: 18,
    unit: 'inch',
    price_adjustment_paisa: 150000,
    price_paisa: 150000,
    is_recommended: false,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '1 Panel @ 12" × 18" (30 × 45 cm)',
    recommended_room: 'Small Accent Walls, Desk Nook, Entryway',
  },
  {
    id: 'size-1-md',
    panel_type_id: 'panel-1',
    name: '24" × 36" Standard Focal',
    width: 24,
    height: 36,
    unit: 'inch',
    price_adjustment_paisa: 350000,
    price_paisa: 350000,
    is_recommended: true,
    sort_order: 2,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '1 Panel @ 24" × 36" (60 × 90 cm)',
    recommended_room: 'Bedrooms, Living Room Nook, Office Wall',
  },

  // 2 Panel sizes
  {
    id: 'size-2-md',
    panel_type_id: 'panel-2',
    name: '36" × 24" Diptych Pair',
    width: 36,
    height: 24,
    unit: 'inch',
    price_adjustment_paisa: 380000,
    price_paisa: 380000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '2 Panels @ 18" × 24" (45 × 60 cm) each',
    recommended_room: 'Hallways, Sideboards, Desk Backdrops',
  },

  // 3 Panel sizes
  {
    id: 'size-3-md',
    panel_type_id: 'panel-3',
    name: '48" × 24" Classic Triptych',
    width: 48,
    height: 24,
    unit: 'inch',
    price_adjustment_paisa: 480000,
    price_paisa: 480000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '3 Panels @ 16" × 24" (40 × 60 cm) each',
    recommended_room: 'Standard 3-Seater Sofa Wall, Dining Table',
  },
  {
    id: 'size-3-lg',
    panel_type_id: 'panel-3',
    name: '60" × 30" Grand Triptych',
    width: 60,
    height: 30,
    unit: 'inch',
    price_adjustment_paisa: 680000,
    price_paisa: 680000,
    is_recommended: false,
    sort_order: 2,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '3 Panels @ 20" × 30" (50 × 75 cm) each',
    recommended_room: 'Large Living Room Sofa, Master Headboard',
  },

  // 4 Panel sizes
  {
    id: 'size-4-md',
    panel_type_id: 'panel-4',
    name: '60" × 30" Quad Split',
    width: 60,
    height: 30,
    unit: 'inch',
    price_adjustment_paisa: 590000,
    price_paisa: 590000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '4 Panels @ 15" × 30" (37.5 × 75 cm) each',
    recommended_room: 'Wide Sofa Wall, Staircase Landing',
  },

  // 5 Panel sizes
  {
    id: 'size-5-md',
    panel_type_id: 'panel-5',
    name: '60" × 32" Pentaptych Chevron',
    width: 60,
    height: 32,
    unit: 'inch',
    price_adjustment_paisa: 690000,
    price_paisa: 690000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: 'Center 12"×32", Mid 12"×28", Outer 12"×24"',
    recommended_room: 'Feature Wall Above Sofa, 7 Running Horses Wall',
  },
  {
    id: 'size-5-lg',
    panel_type_id: 'panel-5',
    name: '75" × 40" Grand Polyptych',
    width: 75,
    height: 40,
    unit: 'inch',
    price_adjustment_paisa: 950000,
    price_paisa: 950000,
    is_recommended: false,
    sort_order: 2,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: 'Center 15"×40", Mid 15"×35", Outer 15"×30"',
    recommended_room: 'Extra Large Living Room, Double Height Hall',
  },

  // 6 Panel sizes
  {
    id: 'size-6-lg',
    panel_type_id: 'panel-6',
    name: '72" × 36" Hexaptych Panorama',
    width: 72,
    height: 36,
    unit: 'inch',
    price_adjustment_paisa: 890000,
    price_paisa: 890000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '6 Panels @ 12" × 36" (30 × 90 cm) each',
    recommended_room: 'Executive Boardroom, Wide Living Wall',
  },

  // 7 Panel sizes
  {
    id: 'size-7-lg',
    panel_type_id: 'panel-7',
    name: '84" × 36" Panoramic 7-Piece',
    width: 84,
    height: 36,
    unit: 'inch',
    price_adjustment_paisa: 1190000,
    price_paisa: 1190000,
    is_recommended: true,
    sort_order: 1,
    active: true,
    sizing_mode: 'overall_combined',
    each_panel_size: '7 Panels @ 12" × 36" (30 × 90 cm) each',
    recommended_room: 'Full Width Accent Wall, Commercial Lobby, Long Hallway',
  },
];

const FALLBACK_FRAMES: Frame[] = [
  { id: 'f0', name: 'Unframed (Wrapped Edge Canvas)', price_paisa: 0, sort_order: 1, status: 'published', image_url: null, description: null },
  { id: 'f1', name: 'Black Floating Frame', price_paisa: 50000, sort_order: 2, status: 'published', image_url: null, description: null },
  { id: 'f2', name: 'White Floating Frame', price_paisa: 50000, sort_order: 3, status: 'published', image_url: null, description: null },
  { id: 'f3', name: 'Natural Wood Frame', price_paisa: 70000, sort_order: 4, status: 'published', image_url: null, description: null },
  { id: 'f4', name: 'Luxury Gold Frame', price_paisa: 90000, sort_order: 5, status: 'published', image_url: null, description: null },
];

const FALLBACK_FINISHES: Finish[] = [
  { id: 'fn1', name: 'Matte Finish (Non-reflective Premium)', sort_order: 1, status: 'published', description: null, price_paisa: 0 },
  { id: 'fn2', name: 'Satin Gloss Finish (Vibrant Color Pop)', sort_order: 2, status: 'published', description: null, price_paisa: 0 },
];

export default async function CustomCanvasPage() {
  const supabase = createClient();

  const [panelTypesRes, sizesRes, framesRes, finishesRes, settings] = await Promise.all([
    supabase
      .from('panel_types')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase.from('canvas_sizes').select('*').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('frames').select('*').eq('status', 'published').order('sort_order', { ascending: true }),
    supabase.from('finishes').select('*').eq('status', 'published').order('sort_order', { ascending: true }),
    getSettings(),
  ]);

  const panelTypes = panelTypesRes.data && panelTypesRes.data.length > 0 ? panelTypesRes.data : FALLBACK_PANELS;
  const sizes = sizesRes.data && sizesRes.data.length > 0 ? sizesRes.data : FALLBACK_SIZES;
  const frames = framesRes.data && framesRes.data.length > 0 ? framesRes.data : FALLBACK_FRAMES;
  const finishes = finishesRes.data && finishesRes.data.length > 0 ? finishesRes.data : FALLBACK_FINISHES;

  return (
    <div className="container-page py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
            🖼️ Live Canvas Studio
          </span>
          <h1 className="font-display text-3xl font-extrabold text-text mt-2">
            Create Your Custom Wall Canvas
          </h1>
          <p className="mt-1 text-sm text-muted max-w-2xl">
            Split your photo or default 7 Running Horses artwork across 1 to 7 panels. See continuous photo flow on real room walls.
          </p>
        </div>
      </div>

      <CanvasBuilderClient
        panelTypes={panelTypes}
        sizes={sizes}
        frames={frames}
        finishes={finishes}
        settings={settings}
      />
    </div>
  );
}
