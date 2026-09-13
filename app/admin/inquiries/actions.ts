'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { InquiryStatus } from '@/lib/types';

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('canvas_inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', inquiryId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/inquiries');
}
