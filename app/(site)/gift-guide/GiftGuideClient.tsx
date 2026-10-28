'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Settings } from '@/lib/types';

interface GiftIdea {
  id: string;
  category: 'weddings' | 'housewarming' | 'birthdays' | 'family' | 'couples';
  title: string;
  subtitle: string;
  description: string;
  recommendedLayout: string;
  priceRange: string;
  imageUrl: string;
  ctaText: string;
  ctaHref: string;
}

const GIFT_IDEAS: GiftIdea[] = [
  {
    id: 'g1',
    category: 'weddings',
    title: 'Wedding & Engagement Memory Triptych',
    subtitle: 'Relive the most magical day of your life',
    description: 'Split your iconic wedding photoshoot portrait into an elegant 3-piece staggered canvas wall set. Crafted with archival UV inks to last generations without fading.',
    recommendedLayout: '3-Piece Triptych (36" ├ù 24" or 48" ├ù 32")',
    priceRange: 'Rs. 1,800 ÔÇô Rs. 3,500',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Build Wedding Canvas',
    ctaHref: '/custom-canvas',
  },
  {
    id: 'g2',
    category: 'housewarming',
    title: '7 Running Horses Vastu Prosperity Canvas',
    subtitle: 'The #1 Housewarming gift in Nepal',
    description: 'Believed in Vastu Shastra to bring rapid progress, financial abundance, and vitality to new homes. Hand-stretched onto solid kiln-dried pine wood.',
    recommendedLayout: '5-Piece Pentaptych (60" ├ù 32" Total)',
    priceRange: 'Rs. 2,400 ÔÇô Rs. 5,520',
    imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Order 7 Horses Vastu Art',
    ctaHref: '/custom-canvas',
  },
  {
    id: 'g3',
    category: 'housewarming',
    title: 'Serene Temple Lotus Buddha Wall Art',
    subtitle: 'Peace, tranquility & zen for living rooms',
    description: 'Golden lotus accents and serene meditative Lord Buddha focal art. Ideal for entryways, prayer spaces, and tranquil living walls.',
    recommendedLayout: 'Single Grand Focal Panel (24" ├ù 36")',
    priceRange: 'Rs. 1,500 ÔÇô Rs. 3,825',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Explore Buddha Collection',
    ctaHref: '/shop',
  },
  {
    id: 'g4',
    category: 'birthdays',
    title: 'Birthday Milestone Photo Collage Canvas',
    subtitle: 'A gift filled with genuine nostalgia',
    description: 'Gather childhood snapshots, trips with best friends, and cherished candid smiles into a vibrant photo collage canvas print.',
    recommendedLayout: '12" ├ù 18" or 16" ├ù 24" Single Canvas',
    priceRange: 'Rs. 950 ÔÇô Rs. 1,750',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Create Birthday Canvas',
    ctaHref: '/custom-canvas',
  },
  {
    id: 'g5',
    category: 'couples',
    title: 'Personalized Couple Matching T-Shirts',
    subtitle: 'Wear your memories and inside jokes together',
    description: '180 GSM combed cotton couple t-shirts printed with anniversary dates, matching heart illustrations, or custom typography.',
    recommendedLayout: 'Set of 2 Bio-Washed Cotton T-Shirts',
    priceRange: 'Rs. 1,300 ÔÇô Rs. 1,598 Pair',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Customize Couple Tees',
    ctaHref: '/custom-t-shirt',
  },
  {
    id: 'g6',
    category: 'family',
    title: 'Multigenerational Family Wall Portrait',
    subtitle: 'Cherish grandparents, parents, and kids together',
    description: 'Preserve family heritage portraits with museum-grade gallery stretching. Guaranteed to become the central talking point of your living room.',
    recommendedLayout: 'Grand 3-Piece or Single 30" ├ù 40" Canvas',
    priceRange: 'Rs. 2,200 ÔÇô Rs. 4,200',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Design Family Canvas',
    ctaHref: '/custom-canvas',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All Gifts' },
  { key: 'weddings', label: '­ƒÆì Weddings & Anniversaries' },
  { key: 'housewarming', label: '­ƒÅí Housewarming & Vastu' },
  { key: 'birthdays', label: '­ƒÄü Birthday Surprises' },
  { key: 'family', label: '­ƒæ¿ÔÇì­ƒæ®ÔÇì­ƒæºÔÇì­ƒæª Family & Newborns' },
  { key: 'couples', label: 'ÔØñ´©Å Couples & Romance' },
];

export function GiftGuideClient({ settings }: { settings: Settings }) {
  const [activeCat, setActiveCat] = useState('all');

  const filteredGifts = activeCat === 'all'
    ? GIFT_IDEAS
    : GIFT_IDEAS.filter((g) => g.category === activeCat);

  return (
    <div className="container-page py-12 max-w-5xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Curated Gift Inspiration
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Personalized Gift Guide
        </h1>
        <p className="text-sm text-muted">
          Give gifts that touch the heart. Explore our curated selection of personalized photo canvas prints, wall art, and customized apparel for every milestone in Nepal.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCat(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs ${
              activeCat === cat.key
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-surface border border-border text-muted hover:text-text hover:border-amber-600/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gift Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGifts.map((gift) => (
          <div
            key={gift.id}
            className="group rounded-3xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-600/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={gift.imageUrl}
                  alt={gift.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur shadow-sm">
                    {gift.recommendedLayout}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  {gift.subtitle}
                </span>
                <h3 className="font-display font-bold text-lg text-text group-hover:text-amber-600 transition-colors">
                  {gift.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {gift.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-muted font-medium">Estimated Price:</span>
                  <span className="font-mono font-extrabold text-amber-600 text-sm">
                    {gift.priceRange}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={gift.ctaHref}
                className="w-full text-center py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all block"
              >
                {gift.ctaText} ÔåÆ
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Gift Packaging Notice */}
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
            ­ƒÄü Complimentary Gift Packaging
          </span>
          <h3 className="font-display font-bold text-xl text-text">
            Sending Directly to the Recipient?
          </h3>
          <p className="text-xs text-muted max-w-xl">
            We can gift-wrap your canvas parcel, enclose a personalized printed greeting card with your custom message, and ship it directly to their doorstep anywhere in Nepal without any invoice inside!
          </p>
        </div>

        <Link
          href="/custom-canvas"
          className="shrink-0 px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          Customize a Gift Now ÔåÆ
        </Link>
      </div>
    </div>
  );
}
