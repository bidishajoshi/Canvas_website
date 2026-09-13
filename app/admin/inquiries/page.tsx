import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { InquiryStatusSelect } from '@/components/admin/InquiryStatusSelect';

export default async function AdminInquiriesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: inquiries } = await supabase
    .from('canvas_inquiries')
    .select('*, canvas_configurations(*, panel_types(name), canvas_sizes(name), frames(name), finishes(name))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Custom Canvas Inquiries</h1>

      <div className="mt-6 space-y-4">
        {(inquiries ?? []).map((inquiry: any) => {
          const config = inquiry.canvas_configurations;
          return (
            <div key={inquiry.id} className="flex gap-4 rounded-card border border-border p-4">
              {config?.uploaded_image_url && (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card bg-surface">
                  <Image
                    src={config.uploaded_image_url}
                    alt="Uploaded"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{inquiry.inquiry_number}</p>
                  <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
                </div>
                <p className="mt-1">
                  {inquiry.customer_name} — {inquiry.customer_phone}
                  {inquiry.customer_email ? ` — ${inquiry.customer_email}` : ''}
                </p>
                {config && (
                  <p className="mt-1 text-muted">
                    {config.panel_types?.name}, {config.canvas_sizes?.name}
                    {config.frames?.name ? `, ${config.frames.name}` : ''}
                    {config.finishes?.name ? `, ${config.finishes.name}` : ''} —{' '}
                    {formatPaisa(config.calculated_price_paisa)}
                  </p>
                )}
                {inquiry.message && (
                  <p className="mt-1 italic text-muted">&ldquo;{inquiry.message}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })}

        {(!inquiries || inquiries.length === 0) && (
          <p className="text-sm text-muted">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
