'use client';

import { useState, type FormEvent } from 'react';

export function ContactForm() {
  const [values, setValues] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      setStatus(res.ok ? 'sent' : 'error');
      if (res.ok) setValues({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <p className="rounded-card border border-border p-5 text-sm">
        Thanks — your message has been sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Name" value={values.name} onChange={(v) => setValues((s) => ({ ...s, name: v }))} required />
      <Field label="Phone" value={values.phone} onChange={(v) => setValues((s) => ({ ...s, phone: v }))} />
      <Field label="Email" type="email" value={values.email} onChange={(v) => setValues((s) => ({ ...s, email: v }))} />
      <Field label="Subject" value={values.subject} onChange={(v) => setValues((s) => ({ ...s, subject: v }))} />
      <div>
        <label className="text-xs text-muted">Message</label>
        <textarea
          required
          rows={4}
          value={values.message}
          onChange={(e) => setValues((s) => ({ ...s, message: e.target.value }))}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-card bg-accent-yellow px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)] disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
      />
    </div>
  );
}
