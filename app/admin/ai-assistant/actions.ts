'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addFaqKnowledge(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const question = String(formData.get('question') ?? '').trim();
  const answer = String(formData.get('answer') ?? '').trim();
  const category = String(formData.get('category') ?? 'General').trim();

  if (!question || !answer) return;

  await supabase.from('chat_knowledge').insert({
    question,
    answer,
    category,
    keywords: question.toLowerCase().split(/\s+/),
    status: 'published',
  });

  revalidatePath('/admin/ai-assistant');
}

export async function deleteFaqKnowledge(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('chat_knowledge').delete().eq('id', id);

  revalidatePath('/admin/ai-assistant');
}
