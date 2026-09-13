import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.message) {
    return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: body.name,
    phone: body.phone || null,
    email: body.email || null,
    subject: body.subject || null,
    message: body.message,
  });

  if (error) {
    console.error('contact_messages insert error', error);
    return NextResponse.json({ error: 'Could not send your message.' }, { status: 500 });
  }

  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    type: 'new_contact_message',
    payload: { name: body.name },
  });

  return NextResponse.json({ ok: true });
}
