'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

function toPaisa(rupees: FormDataEntryValue | null): number {
  const value = parseFloat(String(rupees ?? '0'));
  return Math.round((Number.isFinite(value) ? value : 0) * 100);
}

export async function createProduct(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const { error } = await supabase.from('products').insert({
    name,
    slug: slugify(name),
    sku: String(formData.get('sku') ?? '') || null,
    short_description: String(formData.get('short_description') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
    main_image_url: String(formData.get('main_image_url') ?? '') || null,
    category_id: String(formData.get('category_id') ?? '') || null,
    base_price_paisa: toPaisa(formData.get('base_price')),
    discount_price_paisa: formData.get('discount_price')
      ? toPaisa(formData.get('discount_price'))
      : null,
    stock: formData.get('stock') ? Number(formData.get('stock')) : null,
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
    is_new_arrival: formData.get('is_new_arrival') === 'on',
    status: String(formData.get('status') ?? 'draft'),
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const { error } = await supabase
    .from('products')
    .update({
      name,
      sku: String(formData.get('sku') ?? '') || null,
      short_description: String(formData.get('short_description') ?? '') || null,
      description: String(formData.get('description') ?? '') || null,
      main_image_url: String(formData.get('main_image_url') ?? '') || null,
      category_id: String(formData.get('category_id') ?? '') || null,
      base_price_paisa: toPaisa(formData.get('base_price')),
      discount_price_paisa: formData.get('discount_price')
        ? toPaisa(formData.get('discount_price'))
        : null,
      stock: formData.get('stock') ? Number(formData.get('stock')) : null,
      is_featured: formData.get('is_featured') === 'on',
      is_best_seller: formData.get('is_best_seller') === 'on',
      is_new_arrival: formData.get('is_new_arrival') === 'on',
      status: String(formData.get('status') ?? 'draft'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProduct(productId: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}
