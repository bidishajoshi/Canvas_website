import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import { CanvasBuilderClient } from '@/components/custom-canvas/CanvasBuilderClient';

export const metadata: Metadata = {
  title: 'Create Your Custom Canvas',
};

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

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Create Your Canvas</h1>
      <p className="mt-2 max-w-xl text-muted">
        Upload your favorite photo, choose your panels, and see your canvas come to
        life before you order.
      </p>

      <div className="mt-8">
        <CanvasBuilderClient
          panelTypes={panelTypesRes.data ?? []}
          sizes={sizesRes.data ?? []}
          frames={framesRes.data ?? []}
          finishes={finishesRes.data ?? []}
          settings={settings}
        />
      </div>
    </div>
  );
}
