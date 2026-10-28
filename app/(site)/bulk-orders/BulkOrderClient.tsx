'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { Settings } from '@/lib/types';

interface BulkOrderClientProps {
  settings: Settings;
}

const DISCOUNT_TIERS = [
  { range: '5 ÔÇô 10 Pieces', discount: '10% OFF', idealFor: 'Small Teams, Birthday Squads, Home Remodels', icon: '­ƒôª' },
  { range: '11 ÔÇô 25 Pieces', discount: '20% OFF', idealFor: 'Offices, Restaurant Wall Art, Club Tees', icon: '­ƒÅó' },
  { range: '26 ÔÇô 50 Pieces', discount: '30% OFF', idealFor: 'Hotels, Corporate Gifts, College Events', icon: '­ƒÅ¿' },
  { range: '50+ Pieces', discount: 'Custom VIP Pricing', idealFor: 'Nationwide Brand Merchandising & Resorts', icon: '­ƒÆÄ' },
];

const INDUSTRIES = [
  {
    title: 'Offices & Corporate Workspaces',
    description: 'Transform blank meeting rooms and executive cabins with branded core-value canvases, motivational quotes, and employee milestone recognition prints.',
    icon: '­ƒÆ╝',
    badge: 'Workplace Branding',
  },
  {
    title: 'Cafes, Restaurants & Lounges',
    description: 'Create Instagrammable dining ambiances with warm acoustic coffee art, retro multi-panel canvases, and customized waiter uniforms.',
    icon: 'Ôÿò',
    badge: 'Hospitality Decor',
  },
  {
    title: 'Hotels, Resorts & Airbnbs',
    description: 'Premium Himalayan landscape panoramas, Buddha peaceful themes, and durable pine wood frames that delight guests and elevate review ratings.',
    icon: '­ƒÅö´©Å',
    badge: 'Resort Staging',
  },
  {
    title: 'Colleges, Clubs & Fest Merch',
    description: 'High-density DTF printed custom t-shirts in 180 GSM and 240 GSM heavyweight cotton for annual gatherings, sports meets, and student cohorts.',
    icon: '­ƒæò',
    badge: 'Custom Apparel',
  },
];

export function BulkOrderClient({ settings }: { settings: Settings }) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    phone: '',
    email: '',
    productType: 'Custom Canvas Art',
    quantity: '10-25 Pieces',
    details: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const messageBody = `[BULK ORDER INQUIRY]\nOrganization: ${formData.organization || 'Individual'}\nProduct Interest: ${formData.productType}\nEstimated Quantity: ${formData.quantity}\n\nClient Notes:\n${formData.details}`;

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: `Corporate Bulk Order: ${formData.organization || formData.name} (${formData.quantity})`,
          message: messageBody,
        }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const storePhone = settings.phone || '+977 9864029898';
  const waNumber = settings.whatsapp_number || '9779864029898';

  return (
    <div className="container-page py-12 max-w-5xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Wholesale &amp; Commercial Partnerships
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Corporate &amp; Bulk Orders
        </h1>
        <p className="text-sm text-muted">
          Equip your office, hotel, restaurant, or team with premium handcrafted canvas wall decor and custom printed apparel at volume wholesale rates in Nepal.
        </p>
      </div>

      {/* Volume Discount Tiers */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">
            Transparent Volume Discount Tiers
          </h2>
          <p className="text-xs text-muted">
            The more pieces you print, the more you save on unit costs and delivery.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOUNT_TIERS.map((tier) => (
            <div
              key={tier.range}
              className="rounded-2xl border border-border bg-bg p-5 text-center flex flex-col justify-between hover:border-amber-600/60 transition-all shadow-xs"
            >
              <div>
                <span className="text-3xl mb-2 block">{tier.icon}</span>
                <span className="text-xs text-muted font-bold block">{tier.range}</span>
                <span className="font-display text-2xl font-extrabold text-amber-600 mt-1 block">
                  {tier.discount}
                </span>
                <p className="text-[11px] text-muted mt-2 leading-relaxed">{tier.idealFor}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Free Proofing Included
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industries & Solutions Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-xl sm:text-3xl font-bold text-text">
            Tailored Solutions for Every Business
          </h2>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            From single boutique studios to multi-story office headquarters across Kathmandu, Pokhara, and Nepal.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.title}
              className="rounded-2xl border border-border bg-surface p-6 space-y-3 hover:border-amber-600/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl p-2 rounded-xl bg-surface-hover inline-block">
                    {ind.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {ind.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-text">
                  {ind.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mt-2">
                  {ind.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>Free Sample Proofing Available</span>
                <span>Ô£ô</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Quote Request Form & WhatsApp Direct */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-display font-bold text-xl text-text">
              Request a Bulk Custom Quote
            </h3>
            <p className="text-xs text-muted mt-1">
              Fill out your requirements below and our commercial sales specialist will provide an official quotation within 3 hours.
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
              <span className="text-3xl block">­ƒÄë</span>
              <h4 className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
                Quotation Request Received!
              </h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Thank you. Our bulk sales team will review your specs and contact you via phone and WhatsApp with discounted pricing.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text block mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Shrestha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text block mb-1">Organization / Business</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. CloudTech Nepal / Himalayan Cafe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text block mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="corporate@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text block mb-1">Product Category</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  >
                    <option>Custom Canvas Art (Single or Multi-Panel)</option>
                    <option>Customized Printed T-Shirts</option>
                    <option>Both Canvas &amp; Custom Apparel</option>
                    <option>Hotel &amp; Resort Staging Collection</option>
                    <option>Other / Special Project</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text block mb-1">Estimated Quantity</label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600"
                  >
                    <option>5 ÔÇô 10 Pieces (10% Off)</option>
                    <option>11 ÔÇô 25 Pieces (20% Off)</option>
                    <option>26 ÔÇô 50 Pieces (30% Off)</option>
                    <option>50+ Pieces (VIP Negotiated)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text block mb-1">Order Details &amp; Dimensions</label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Tell us what sizes, designs, delivery deadlines, or questions you have..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-text text-xs outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-600 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  Could not submit quotation request. Please message directly on WhatsApp below.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Submitting Quotation Request...' : 'Submit Bulk Quotation Request ÔåÆ'}
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-lg text-text">
              Need Instant Quote or Sample Inspection?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Our B2B team can share physical sample swatches of 380 GSM cotton canvas and send digital mockups directly to your WhatsApp.
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello Affordable Decoration, I am inquiring about corporate bulk order pricing and catalogs.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>­ƒÆ¼</span>
                <span>Direct WhatsApp Corporate Line</span>
              </a>

              <a
                href={`tel:${storePhone.replace(/[^\d+]/g, '')}`}
                className="w-full py-3 px-4 rounded-xl border border-border bg-surface-hover hover:border-amber-600 text-text font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>­ƒô×</span>
                <span>Call Commercial Sales: {storePhone}</span>
              </a>
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">Ô£ô</span>
                <span>Official VAT / PAN Tax Invoice provided</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">Ô£ô</span>
                <span>Bulk sample approval before mass production</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">Ô£ô</span>
                <span>Express courier shipping to all 77 districts in Nepal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
