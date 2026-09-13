import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function AccountInquiriesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/account/inquiries');

  const { data: inquiries } = await supabase
    .from('canvas_inquiries')
    .select('*, canvas_configurations(uploaded_image_url)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold">My Custom Canvas Inquiries</h1>

      <ul className="mt-6 space-y-3">
        {(inquiries ?? []).map((inquiry: any) => (
          <li key={inquiry.id} className="flex gap-4 rounded-card border border-border p-4 text-sm">
            {inquiry.canvas_configurations?.uploaded_image_url && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card bg-surface">
                <Image
                  src={inquiry.canvas_configurations.uploaded_image_url}
                  alt="Your canvas"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium">{inquiry.inquiry_number}</p>
              <p className="capitalize text-muted">{inquiry.status.replace('_', ' ')}</p>
            </div>
          </li>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p className="text-sm text-muted">You haven&apos;t sent any custom canvas inquiries yet.</p>
        )}
      </ul>
    </div>
  );
}
