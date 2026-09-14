'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

function toPaisa(value: FormDataEntryValue | null): number {
  const n = parseFloat(String(value ?? '0'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCanvasProduct(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? 'Untitled Canvas');
  const slug = String(formData.get('slug') || slugify(name));
  const origPaisa = toPaisa(formData.get('original_price'));
  const discPaisa = formData.get('discount_price') ? toPaisa(formData.get('discount_price')) : null;

  let discPercent: number | null = null;
  if (discPaisa && origPaisa > 0 && discPaisa < origPaisa) {
    discPercent = Math.round(((origPaisa - discPaisa) / origPaisa) * 100);
  }

  await supabase.from('canvas_products').insert({
    name,
    slug,
    description: String(formData.get('description') ?? '') || null,
    main_image_url: String(formData.get('main_image_url') ?? ''),
    panel_count: Number(formData.get('panel_count') ?? 1),
    size_label: String(formData.get('size_label') ?? 'Standard Size'),
    frame_label: String(formData.get('frame_label') ?? '') || null,
    original_price_paisa: origPaisa,
    discount_price_paisa: discPaisa,
    discount_percentage: discPercent,
    sku: String(formData.get('sku') ?? '') || null,
    stock: Number(formData.get('stock') ?? 10),
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
    is_new_arrival: formData.get('is_new_arrival') === 'on',
    is_trending: formData.get('is_trending') === 'on',
    show_on_homepage: formData.get('show_on_homepage') === 'on',
    status: 'published',
    sort_order: 1,
  });

  revalidatePath('/admin/canvas-products');
  revalidatePath('/shop');
  revalidatePath('/');
}

import { markIdAsDeleted } from '@/lib/adminStore';

export async function deleteCanvasProduct(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  await supabase.from('canvas_products').delete().eq('id', id);
  revalidatePath('/admin/canvas-products');
  revalidatePath('/shop');
  revalidatePath('/');
}
