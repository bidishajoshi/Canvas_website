import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface InquiryRequestBody {
  canvasConfigurationId?: string | null;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string;
  customer_phone?: string;
  customerEmail?: string | null;
  customer_email?: string | null;
  message?: string | null;
}

/**
 * Generates a human-readable inquiry reference number: AD-INQ-<year>-<short random suffix>.
 */
function generateInquiryNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AD-INQ-${year}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InquiryRequestBody;

  const customerName = body.customerName || body.customer_name;
  const customerPhone = body.customerPhone || body.customer_phone;
  const customerEmail = body.customerEmail || body.customer_email || null;
  const message = body.message || null;
  const canvasConfigurationId = body.canvasConfigurationId || null;

  if (!customerName || !customerPhone) {
    return NextResponse.json(
      { error: 'Customer name and phone number are required' },
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
      canvas_configuration_id: canvasConfigurationId,
      customer_id: user?.id ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      message,
      status: 'new',
    })
    .select('id, inquiry_number')
    .single();

  if (error || !inquiry) {
    console.error('canvas_inquiries insert error', error);
    return NextResponse.json(
      { error: 'Could not send your inquiry. Please try WhatsApp directly.' },
      { status: 500 }
    );
  }

  // Notify admin — surfaced in /admin/inquiries and the notification bell.
  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    type: 'new_inquiry',
    payload: { inquiry_id: inquiry.id, inquiry_number: inquiry.inquiry_number },
  });

  // Fetch admin WhatsApp number
  const { data: settings } = await supabase.from('settings').select('whatsapp_number').single();
  const waNumber = settings?.whatsapp_number || '9779864029898';
  const digitsOnly = waNumber.replace(/[^\d]/g, '') || '9779864029898';

  const waLines = [
    'Namaste Affordable Decoration! 🙏',
    '',
    `I would like to submit an inquiry (Ref #${inquiry.inquiry_number}):`,
    '',
    '👤 *CUSTOMER INFORMATION*:',
    `- Name: ${customerName}`,
    `- Phone: ${customerPhone}`,
  ];
  if (customerEmail) waLines.push(`- Email: ${customerEmail}`);

  if (message) {
    waLines.push('');
    waLines.push('💬 *INQUIRY DETAILS*:');
    waLines.push(`"${message}"`);
  }

  waLines.push('');
  waLines.push('Please assist me with details, options, and pricing. Thank you!');

  const waText = encodeURIComponent(waLines.join('\n'));
  const whatsappUrl = `https://wa.me/${digitsOnly}?text=${waText}`;

  return NextResponse.json({
    id: inquiry.id,
    inquiryNumber: inquiry.inquiry_number,
    whatsappUrl,
  });
}
