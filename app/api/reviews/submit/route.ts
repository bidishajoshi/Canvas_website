import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`review:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'You have submitted too many reviews. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customer_name, location, rating, comment } = body;

    if (!customer_name || !comment) {
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }

    const supabase = createClient();
    await supabase.from('reviews').insert({
      customer_name,
      location: location || 'Nepal',
      rating: Number(rating) || 5,
      comment,
      status: 'pending', // MUST go to admin for approval before showing on site
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
