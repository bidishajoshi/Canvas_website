import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  deletePaymentMethod,
  togglePaymentMethodActive,
} from './actions';
import { filterDeleted } from '@/lib/adminStore';
import { PaymentMethodEditForm } from '@/components/admin/PaymentMethodEditForm';
import { PaymentMethodCreateForm } from '@/components/admin/PaymentMethodCreateForm';

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

                <PaymentMethodEditForm method={m} />
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

        <PaymentMethodCreateForm />
      </section>
    </div>
  );
}
