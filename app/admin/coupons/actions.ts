'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

function toPaisa(value: FormDataEntryValue | null): number {
  const n = parseFloat(String(value ?? '0'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

export async function createCoupon(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const discountType = String(formData.get('discount_type') ?? 'percentage');
  const discountValue = Number(formData.get('discount_value') ?? 10);
  const minOrderRs = Number(formData.get('min_order_rs') ?? 0);
  const maxDiscountRs = Number(formData.get('max_discount_rs') ?? 0);
  const expiryDate = String(formData.get('expiry_date') ?? '') || null;
  const usageLimit = formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null;

  await supabase.from('coupon_codes').insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_paisa: Math.round(minOrderRs * 100),
    max_discount_paisa: maxDiscountRs > 0 ? Math.round(maxDiscountRs * 100) : null,
    expiry_date: expiryDate,
    usage_limit: usageLimit,
    used_count: 0,
    active: true,
  });

  revalidatePath('/admin/coupons');
  revalidatePath('/cart');
  revalidatePath('/checkout');
}

export async function toggleCouponActive(id: string, active: boolean) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('coupon_codes').update({ active }).eq('id', id);
  revalidatePath('/admin/coupons');
}

export async function deleteCoupon(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('coupon_codes').delete().eq('id', id);
  revalidatePath('/admin/coupons');
}
