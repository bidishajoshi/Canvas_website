'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Settings } from '@/lib/types';

interface DetailedFaq {
  id: string;
  category: 'Canvas' | 'Panels' | 'T-Shirts' | 'Shipping' | 'Payments' | 'Care';
  question: string;
  answer: string;
}

const FAQS_DATABASE: DetailedFaq[] = [
  // Canvas
  {
    id: 'c1',
    category: 'Canvas',
    question: 'What materials do you use for custom photo canvas?',
    answer: 'We use premium 380 GSM heavy-duty 100% cotton canvas woven with an authentic artistic texture. It is coated with a specialized gesso microporous layer that locks in archival pigment inks without glare. Unlike cheap polyester banners, our cotton canvas will never sag, shrink, or crack.',
  },
  {
    id: 'c2',
    category: 'Canvas',
    question: 'How do I know if my photo quality is good enough?',
    answer: 'Our live Canvas Customizer automatically calculates your image resolution and gives a real-time DPI badge (Excellent, Good, or Low). Photos captured on modern mobile phones (iPhone, Samsung, Xiaomi, OnePlus, etc.) are generally more than sharp enough for up to 36├ù24 inch prints. If you have an older photo, our design team uses AI-assisted super-resolution to sharpen and upscale it for free before printing.',
  },
  {
    id: 'c3',
    category: 'Canvas',
    question: 'Are the printed canvas colors water and UV resistant?',
    answer: 'Yes! We use genuine 12-color archival pigment UV inks. The colors are water-resistant and fade-proof for over 100 years in typical indoor room lighting conditions.',
  },

  // Panels
  {
    id: 'p1',
    category: 'Panels',
    question: 'How do 3-panel and 5-panel canvas splits work?',
    answer: 'Our interactive canvas studio splits your single photo seamlessly across multiple panels (Triptych 3-piece, Pentaptych 5-piece, or 7-piece staggered layouts). We automatically adjust edge-wrapping so that no vital details of your photo are lost in the folds.',
  },
  {
    id: 'p2',
    category: 'Panels',
    question: 'What is the recommended gap between panels when hanging?',
    answer: 'We recommend leaving a gap of 2 cm to 3 cm (approx. 1 inch) between panels when mounting them on your wall. This maintains the visual flow of the artwork and gives a dramatic, modern gallery aesthetic.',
  },
  {
    id: 'p3',
    category: 'Panels',
    question: 'Do the panels come with hanging hardware included?',
    answer: 'Yes! Every panel arrives with heavy-duty sawtooth brass hangers already mounted on the back, along with soft wall-spacer pads. You only need a standard small picture nail or hook on your wall.',
  },

  // T-Shirts
  {
    id: 't1',
    category: 'T-Shirts',
    question: 'What fabric quality are your custom t-shirts?',
    answer: 'We offer two premium tiers: our 180 GSM Bio-Washed Combed Cotton (classic unisex fit, ultra-soft and breathable) and our 240 GSM Heavyweight Streetwear Cotton (drop-shoulder oversized fit). Both are pre-shrunk so they retain their shape after washing.',
  },
  {
    id: 't2',
    category: 'T-Shirts',
    question: 'How durable is the t-shirt print after multiple washes?',
    answer: 'We use industrial DTF (Direct-to-Film) printing with flexible polyurethane pigment inks that stretch with the fabric without cracking, peeling, or fading for 50+ washes when washed inside-out in cold water.',
  },
  {
    id: 't3',
    category: 'T-Shirts',
    question: 'Can I print on both the front and back of a t-shirt?',
    answer: 'Yes! In our online T-Shirt Customizer, you can choose Front Chest Center, Full Back Graphic, or Left Sleeve placement and customize text, photos, or graphic designs on either side.',
  },

  // Shipping
  {
    id: 's1',
    category: 'Shipping',
    question: 'Where in Nepal do you deliver?',
    answer: 'We deliver to all 77 districts across Nepal! In Kathmandu, Lalitpur, and Bhaktapur, our in-house delivery team handles delivery. For outside valley locations (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, Dhangadhi, Birtamod, etc.), we partner with express couriers like Nepal Can Move.',
  },
  {
    id: 's2',
    category: 'Shipping',
    question: 'What are the delivery charges?',
    answer: 'Inside Kathmandu Valley, standard delivery is Rs. 100 (and 100% FREE on orders over Rs. 2,000!). For cities outside Kathmandu Valley, courier shipping is Rs. 200 to Rs. 350 depending on parcel weight and volume.',
  },
  {
    id: 's3',
    category: 'Shipping',
    question: 'How can I track my order?',
    answer: 'You can track live order progress at any time by visiting our "Track Order" page and entering your Order Reference ID (e.g. AD-2026-00001). You will see real-time stages: Received ÔåÆ Digital Proofing ÔåÆ Printing ÔåÆ Framing ÔåÆ Courier Shipped ÔåÆ Delivered.',
  },

  // Payments
  {
    id: 'pay1',
    category: 'Payments',
    question: 'What payment options are available?',
    answer: 'We accept Cash on Delivery (COD), eSewa Mobile Wallet QR scan, Khalti, and direct Bank Transfer (NABIL / NIC Asia).',
  },
  {
    id: 'pay2',
    category: 'Payments',
    question: 'Why is an advance delivery charge needed for COD outside Kathmandu?',
    answer: 'Because custom photo canvas prints and personalized t-shirts are uniquely crafted specifically for you and cannot be resold to anyone else, courier partners outside the valley require a small advance delivery commitment (Rs. 150) before dispatch. The remaining balance is paid in cash when you receive the parcel.',
  },

  // Care
  {
    id: 'care1',
    category: 'Care',
    question: 'How do I clean and maintain my canvas print?',
    answer: 'Simply dust your canvas gently with a clean, dry microfiber cloth or soft feather duster. Do not use chemical household glass cleaners or harsh solvents. For small spots, a slightly damp cloth with lukewarm water is sufficient.',
  },
  {
    id: 'care2',
    category: 'Care',
    question: 'Can I hang canvas in bathrooms or direct harsh sunlight?',
    answer: 'While our inks are UV-resistant, long-term exposure to intense direct tropical sunlight for years can accelerate wear. We recommend displaying canvas prints in covered rooms, living areas, hallways, and bedrooms away from direct shower moisture.',
  },
];

const CATEGORIES = [
  { key: 'All', label: 'All Questions' },
  { key: 'Canvas', label: '­ƒû╝´©Å Canvas & Quality' },
  { key: 'Panels', label: '­ƒôÉ Sizes & Split Panels' },
  { key: 'T-Shirts', label: '­ƒæò Custom T-Shirts' },
  { key: 'Shipping', label: '­ƒÜÜ Shipping & Nepal Delivery' },
  { key: 'Payments', label: '­ƒÆ│ Payments & COD' },
  { key: 'Care', label: '­ƒº╝ Care & Installation' },
];

export function FaqPageClient({ settings }: { settings: Settings }) {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ c1: true, s1: true });

  const filteredFaqs = useMemo(() => {
    return FAQS_DATABASE.filter((item) => {
      const matchCat = selectedCat === 'All' || item.category === selectedCat;
      const matchQuery =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCat, searchQuery]);

  function toggleOpen(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const storePhone = settings.phone || '+977 9864029898';
  const waNumber = settings.whatsapp_number || '9779864029898';

  return (
    <div className="container-page py-12 max-w-4xl space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Knowledge Base &amp; Help Center
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted">
          Find instant answers to everything related to personalized photo canvas prints, panel splits, customized apparel, and delivery across Nepal.
        </p>

        {/* Live Search Input */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">­ƒöì</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. resolution, COD, delivery, frame)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-surface text-text text-sm outline-none focus:border-amber-600 transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-text px-2 py-1 rounded-lg bg-surface-hover"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCat(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs ${
              selectedCat === cat.key
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-surface border border-border text-muted hover:text-text hover:border-amber-600/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border border-border p-10 text-center bg-surface space-y-3">
            <p className="text-sm font-semibold text-text">
              No questions found matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs text-muted">
              Have a custom request or specific question? Contact our team directly on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
            >
              Ask Support on WhatsApp ÔåÆ
            </a>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = !!openIds[faq.id];
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-border bg-surface transition-all overflow-hidden shadow-xs hover:border-amber-600/40"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleOpen(faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-text">
                      {faq.question}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`h-7 w-7 rounded-full border border-border flex items-center justify-center shrink-0 text-muted transition-transform font-mono text-base ${
                      isOpen ? 'rotate-180 text-amber-600 border-amber-600/40 bg-amber-500/10 font-bold' : ''
                    }`}
                  >
                    {isOpen ? 'ÔêÆ' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/50 bg-bg/40 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Card Callout */}
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <h3 className="font-display font-bold text-xl text-text">
            Still Have Questions or Need Help with an Order?
          </h3>
          <p className="text-xs text-muted">
            Our customer care team is available 7 days a week to review your photos, recommend wall dimensions, and give price quotes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-center hover:bg-[#25D366]/20 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-2xl mb-1">­ƒÆ¼</span>
            <span className="font-bold text-xs text-text group-hover:text-[#25D366]">Chat on WhatsApp</span>
            <span className="text-[11px] text-muted">Instant Replies</span>
          </a>

          <a
            href={`tel:${storePhone.replace(/[^\d+]/g, '')}`}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center hover:bg-amber-500/20 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-2xl mb-1">­ƒô×</span>
            <span className="font-bold text-xs text-text group-hover:text-amber-600">Call Support</span>
            <span className="text-[11px] text-muted">{storePhone}</span>
          </a>

          <Link
            href="/contact"
            className="p-4 rounded-2xl bg-surface-hover border border-border text-center hover:border-amber-600 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-2xl mb-1">Ô£ë´©Å</span>
            <span className="font-bold text-xs text-text group-hover:text-amber-600">Send an Inquiry</span>
            <span className="text-[11px] text-muted">Web Contact Form</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
