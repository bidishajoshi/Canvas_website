'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';
import { saveProductToStore, markIdAsDeleted } from '@/lib/adminStore';
import type { ContentStatus } from '@/lib/types';

function toPaisa(rupees: FormDataEntryValue | null): number {
  const value = parseFloat(String(rupees ?? '0'));
  return Math.round((Number.isFinite(value) ? value : 0) * 100);
}

export async function createProduct(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const newProduct = {
    id: 'p-' + Date.now(),
    name,
    slug: slugify(name),
    sku: String(formData.get('sku') ?? '').trim() || null,
    short_description: String(formData.get('short_description') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    main_image_url: String(formData.get('main_image_url') ?? '').trim() || null,
    category_id: String(formData.get('category_id') ?? '').trim() || null,
    tags: [],
    base_price_paisa: toPaisa(formData.get('base_price')),
    discount_price_paisa: formData.get('discount_price')
      ? toPaisa(formData.get('discount_price'))
      : null,
    stock: formData.get('stock') ? Number(formData.get('stock')) : null,
    material: null,
    weight_grams: null,
    dimensions: null,
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
    is_new_arrival: formData.get('is_new_arrival') === 'on',
    status: String(formData.get('status') ?? 'draft') as ContentStatus,
    seo_title: null,
    seo_description: null,
  };

  saveProductToStore(newProduct);

  try {
    await supabase.from('products').insert({
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      sku: newProduct.sku,
      short_description: newProduct.short_description,
      description: newProduct.description,
      main_image_url: newProduct.main_image_url,
      category_id: newProduct.category_id,
      base_price_paisa: newProduct.base_price_paisa,
      discount_price_paisa: newProduct.discount_price_paisa,
      stock: newProduct.stock,
      is_featured: newProduct.is_featured,
      is_best_seller: newProduct.is_best_seller,
      is_new_arrival: newProduct.is_new_arrival,
      status: newProduct.status,
    });
  } catch (err) {
    console.error('Supabase product insert fallback:', err);
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products');
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Product name is required');

  const updatedProduct = {
    id: productId,
    name,
    slug: slugify(name),
    sku: String(formData.get('sku') ?? '').trim() || null,
    short_description: String(formData.get('short_description') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    main_image_url: String(formData.get('main_image_url') ?? '').trim() || null,
    category_id: String(formData.get('category_id') ?? '').trim() || null,
    tags: [],
    base_price_paisa: toPaisa(formData.get('base_price')),
    discount_price_paisa: formData.get('discount_price')
      ? toPaisa(formData.get('discount_price'))
      : null,
    stock: formData.get('stock') ? Number(formData.get('stock')) : null,
    material: null,
    weight_grams: null,
    dimensions: null,
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
    is_new_arrival: formData.get('is_new_arrival') === 'on',
    status: String(formData.get('status') ?? 'draft') as ContentStatus,
    seo_title: null,
    seo_description: null,
  };

  saveProductToStore(updatedProduct);

  try {
    await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        short_description: updatedProduct.short_description,
        description: updatedProduct.description,
        main_image_url: updatedProduct.main_image_url,
        category_id: updatedProduct.category_id,
        base_price_paisa: updatedProduct.base_price_paisa,
        discount_price_paisa: updatedProduct.discount_price_paisa,
        stock: updatedProduct.stock,
        is_featured: updatedProduct.is_featured,
        is_best_seller: updatedProduct.is_best_seller,
        is_new_arrival: updatedProduct.is_new_arrival,
        status: updatedProduct.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);
  } catch (err) {
    console.error('Supabase product update fallback:', err);
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products');
}

export async function deleteProduct(productId: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(productId);
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (err) {
    console.error('Supabase product delete fallback:', err);
  }
  revalidatePath('/admin/products');
  revalidatePath('/shop');
}
