'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { markIdAsDeleted, saveHeroSlideToStore, saveAnnouncementBarToStore } from '@/lib/adminStore';

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

  const ctaText = String(formData.get('cta_text') ?? 'Build Custom Canvas 🖼️').trim();
  const ctaHref = String(formData.get('cta_href') ?? '/custom-canvas').trim();
  const secondaryCtaText = String(formData.get('secondary_cta_text') ?? '').trim();
  const secondaryCtaHref = String(formData.get('secondary_cta_href') ?? '').trim();

  if (!title || (!imageUrl && (!imageFile || imageFile.size === 0))) return;

  const newSlide = {
    id: 'slide-' + Date.now(),
    title,
    subtitle,
    badge,
    image_url: imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    cta_text: ctaText,
    cta_href: ctaHref,
    secondary_cta_text: secondaryCtaText || null,
    secondary_cta_href: secondaryCtaHref || null,
    active: true,
    sort_order: Date.now(),
  };

  saveHeroSlideToStore(newSlide);

  try {
    await supabase.from('hero_slides').insert({
      id: newSlide.id,
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      badge: newSlide.badge,
      image_url: newSlide.image_url,
      cta_text: newSlide.cta_text,
      cta_href: newSlide.cta_href,
      secondary_cta_text: newSlide.secondary_cta_text,
      secondary_cta_href: newSlide.secondary_cta_href,
      active: newSlide.active,
      sort_order: newSlide.sort_order,
    });
  } catch (err) {
    console.error('Supabase addHeroSlide fallback:', err);
  }

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function updateHeroSlide(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const id = String(formData.get('id') ?? '').trim();
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

  const ctaText = String(formData.get('cta_text') ?? '').trim();
  const ctaHref = String(formData.get('cta_href') ?? '').trim();
  const secondaryCtaText = String(formData.get('secondary_cta_text') ?? '').trim();
  const secondaryCtaHref = String(formData.get('secondary_cta_href') ?? '').trim();

  if (!id || !title) return;

  const updateData: Record<string, any> = {
    id,
    title,
    subtitle,
    badge: badge || null,
    cta_text: ctaText,
    cta_href: ctaHref,
    secondary_cta_text: secondaryCtaText || null,
    secondary_cta_href: secondaryCtaHref || null,
  };

  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  saveHeroSlideToStore(updateData);

  try {
    await supabase.from('hero_slides').update(updateData).eq('id', id);
  } catch (err) {
    console.error('Supabase updateHeroSlide fallback:', err);
  }

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function deleteHeroSlide(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  markIdAsDeleted(id);
  try {
    await supabase.from('hero_slides').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deleteHeroSlide fallback:', err);
  }

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function updateAnnouncementBar(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const message = String(formData.get('message') ?? '').trim();
  const linkHref = String(formData.get('link_href') ?? '').trim();
  const enabled = formData.get('enabled') === 'true' || formData.get('enabled') === 'on';

  saveAnnouncementBarToStore({
    message,
    link_href: linkHref,
    enabled,
  });

  try {
    // Upsert announcement bar
    const { data: existing } = await supabase.from('announcement_bar').select('*').limit(1).single();

    if (existing) {
      await supabase.from('announcement_bar').update({
        message,
        link_href: linkHref,
        enabled,
      }).eq('id', existing.id);
    } else {
      await supabase.from('announcement_bar').insert({
        message,
        link_href: linkHref,
        enabled,
      });
    }
  } catch (err) {
    console.error('Supabase updateAnnouncementBar fallback:', err);
  }

  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function updateHomepageSection(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();

  if (!id) return;

  await supabase.from('homepage_sections').update({
    title: title || null,
    subtitle: subtitle || null,
  }).eq('id', id);

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
