'use client';

import { useState } from 'react';
import { updatePaymentMethod } from '@/app/admin/payments/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function PaymentMethodEditForm({ method }: { method: any }) {
  const [qrUrl, setQrUrl] = useState<string>(method.config?.qr_code_url || '');

  return (
    <form action={updatePaymentMethod.bind(null, method.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2 space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Display Name</label>
          <input
            name="name"
            type="text"
            defaultValue={method.name}
            required
            className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Instructions &amp; Delivery Terms</label>
          <textarea
            name="instructions"
            rows={2}
            defaultValue={method.instructions ?? ''}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div className="space-y-2 p-3 rounded-xl border border-border bg-bg">
          <label className="text-xs font-bold text-text uppercase tracking-wider block">
            📲 Admin Payment QR Code Image
          </label>
          <OptimizedImageUploader
            mode="admin"
            preset="screenshot"
            buttonText="📁 Upload Admin QR Code Image"
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
              placeholder="https://.../esewa_qr.jpg"
              className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text font-mono"
            />
          </div>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt={`${method.name} QR`} className="w-32 h-32 object-contain rounded-lg border border-border shadow-sm bg-white" />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center border border-dashed border-border text-muted text-xs rounded-lg">
            No QR Code URL
          </div>
        )}
      </div>
    </form>
  );
}
