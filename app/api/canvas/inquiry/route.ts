import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface InquiryRequestBody {
  canvasConfigurationId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  message: string | null;
}

/**
 * Generates a human-readable, sequential-looking inquiry number without
 * needing a database sequence: AD-INQ-<year>-<short random suffix>.
 * For guaranteed sequential numbering, replace this with a Postgres
 * sequence or a `select count(*)` inside a transaction.
 */
function generateInquiryNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AD-INQ-${year}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InquiryRequestBody;

  if (!body.customerName || !body.customerPhone) {
    return NextResponse.json(
      { error: 'customerName and customerPhone are required' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inquiryNumber = generateInquiryNumber();

  const { data: inquiry, error } = await supabase
    .from('canvas_inquiries')
    .insert({
      inquiry_number: inquiryNumber,
      canvas_configuration_id: body.canvasConfigurationId,
      customer_id: user?.id ?? null,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      message: body.message,
      status: 'new',
    })
    .select('id, inquiry_number')
    .single();

  if (error || !inquiry) {
    console.error('canvas_inquiries insert error', error);
    return NextResponse.json(
      { error: 'Could not send your inquiry. Please try WhatsApp instead.' },
      { status: 500 }
    );
  }

  // Notify admin — surfaced in /admin/inquiries and the notification bell.
  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    type: 'new_inquiry',
    payload: { inquiry_id: inquiry.id, inquiry_number: inquiry.inquiry_number },
  });

  return NextResponse.json({
    id: inquiry.id,
    inquiryNumber: inquiry.inquiry_number,
  });
}
