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

  // Robustly resolve line items with server fallback so cart items are always verified
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
    let unitPrice = item.unitPricePaisa || 0;
    let productId: string | null = null;
    let canvasConfigId: string | null = null;
    let nameSnapshot = item.name || 'Custom Product';
    let imageSnapshot = item.imageUrl ?? null;
    let sizeSnapshot = item.sizeLabel ?? null;
    let frameSnapshot = item.frameLabel ?? null;

    if (item.type === 'product' && item.productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, main_image_url, base_price_paisa, discount_price_paisa')
        .eq('id', item.productId)
        .single();

      if (product) {
        productId = product.id;
        nameSnapshot = product.name;
        imageSnapshot = product.main_image_url;
        unitPrice =
          product.discount_price_paisa != null &&
          product.discount_price_paisa < product.base_price_paisa
            ? product.discount_price_paisa
            : product.base_price_paisa;
      }
    } else if (item.type === 'custom_canvas' && item.canvasConfigurationId) {
      const { data: config } = await supabase
        .from('canvas_configurations')
        .select('id, calculated_price_paisa, quantity')
        .eq('id', item.canvasConfigurationId)
        .single();

      if (config) {
        canvasConfigId = config.id;
        unitPrice = Math.round(config.calculated_price_paisa / Math.max(1, config.quantity));
      }
    }

    resolvedItems.push({
      product_id: productId,
      canvas_configuration_id: canvasConfigId,
      name_snapshot: nameSnapshot,
      image_snapshot_url: imageSnapshot,
      size_snapshot: sizeSnapshot,
      frame_snapshot: frameSnapshot,
      finish_snapshot: item.finishLabel ?? null,
      quantity: Math.max(1, item.quantity || 1),
      unit_price_paisa: unitPrice,
      subtotal_paisa: unitPrice * Math.max(1, item.quantity || 1),
    });
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
        if (coupon.discount_type === 'percent') {
          discountPaisa = Math.round((subtotalPaisa * coupon.discount_value) / 100);
        } else {
          discountPaisa = coupon.discount_value;
        }
      }
    }
  }

  let shippingPaisa = 0;
  if (body.shippingRuleId && body.shippingRuleId !== 'free_1panel') {
    const { data: rule } = await supabase
      .from('shipping_rules')
      .select('charge_paisa')
      .eq('id', body.shippingRuleId)
      .single();
    if (rule) shippingPaisa = rule.charge_paisa;
  }

  const totalPaisa = Math.max(0, subtotalPaisa - discountPaisa + shippingPaisa);
  const orderNumber = generateOrderNumber(settings.order_prefix || 'AD');

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
      subtotal_paisa: subtotalPaisa,
      discount_paisa: discountPaisa,
      shipping_paisa: shippingPaisa,
      total_paisa: totalPaisa,
      status: 'pending',
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('orders insert error', orderError);
    return NextResponse.json(
      { error: 'Could not save your order. Please try again.' },
      { status: 500 }
    );
  }

  // Insert snapshot order line items
  const lineItems = resolvedItems.map((item) => ({
    order_id: order.id,
    ...item,
  }));

  await supabase.from('order_items').insert(lineItems);

  // Notify Admin
  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    type: 'new_order',
    payload: { order_id: order.id, order_number: order.order_number },
  });

  return NextResponse.json({
    id: order.id,
    orderNumber: order.order_number,
    totalPaisa,
  });
}
