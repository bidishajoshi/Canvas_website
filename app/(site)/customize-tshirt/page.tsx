import type { Metadata } from 'next';
import { getSettings } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { TShirtBuilderClient } from '@/components/tshirt/TShirtBuilderClient';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Customize T-Shirt | ${settings.business_name}`,
    description:
      'Design your personalized custom T-shirt in Nepal. Select model, color, artwork design, or upload your own photo with live preview.',
  };
}

export default async function CustomizeTShirtPage() {
  const settings = await getSettings();

  let tshirtTypes: any[] = [];
  let colors: any[] = [];
  let sizes: any[] = [];
  let printLocations: any[] = [];
  let designs: any[] = [];

  try {
    const supabase = createClient();
    const [typesRes, colorsRes, sizesRes, locsRes, designsRes] = await Promise.all([
      supabase.from('tshirt_types').select('*').order('sort_order', { ascending: true }),
      supabase.from('tshirt_colors').select('*').order('sort_order', { ascending: true }),
      supabase.from('tshirt_sizes').select('*').order('sort_order', { ascending: true }),
      supabase.from('print_locations').select('*').order('sort_order', { ascending: true }),
      supabase.from('tshirt_designs').select('*').order('sort_order', { ascending: true }),
    ]);

    tshirtTypes = typesRes.data || [];
    colors = colorsRes.data || [];
    sizes = sizesRes.data || [];
    printLocations = locsRes.data || [];
    designs = designsRes.data || [];
  } catch {
    // Graceful fallbacks handled inside TShirtBuilderClient
  }

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
        <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Interactive T-Shirt Customizer
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-text">
          Design Your Custom T-Shirt
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Choose a T-shirt style &amp; color, select from our curated artwork library or upload your own design, add custom text, and preview your creation live before ordering!
        </p>
      </div>

      <TShirtBuilderClient
        tshirtTypes={tshirtTypes || []}
        colors={colors || []}
        sizes={sizes || []}
        printLocations={printLocations || []}
        designs={designs || []}
        settings={settings}
      />
    </div>
  );
}
