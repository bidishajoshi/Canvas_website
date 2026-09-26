'use client';

import { useState } from 'react';
import { createPaymentMethod } from '@/app/admin/payments/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function PaymentMethodCreateForm() {
  const [qrUrl, setQrUrl] = useState('');
  const [publishedMsg, setPublishedMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setPublishedMsg(false);
    try {
      await createPaymentMethod(formData);
      setPublishedMsg(true);
      setQrUrl('');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {publishedMsg && (
        <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between shadow-sm">
          <span>✓ Published successfully! Payment method is active.</span>
          <button type="button" onClick={() => setPublishedMsg(false)} className="text-xs font-extrabold hover:underline ml-2">✕</button>
        </div>
      )}

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

      <div className="sm:col-span-2 space-y-2 p-3.5 rounded-xl border border-border bg-bg">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">
          📲 Payment Gateway QR Code Image
        </label>
        <OptimizedImageUploader
          name="qr_code_url"
          mode="admin"
          preset="screenshot"
          buttonText="📁 Upload Payment QR Code Image from Computer"
          currentImageUrl={qrUrl}
          onOptimized={(result) => setQrUrl(result.url)}
        />
        <div>
          <label className="text-[11px] font-semibold text-muted block mb-1">Or QR Code Image URL</label>
          <input
            name="qr_code_url"
            type="text"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://.../qr.png"
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-mono"
          />
        </div>
      </div>

      <div className="sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all"
        >
          {isSubmitting ? 'Publishing...' : '+ Create Payment Option'}
        </button>
      </div>
    </form>
  );
}
