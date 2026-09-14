import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { approveReview, deleteReview } from './actions';

export default async function AdminReviewsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: pendingReviews }, { data: publishedReviews }] = await Promise.all([
    supabase.from('reviews').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(20),
  ]);

  const pending = pendingReviews || [];
  const published = publishedReviews || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Customer Reviews Moderation</h1>
          <p className="text-xs text-muted mt-1">
            All customer reviews submitted on the website must be approved by an Admin before appearing publicly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {pending.length} Pending Approval
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {published.length} Published
          </span>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-amber-600 flex items-center gap-2">
          <span>⏳</span> Reviews Awaiting Approval ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted">
            No pending customer reviews awaiting moderation right now.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border-2 border-amber-500/40 bg-surface p-5 shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-text text-sm">{review.customer_name}</span>
                    <span className="text-xs text-amber-500 font-bold">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.location && (
                    <span className="text-[11px] text-muted block mb-2">📍 {review.location}</span>
                  )}
                  <p className="text-xs text-text italic bg-bg p-3 rounded-xl border border-border">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <form action={approveReview.bind(null, review.id)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      ✓ Approve &amp; Publish
                    </button>
                  </form>

                  <form action={deleteReview.bind(null, review.id)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-600/20 font-bold text-xs transition-colors"
                    >
                      ✕ Reject / Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Reviews Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <span>✅</span> Published Reviews ({published.length})
        </h2>

        {published.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted">
            No published reviews yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-surface p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text">{review.customer_name}</span>
                  <span className="text-amber-500 font-bold">
                    {'★'.repeat(review.rating)}
                  </span>
                </div>
                <p className="text-muted line-clamp-3">&ldquo;{review.comment}&rdquo;</p>
                <div className="pt-2 border-t border-border flex justify-end">
                  <form action={deleteReview.bind(null, review.id)}>
                    <button type="submit" className="text-[11px] text-rose-600 hover:underline font-semibold">
                      Unpublish / Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
