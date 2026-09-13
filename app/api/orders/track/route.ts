import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber')?.trim();
  const phone = searchParams.get('phone')?.trim();

  if (!orderNumber) {
    return NextResponse.json(
      { error: 'Order reference number is required.' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  let query = supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      created_at,
      total_paisa,
      guest_name,
      guest_phone,
      shipping_address,
      order_items (
        id,
        name_snapshot,
        size_snapshot,
        frame_snapshot,
        quantity,
        subtotal_paisa
      )
    `
    )
    .eq('order_number', orderNumber);

  if (phone) {
    query = query.eq('guest_phone', phone);
  }

  const { data: order, error } = await query.single();

  if (error || !order) {
    return NextResponse.json(
      { error: 'Order not found. Please double check your order number.' },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}
