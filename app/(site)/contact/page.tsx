import type { Metadata } from 'next';
import { getSettings } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Contact Us | ${settings.business_name}`,
    description: `Get in touch with ${settings.business_name}. Order photo canvas prints, wall decor, customized t-shirts or inquire about corporate gifts in Nepal.`,
  };
}

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          We are here to help
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Contact Affordable Decoration
        </h1>
        <p className="text-sm text-muted">
          Have a question about your custom photo canvas, panel size, t-shirt order, or bulk delivery in Nepal? Reach out to us anytime.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-text border-b border-border pb-3">
              Store &amp; Support Info
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <LocationIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-text block">Store Location</span>
                  <span className="text-muted text-xs">{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-text block">Customer Support Phone</span>
                  <span className="text-muted text-xs">{settings.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <MailIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-text block">Email Support</span>
                  <span className="text-muted text-xs">{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-text block">Working Hours</span>
                  <span className="text-muted text-xs">{settings.opening_hours}</span>
                </div>
              </div>
            </div>

            {settings.whatsapp_number && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageIcon className="h-4 w-4" />
                  <span>Chat directly on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Contact Inquiry Form */}
        <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4">
          <h2 className="font-display font-bold text-xl text-text border-b border-border pb-3">
            Send an Instant Message
          </h2>

          <form className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bipin Sharma"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Subject</label>
              <select className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text outline-none focus:border-amber-600">
                <option>General Inquiry</option>
                <option>Custom Canvas Order Help</option>
                <option>Custom T-Shirt Order Help</option>
                <option>Track My Order Status</option>
                <option>Corporate or Wholesale Bulk Order</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Your Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Tell us what size, panel split, or t-shirt design you need..."
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Send Message →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21s-7-7.3-7-11.5a7 7 0 1 1 14 0C19 13.7 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
