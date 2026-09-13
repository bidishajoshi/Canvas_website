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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Custom Canvas Inquiries</h1>
          <p className="text-xs text-muted mt-1">
            Review custom photo submissions, panel specs, price estimates &amp; contact customers on WhatsApp.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {(inquiries ?? []).map((inquiry: any) => {
          const config = inquiry.canvas_configurations;
          const cleanPhone = inquiry.customer_phone?.replace(/\D/g, '') || '';
          const waPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;
          const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(
            `Hello ${inquiry.customer_name}, regarding your custom canvas inquiry (${inquiry.inquiry_number}) on Affordable Decoration...`
          )}`;

          return (
            <div
              key={inquiry.id}
              className="flex flex-col sm:flex-row gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-amber-600/40 transition-colors"
            >
              {/* Photo Thumbnail */}
              {config?.uploaded_image_url ? (
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-hover">
                  <Image
                    src={config.uploaded_image_url}
                    alt="Uploaded Customer Photo"
                    fill
                    className="object-cover"
                  />
                  <a
                    href={config.uploaded_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[10px] font-semibold text-white hover:bg-amber-600"
                  >
                    View High-Res ↗
                  </a>
                </div>
              ) : (
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface-hover text-2xl text-muted">
                  🖼️
                </div>
              )}

              {/* Inquiry Details */}
              <div className="flex-1 space-y-2.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 text-base">
                      {inquiry.inquiry_number}
                    </span>
                    <span className="text-xs text-muted">
                      ({new Date(inquiry.created_at).toLocaleDateString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                    >
                      💬 Reply on WhatsApp
                    </a>
                    <InquiryStatusSelect inquiryId={inquiry.id} status={inquiry.status} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-muted uppercase tracking-wider text-[10px]">Customer:</span>
                    <p className="font-semibold text-text">{inquiry.customer_name}</p>
                    <p className="text-muted">{inquiry.customer_phone} {inquiry.customer_email ? `• ${inquiry.customer_email}` : ''}</p>
                  </div>

                  {config && (
                    <div>
                      <span className="font-semibold text-muted uppercase tracking-wider text-[10px]">Configured Specs:</span>
                      <p className="font-semibold text-text">
                        {config.panel_types?.name || 'Custom Panel'} ({config.canvas_sizes?.name || 'Standard Size'})
                      </p>
                      <p className="text-muted">
                        Frame: {config.frames?.name || 'Unframed'} • Finish: {config.finishes?.name || 'Matte'}
                      </p>
                      <p className="font-bold text-amber-600 mt-0.5">
                        Est. Price: {formatPaisa(config.calculated_price_paisa)}
                      </p>
                    </div>
                  )}
                </div>

                {inquiry.message && (
                  <div className="p-2.5 rounded bg-surface-hover border border-border text-xs">
                    <span className="font-semibold text-muted text-[10px] uppercase">Message from Customer:</span>
                    <p className="italic text-text mt-0.5">&ldquo;{inquiry.message}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(!inquiries || inquiries.length === 0) && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted text-sm">
            No customer custom canvas inquiries received yet.
          </div>
        )}
      </div>
    </div>
  );
}
