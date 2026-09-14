'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateSettings(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const field = (name: string) => String(formData.get(name) ?? '') || null;

  const { error } = await supabase
    .from('settings')
    .upsert({
      id: true,
      business_name: field('business_name') ?? 'Affordable Decoration',
      tagline: field('tagline'),
      short_description: field('short_description'),
      email: field('email'),
      phone: field('phone'),
      whatsapp_number: field('whatsapp_number'),
      address: field('address'),
      opening_hours: field('opening_hours'),
      facebook_url: field('facebook_url'),
      instagram_url: field('instagram_url'),
      tiktok_url: field('tiktok_url'),
      youtube_url: field('youtube_url'),
      logo_url: field('logo_url'),
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings');
  revalidatePath('/');
}
