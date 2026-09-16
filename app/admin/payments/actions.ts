'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createPaymentMethod(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  const instructions = String(formData.get('instructions') ?? '').trim();
  const qrCodeUrl = String(formData.get('qr_code_url') ?? '').trim();

  if (!name || !code) throw new Error('Name and Code are required.');

  const { error } = await supabase.from('payment_methods').insert({
    name,
    code,
    instructions: instructions || null,
    config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
    active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function updatePaymentMethod(id: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const instructions = String(formData.get('instructions') ?? '').trim();
  const qrCodeUrl = String(formData.get('qr_code_url') ?? '').trim();

  const { error } = await supabase
    .from('payment_methods')
    .update({
      name,
      instructions: instructions || null,
      config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function togglePaymentMethodActive(id: string, active: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('payment_methods')
    .update({ active })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function deletePaymentMethod(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { error } = await supabase.from('payment_methods').delete().eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}
