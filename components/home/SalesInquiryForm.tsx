'use client';

import { useState } from 'react';

export function SalesInquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/canvas/inquiry', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: formData.get('name'),
          customer_phone: formData.get('phone'),
          customer_email: formData.get('email'),
          message: `[${formData.get('inquiry_type')}] ${formData.get('message')}`,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to submit sales inquiry');
      setSubmitted(true);
      form.reset();
    } catch {
      setError('Failed to send sales inquiry. Please try again or chat with us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-surface border-y border-border">
      <div className="container-page max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 block">
              Corporate &amp; Bulk Orders
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text mb-3">
              Need Bulk Canvas Printing or Sales Inquiry?
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Decorating a new hotel, cafe, corporate office, or planning bulk customized photo gifts? Get special wholesale discounts and direct design consultation across Nepal.
            </p>

            <div className="space-y-3 text-xs font-semibold text-text">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold">✓</span>
                <span>Wholesale volume discount for 5+ canvas prints</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold">✓</span>
                <span>Free wall placement design advice from interior artists</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold">✓</span>
                <span>Express door delivery &amp; cash on delivery anywhere in Nepal</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-6 shadow-md">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="text-4xl">✅</div>
                <h3 className="font-bold text-lg text-text">Sales Inquiry Received!</h3>
                <p className="text-xs text-muted">
                  Thank you! Our design team will contact you shortly via WhatsApp / phone to confirm specs and discount pricing.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-base text-text border-b border-border pb-2">
                  Submit Sales Inquiry
                </h3>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Ram Shrestha"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="9800000000"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Inquiry Type</label>
                    <select
                      name="inquiry_type"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
                    >
                      <option value="Bulk Canvas Wall Decor">Bulk Canvas Decor</option>
                      <option value="Hotel / Office Decor">Hotel / Office Decor</option>
                      <option value="Custom T-Shirt Bulk Order">Custom T-Shirt Bulk</option>
                      <option value="Reseller / Wholesale">Reseller / Wholesale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="ram@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Project Details / Specs</label>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder="Describe how many pieces, sizes, or custom requirements you have..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                {error && <div className="text-xs text-rose-600 font-semibold">{error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting Inquiry...' : 'Submit Sales Inquiry 📩'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
