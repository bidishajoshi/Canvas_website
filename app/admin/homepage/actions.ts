'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addHeroSlide(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const badge = String(formData.get('badge') ?? '').trim();
  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = String(formData.get('image_url') ?? '').trim();

  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';
    imageUrl = `data:${mimeType};base64,${base64}`;
  }

  const ctaText = String(formData.get('cta_text') ?? 'Shop Now').trim();
  const ctaHref = String(formData.get('cta_href') ?? '/custom-canvas').trim();

  if (!title || !imageUrl) return;

  await supabase.from('hero_slides').insert({
    title,
    subtitle,
    badge,
    image_url: imageUrl,
    cta_text: ctaText,
    cta_href: ctaHref,
    active: true,
    sort_order: Date.now(),
  });

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

import { markIdAsDeleted } from '@/lib/adminStore';

export async function deleteHeroSlide(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  markIdAsDeleted(id);
  await supabase.from('hero_slides').delete().eq('id', id);

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function toggleSectionEnabled(id: string, enabled: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('homepage_sections').update({ enabled }).eq('id', id);

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}
