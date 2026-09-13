import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import type { CartItem } from '@/lib/cart';

interface OrderRequestBody {
  items: CartItem[];
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  shippingAddress: Record<string, string>;
  paymentMethodId: string;
  shippingRuleId: string;
  couponCode: string | null;
}

function generateOrderNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(Math.random() * 90000 + 10000);
  return `${prefix}-${year}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as OrderRequestBody;

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }
  if (!body.guestName || !body.guestPhone) {
    return NextResponse.json(
      { error: 'Name and phone are required.' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const settings = await getSettings();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Re-verify every line item's price server-side rather than trusting
  // the numbers the browser sent.
  const resolvedItems: Array<{
    product_id: string | null;
    canvas_configuration_id: string | null;
    name_snapshot: string;
    image_snapshot_url: string | null;
    size_snapshot: string | null;
    frame_snapshot: string | null;
    finish_snapshot: string | null;
    quantity: number;
    unit_price_paisa: number;
    subtotal_paisa: number;
  }> = [];

  for (const item of body.items) {
    if (item.type === 'product' && item.productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, main_image_url, base_price_paisa, discount_price_paisa')
        .eq('id', item.productId)
        .single();

      if (!product) continue;

      const unitPrice =
        product.discount_price_paisa != null &&
        product.discount_price_paisa < product.base_price_paisa
          ? product.discount_price_paisa
          : product.base_price_paisa;

      resolvedItems.push({
        product_id: product.id,
        canvas_configuration_id: null,
        name_snapshot: product.name,
        image_snapshot_url: product.main_image_url,
        size_snapshot: null,
        frame_snapshot: null,
        finish_snapshot: null,
        quantity: item.quantity,
        unit_price_paisa: unitPrice,
        subtotal_paisa: unitPrice * item.quantity,
      });
    } else if (item.type === 'custom_canvas' && item.canvasConfigurationId) {
      const { data: config } = await supabase
        .from('canvas_configurations')
        .select('id, calculated_price_paisa, quantity')
        .eq('id', item.canvasConfigurationId)
        .single();

      if (!config) continue;

      // The configuration was already priced authoritatively server-side
      // when it was saved (see /api/canvas/configure). Derive a per-unit
      // price from it rather than trusting the cart's cached value.
      const unitPrice = Math.round(config.calculated_price_paisa / Math.max(1, config.quantity));

      resolvedItems.push({
        product_id: null,
        canvas_configuration_id: config.id,
        name_snapshot: item.name,
        image_snapshot_url: item.imageUrl ?? null,
        size_snapshot: item.sizeLabel ?? null,
        frame_snapshot: item.frameLabel ?? null,
        finish_snapshot: item.finishLabel ?? null,
        quantity: item.quantity,
        unit_price_paisa: unitPrice,
        subtotal_paisa: unitPrice * item.quantity,
      });
    }
  }

  if (resolvedItems.length === 0) {
    return NextResponse.json(
      { error: 'None of the items in your cart could be verified.' },
      { status: 400 }
    );
  }

  const subtotalPaisa = resolvedItems.reduce((sum, i) => sum + i.subtotal_paisa, 0);

  let discountPaisa = 0;
  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', body.couponCode)
      .eq('active', true)
      .single();

    if (coupon) {
      const now = new Date();
      const withinWindow =
        (!coupon.starts_at || new Date(coupon.starts_at) <= now) &&
        (!coupon.ends_at || new Date(coupon.ends_at) >= now);
      const underUsageLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
      const meetsMinimum = !coupon.min_order_paisa || subtotalPaisa >= coupon.min_order_paisa;

      if (withinWindow && underUsageLimit && meetsMinimum) {
        discountPaisa =
          coupon.discount_type === 'percentage'
            ? Math.round((subtotalPaisa * coupon.discount_value) / 100)
            : coupon.discount_value;

        if (coupon.max_discount_paisa) {
          discountPaisa = Math.min(discountPaisa, coupon.max_discount_paisa);
        }
      }
    }
  }

  let shippingPaisa = 0;
  const { data: shippingRule } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('id', body.shippingRuleId)
    .single();

  if (shippingRule) {
    const qualifiesForFreeShipping =
      shippingRule.free_shipping_threshold_paisa != null &&
      subtotalPaisa >= shippingRule.free_shipping_threshold_paisa;
    shippingPaisa = qualifiesForFreeShipping ? 0 : shippingRule.charge_paisa;
  }

  const totalPaisa = Math.max(0, subtotalPaisa - discountPaisa) + shippingPaisa;
  const orderNumber = generateOrderNumber(settings.order_prefix);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: user?.id ?? null,
      guest_name: body.guestName,
      guest_phone: body.guestPhone,
      guest_email: body.guestEmail,
      shipping_address: body.shippingAddress,
      payment_method_id: body.paymentMethodId,
      shipping_rule_id: body.shippingRuleId,
      coupon_code: body.couponCode,
      subtotal_paisa: subtotalPaisa,
      discount_paisa: discountPaisa,
      shipping_paisa: shippingPaisa,
      total_paisa: totalPaisa,
      status: 'pending',
      delivery_notes: body.shippingAddress.delivery_notes ?? null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('orders insert error', orderError);
    return NextResponse.json({ error: 'Could not place your order.' }, { status: 500 });
  }

  await supabase.from('order_items').insert(
    resolvedItems.map((item) => ({ ...item, order_id: order.id }))
  );

  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    type: 'new_order',
    payload: { order_id: order.id, order_number: order.order_number },
  });

  return NextResponse.json({ id: order.id, orderNumber: order.order_number });
}
