'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

import { markIdAsDeleted, savePaymentMethodToStore } from '@/lib/adminStore';

export async function createPaymentMethod(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  const instructions = String(formData.get('instructions') ?? '').trim();
  const qrCodeUrl = String(formData.get('qr_code_url') ?? '').trim();

  if (!name || !code) throw new Error('Name and Code are required.');

  const method = {
    id: code,
    name,
    code,
    instructions: instructions || null,
    config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
    active: true,
  };

  savePaymentMethodToStore(method);

  try {
    await supabase.from('payment_methods').insert({
      name,
      code,
      instructions: instructions || null,
      config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
      active: true,
    });
  } catch (err) {
    console.error('Supabase createPaymentMethod fallback:', err);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function updatePaymentMethod(id: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const instructions = String(formData.get('instructions') ?? '').trim();
  const qrCodeUrl = String(formData.get('qr_code_url') ?? '').trim();

  savePaymentMethodToStore({
    id,
    name,
    instructions: instructions || null,
    config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
  });

  try {
    await supabase
      .from('payment_methods')
      .update({
        name,
        instructions: instructions || null,
        config: qrCodeUrl ? { qr_code_url: qrCodeUrl } : {},
      })
      .eq('id', id);
  } catch (err) {
    console.error('Supabase updatePaymentMethod fallback:', err);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function togglePaymentMethodActive(id: string, active: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();

  savePaymentMethodToStore({ id, active });

  try {
    await supabase
      .from('payment_methods')
      .update({ active })
      .eq('id', id);
  } catch (err) {
    console.error('Supabase togglePaymentMethodActive fallback:', err);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}

export async function deletePaymentMethod(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);

  try {
    const supabase = createAdminClient();
    await supabase.from('payment_methods').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deletePaymentMethod fallback:', err);
  }

  revalidatePath('/admin/payments');
  revalidatePath('/checkout');
}
