'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      title: 'Turn Your Family Photos Into 7-Piece Canvas Art',
      subtitle: 'High-definition canvas wall statement split across staggered heights. Perfect decor for home & office in Nepal.',
      badge: '🇳🇵 #1 Wall Decor Choice in Nepal',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Build Custom Canvas 🖼️',
      ctaHref: '/custom-canvas',
      secondaryCtaText: 'Browse Ready Made Art',
      secondaryCtaHref: '/shop',
    },
    {
      id: 'slide-2',
      title: 'Design Your Own Custom T-Shirts Online',
      subtitle: 'Premium 180 GSM combed cotton t-shirts customized with photo prints, typography, and graphic logos with live mockup preview.',
      badge: '👕 Custom Apparel Customizer',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Customize T-Shirt Now 👕',
      ctaHref: '/custom-t-shirt',
      secondaryCtaText: 'Shop Apparel',
      secondaryCtaHref: '/categories',
    },
    {
      id: 'slide-3',
      title: '7-Horse & Spiritual Canvas Gallery Collections',
      subtitle: 'Bring positive energy, prosperity, and modern aesthetic elegance into your living space with our ready-to-hang gallery pieces.',
      badge: '✨ Special Festive Offer',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Offers & Discounts 🏷️',
      ctaHref: '/offers',
      secondaryCtaText: 'Contact for Bulk Order',
      secondaryCtaHref: '/contact',
    },
  ];

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  // Auto slide interval
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[500px] sm:min-h-[580px] flex items-center">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        {activeSlides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <Image
              src={s.imageUrl}
              alt={s.title}
              fill
              className="object-cover object-center"
              priority={idx === 0}
            />
            {/* Dark Overlay Gradient for contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          </div>
        ))}
      </div>

      {/* Slide Content */}
      <div className="container-page relative z-10 py-16 sm:py-24 max-w-3xl">
        {slide.badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-neutral-950 uppercase tracking-wider mb-4 shadow-lg animate-fadeIn">
            {slide.badge}
          </span>
        )}

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-md">
          {slide.title}
        </h1>

        <p className="text-neutral-200 text-base sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl drop-shadow">
          {slide.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={slide.ctaHref}
            className="px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-xl transition-all hover:scale-105"
          >
            {slide.ctaText}
          </Link>

          {slide.secondaryCtaText && (
            <Link
              href={slide.secondaryCtaHref || '/shop'}
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm sm:text-base backdrop-blur transition-all"
            >
              {slide.secondaryCtaText}
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 text-white border border-white/20 hover:bg-amber-600 transition-colors flex items-center justify-center"
            aria-label="Previous Slide"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 text-white border border-white/20 hover:bg-amber-600 transition-colors flex items-center justify-center"
            aria-label="Next Slide"
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-white/40 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
