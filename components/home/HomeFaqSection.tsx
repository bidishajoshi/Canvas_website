'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HOME_FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Canvas Quality',
    question: 'What photo resolution is needed to print a high quality canvas?',
    answer: 'Photos taken on modern smartphones (iPhone, Samsung, etc.), DSLR cameras, or downloaded in original size from Google Drive/WhatsApp (sent as document) look stunning! Our automated builder checks your DPI in real-time. If an image is too small or blurry, our art team will contact you on WhatsApp with enhancements before printing.',
  },
  {
    id: 'f2',
    category: 'Delivery & Shipping',
    question: 'How long does delivery take across Nepal?',
    answer: 'Kathmandu Valley orders are delivered within 1 to 3 working days. For cities outside the valley (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, etc.), delivery takes 3 to 5 working days via express courier with real-time tracking.',
  },
  {
    id: 'f3',
    category: 'Payment Methods',
    question: 'Can I pay via Cash on Delivery (COD) or eSewa/Khalti?',
    answer: 'Yes! We support Cash on Delivery (COD), eSewa QR Pay, Khalti, and direct Bank Transfer. Note: for custom personalized photo orders outside the valley, a nominal advance delivery fee (e.g. Rs. 150) is requested to verify the active address.',
  },
  {
    id: 'f4',
    category: 'Digital Proofing',
    question: 'Do I get to see a digital preview before you print?',
    answer: 'Absolutely! For every custom multi-panel canvas and personalized t-shirt order, our designers generate an exact digital preview showing split lines and wrap margins, sent to your WhatsApp for approval before going to the press.',
  },
  {
    id: 'f5',
    category: 'Framing & Hanging',
    question: 'Does the canvas come with frames and hanging hooks?',
    answer: 'Yes! Every canvas comes hand-stretched onto solid 1.25" kiln-dried pine wood stretchers with heavy-duty sawtooth brass hangers pre-installed. It is 100% ready to hang on your wall in under 2 minutes right out of the box.',
  },
  {
    id: 'f6',
    category: 'Damages & Returns',
    question: 'What happens if my canvas is damaged during courier transit?',
    answer: 'We provide a 100% Damage-Free Transit Guarantee. If a frame arrives bent, cracked, or damaged by courier handling, simply take a photo and send it to our WhatsApp support within 48 hours. We will reprint and ship a brand new piece free of charge.',
  },
];

export function HomeFaqSection() {
  const [openId, setOpenId] = useState<string | null>('f1');

  return (
    <section className="container-page py-16 border-t border-border">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Got Questions? We Have Answers
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted">
            Everything you need to know about custom canvas printing, frames, t-shirts, and delivery in Nepal.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          {HOME_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="transition-colors">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-text">
                      {faq.question}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`h-6 w-6 rounded-full border border-border flex items-center justify-center shrink-0 text-muted transition-transform font-mono text-sm ${
                      isOpen ? 'rotate-180 text-amber-600 border-amber-600/40 bg-amber-500/10 font-bold' : ''
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/40 bg-bg/50 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/faq"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline hover:no-underline px-4 py-2"
          >
            Browse Full FAQ Knowledge Base →
          </Link>
          <span className="hidden sm:inline text-border">•</span>
          <a
            href="https://wa.me/9779864029898"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <span>💬</span> Still have questions? Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
