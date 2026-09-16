import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  createPaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodActive,
  updatePaymentMethod,
} from './actions';
import { filterDeleted } from '@/lib/adminStore';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  instructions: string | null;
  active: boolean;
  sort_order: number;
  config?: { qr_code_url?: string } | null;
}

const DEFAULT_PAYMENTS: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery (COD + Advance Delivery Fee)',
    code: 'cod',
    instructions:
      'Pay cash on delivery! Note: A small advance delivery charge (e.g. Rs. 150) must be paid via QR code before delivery dispatch to confirm your address.',
    active: true,
    sort_order: 1,
    config: {
      qr_code_url:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    },
  },
  {
    id: 'esewa',
    name: 'eSewa Mobile Wallet (Online QR Pay)',
    code: 'esewa',
    instructions:
      'Scan the official Affordable Decoration eSewa QR Code below to make instant payment to eSewa ID: 9800000000.',
    active: true,
    sort_order: 2,
    config: {
      qr_code_url:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    },
  },
  {
    id: 'bank_transfer',
    name: 'Direct Bank Transfer (NABIL / NIC Asia)',
    code: 'bank_transfer',
    instructions:
      'Transfer directly to NABIL Bank A/C: 0101017500001 (Affordable Decoration Pvt Ltd). Enter transaction reference or statement ID below.',
    active: true,
    sort_order: 3,
    config: {
      qr_code_url:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    },
  },
];

export default async function AdminPaymentsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .order('sort_order', { ascending: true });

  const methods = filterDeleted(
    data && data.length > 0 ? (data as PaymentMethod[]) : DEFAULT_PAYMENTS
  );

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          💳 Payment Gateway &amp; QR Code CMS
        </span>
        <h1 className="font-display text-2xl font-extrabold text-text mt-2">
          Payment Methods &amp; Official Payment QR Codes
        </h1>
        <p className="text-xs text-muted mt-1">
          Configure payment options (eSewa, Bank Transfer, COD), upload Admin Payment QR Codes, and set instructions for customer order verification.
        </p>
      </div>

      {/* Existing Payment Methods List */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <span>📱</span> Configured Payment Gateways &amp; QR Codes
          </h2>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {methods.length} Payment Options
          </span>
        </div>

        <div className="space-y-6">
          {methods.map((m) => {
            const qrUrl = m.config?.qr_code_url;
            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl border transition-all space-y-4 ${
                  m.active ? 'border-border bg-surface shadow-sm' : 'border-border/60 bg-surface/30 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-text">{m.name}</span>
                      <span className="font-mono text-xs text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded font-semibold border border-pink-500/20">
                        {m.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <form action={togglePaymentMethodActive.bind(null, m.id, !m.active)}>
                      <button type="submit" className="font-semibold text-amber-600 hover:underline">
                        {m.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>

                    <form action={deletePaymentMethod.bind(null, m.id)}>
                      <button type="submit" className="font-semibold text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updatePaymentMethod.bind(null, m.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Display Name</label>
                      <input
                        name="name"
                        type="text"
                        defaultValue={m.name}
                        required
                        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Instructions &amp; Delivery Terms</label>
                      <textarea
                        name="instructions"
                        rows={2}
                        defaultValue={m.instructions ?? ''}
                        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">Admin Payment QR Code Image URL</label>
                      <input
                        name="qr_code_url"
                        type="text"
                        defaultValue={qrUrl ?? ''}
                        placeholder="https://.../esewa_qr.jpg"
                        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Save Payment Changes 💾
                    </button>
                  </div>

                  {/* QR Code Preview Box */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-bg text-center space-y-2">
                    <span className="text-xs font-bold text-text">QR Code Preview</span>
                    {qrUrl ? (
                      <img src={qrUrl} alt={`${m.name} QR`} className="w-28 h-28 object-contain rounded-lg border border-border shadow-sm" />
                    ) : (
                      <div className="w-28 h-28 flex items-center justify-center border border-dashed border-border text-muted text-xs rounded-lg">
                        No QR Code URL
                      </div>
                    )}
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add New Payment Gateway Form */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-text flex items-center gap-2 border-b border-border pb-3">
          <span>➕</span> Add New Payment Option
        </h2>

        <form action={createPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-medium">Payment Name *</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Khalti Mobile Wallet"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium">Unique Code *</label>
            <input
              name="code"
              type="text"
              required
              placeholder="e.g. khalti"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-muted font-medium">Payment Instructions &amp; Notes</label>
            <textarea
              name="instructions"
              rows={2}
              placeholder="Enter instructions for customers (e.g. Send to Khalti ID 9800000000)..."
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-muted font-medium">Payment QR Code Image URL</label>
            <input
              name="qr_code_url"
              type="text"
              placeholder="https://.../qr.png"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all"
            >
              + Create Payment Option
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
