'use client';

import { useState, type FormEvent } from 'react';

export interface InquiryFormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface InquiryFormProps {
  onSubmit: (values: InquiryFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function InquiryForm({ onSubmit, onCancel, submitting }: InquiryFormProps) {
  const [values, setValues] = useState<InquiryFormValues>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-card border border-border p-4">
      <h4 className="text-sm font-semibold">Send Inquiry</h4>

      <div>
        <label htmlFor="inq-name" className="text-xs text-muted">
          Full Name
        </label>
        <input
          id="inq-name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
        />
      </div>

      <div>
        <label htmlFor="inq-phone" className="text-xs text-muted">
          Phone
        </label>
        <input
          id="inq-phone"
          type="tel"
          required
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
        />
      </div>

      <div>
        <label htmlFor="inq-email" className="text-xs text-muted">
          Email (optional)
        </label>
        <input
          id="inq-email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
        />
      </div>

      <div>
        <label htmlFor="inq-message" className="text-xs text-muted">
          Message (optional)
        </label>
        <textarea
          id="inq-message"
          rows={3}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-card bg-accent-yellow px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)] disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Submit Inquiry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-card border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
