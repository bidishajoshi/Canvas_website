import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(`order_track:${ip}`, 30, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many tracking requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber')?.trim();
  const phone = searchParams.get('phone')?.trim().replace(/[^\d]/g, '');

  if (!orderNumber) {
    return NextResponse.json(
      { error: 'Order reference number is required.' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  const { data: order, error } = await supabase
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
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: 'Order not found. Please double check your order number.' },
      { status: 404 }
    );
  }

  const storedPhone = String(order.guest_phone || '').replace(/[^\d]/g, '');
  const isPhoneVerified = phone && storedPhone && (phone === storedPhone || storedPhone.endsWith(phone));

  if (isPhoneVerified) {
    return NextResponse.json(order);
  }

  // If phone is not verified, mask customer PII to prevent unauthorized data exposure
  const maskedName = order.guest_name
    ? order.guest_name.split(' ').map((n: string) => n[0] + '***').join(' ')
    : 'Verified Customer';

  const maskedPhone = storedPhone
    ? storedPhone.slice(0, 3) + '*****' + storedPhone.slice(-2)
    : 'Protected Phone';

  const rawAddress = order.shipping_address || {};
  const maskedAddress = {
    district: rawAddress.district || 'Nepal',
    municipality: rawAddress.municipality ? '***' : undefined,
    tole_area: rawAddress.tole_area ? '***' : undefined,
    address_line: 'Protected Shipping Address (Verify phone to view)',
  };

  return NextResponse.json({
    ...order,
    guest_name: maskedName,
    guest_phone: maskedPhone,
    shipping_address: maskedAddress,
    is_masked: true,
  });
}
