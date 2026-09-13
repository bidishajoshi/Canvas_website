import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CouponCode } from '@/lib/types';

const FALLBACK_COUPONS: CouponCode[] = [
  {
    id: 'c1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_paisa: 100000, // Rs. 1,000 min
    used_count: 5,
    active: true,
  },
  {
    id: 'c2',
    code: 'FESTIVE20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_paisa: 250000, // Rs. 2,500 min
    used_count: 12,
    active: true,
  },
  {
    id: 'c3',
    code: 'DECOR500',
    discount_type: 'fixed',
    discount_value: 500, // Rs. 500 off
    min_order_paisa: 200000, // Rs. 2,000 min
    used_count: 8,
    active: true,
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputCode = (body.code || '').trim().toUpperCase();
    const subtotalPaisa = Number(body.subtotalPaisa || 0);

    if (!inputCode) {
      return NextResponse.json({ valid: false, error: 'Enter a promo code.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from('coupon_codes')
      .select('*')
      .ilike('code', inputCode)
      .eq('active', true)
      .single();

    const coupon: CouponCode | undefined = data || FALLBACK_COUPONS.find((c) => c.code === inputCode && c.active);

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired promo code.' },
        { status: 404 }
      );
    }

    if (coupon.min_order_paisa && subtotalPaisa < coupon.min_order_paisa) {
      const minRs = Math.round(coupon.min_order_paisa / 100);
      return NextResponse.json(
        { valid: false, error: `This promo code requires a minimum order of Rs. ${minRs.toLocaleString()}.` },
        { status: 400 }
      );
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This promo code has expired.' }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'This promo code usage limit has been reached.' }, { status: 400 });
    }

    let discountPaisa = 0;
    if (coupon.discount_type === 'percentage') {
      discountPaisa = Math.round((subtotalPaisa * coupon.discount_value) / 100);
      if (coupon.max_discount_paisa && discountPaisa > coupon.max_discount_paisa) {
        discountPaisa = coupon.max_discount_paisa;
      }
    } else {
      discountPaisa = Math.round(coupon.discount_value * 100); // Fixed Rs to paisa
    }

    discountPaisa = Math.min(discountPaisa, subtotalPaisa);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountPaisa,
      message: `✓ Promo code ${coupon.code} applied successfully!`,
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Failed to process promo code.' }, { status: 500 });
  }
}
