'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function approveReview(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  // Try updating in reviews table
  const { error } = await supabase
    .from('reviews')
    .update({ status: 'published' })
    .eq('id', id);

  if (error) {
    // Try updating in testimonials table as fallback
    await supabase.from('testimonials').update({ status: 'published' }).eq('id', id);
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/');
}

export async function deleteReview(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('reviews').delete().eq('id', id);
  await supabase.from('testimonials').delete().eq('id', id);

  revalidatePath('/admin/reviews');
  revalidatePath('/');
}
