'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createShippingRule(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const zoneName = String(formData.get('zone_name') ?? '').trim();
  const chargeRs = parseFloat(String(formData.get('charge_rs') ?? '0'));
  const freeThresholdRs = formData.get('free_shipping_threshold_rs')
    ? parseFloat(String(formData.get('free_shipping_threshold_rs')))
    : null;
  const estimatedDaysMin = parseInt(String(formData.get('estimated_days_min') ?? '1'));
  const estimatedDaysMax = parseInt(String(formData.get('estimated_days_max') ?? '3'));

  if (!zoneName) throw new Error('Zone Name is required.');

  const chargePaisa = Math.round(chargeRs * 100);
  const freeThresholdPaisa = freeThresholdRs != null ? Math.round(freeThresholdRs * 100) : null;

  const { error } = await supabase.from('shipping_rules').insert({
    zone_name: zoneName,
    charge_paisa: chargePaisa,
    free_shipping_threshold_paisa: freeThresholdPaisa,
    estimated_days_min: estimatedDaysMin,
    estimated_days_max: estimatedDaysMax,
    active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

export async function toggleShippingRuleActive(id: string, active: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_rules')
    .update({ active })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

export async function deleteShippingRule(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { error } = await supabase.from('shipping_rules').delete().eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}
