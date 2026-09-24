import { createClient } from '@/lib/supabase/server';
import { HeroSlider, type HeroSlide } from '@/components/home/HeroSlider';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BestSellers } from '@/components/home/BestSellers';
import { CozyCanvasCollection } from '@/components/home/CozyCanvasCollection';
import { CustomTShirtCta } from '@/components/home/CustomTShirtCta';
import { SalesInquiryForm } from '@/components/home/SalesInquiryForm';
import { Testimonials } from '@/components/home/Testimonials';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhatsAppCtaSection } from '@/components/home/WhatsAppCtaSection';

export const revalidate = 60;

export default async function HomePage() {
  let announcement: { enabled?: boolean; message?: string; link_href?: string } | null = null;
  let dbSlides: any[] | null = null;

  try {
    const supabase = createClient();
    const [announcementRes, slidesRes] = await Promise.all([
      supabase.from('announcement_bar').select('*').single(),
      supabase.from('hero_slides').select('*').eq('active', true).order('sort_order', { ascending: true }),
    ]);
    announcement = announcementRes.data;
    dbSlides = slidesRes.data;
  } catch {
    announcement = null;
    dbSlides = null;
  }

  const defaultHeroSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      title: 'Custom Canvas Wall Art',
      subtitle: 'Turn your favorite photos into high-definition 1 to 7 panel canvas wall compositions delivered across Nepal.',
      badge: '🇳🇵 Nepal’s Premier Custom Store • Rs. 700 Onwards',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Customize Canvas Now 🖼️',
      ctaHref: '/custom-canvas',
      secondaryCtaText: 'Explore Collections',
      secondaryCtaHref: '/shop',
    },
    {
      id: 'slide-2',
      title: 'Pinterest Aesthetic Bedroom Photo Canvas',
      subtitle: 'Cozy memory wall galleries and multi-panel photo splits starting from Rs. 700 to Rs. 3,500.',
      badge: '✨ Aesthetic Room Decor • Rs. 1,900',
      imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Create Your Photo Wall 🖼️',
      ctaHref: '/custom-canvas',
      secondaryCtaText: 'View Best Sellers',
      secondaryCtaHref: '/shop',
    },
    {
      id: 'slide-3',
      title: '7-Piece Vastu Horse & Landscape Canvas',
      subtitle: 'Expansive 7-piece continuous panoramic wall statement pieces starting from Rs. 2,850.',
      badge: '🐎 Vastu & Prosperity Collection',
      imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Shop Vastu Canvases 🖼️',
      ctaHref: '/custom-canvas',
      secondaryCtaText: 'Explore All Sizes',
      secondaryCtaHref: '/categories',
    },
    {
      id: 'slide-4',
      title: 'Design Your Own Custom T-Shirts',
      subtitle: 'Premium cotton t-shirts customized with photo prints, typography, and graphic logos with live mockup preview.',
      badge: '👕 Custom Apparel Customizer • Rs. 799',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Customize T-Shirt Now 👕',
      ctaHref: '/custom-t-shirt',
      secondaryCtaText: 'Shop Apparel',
      secondaryCtaHref: '/categories',
    },
  ];

  const heroSlides: HeroSlide[] = (dbSlides || []).map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle || '',
    badge: slide.badge || undefined,
    imageUrl: slide.image_url,
    ctaText: slide.cta_text || 'Customize Now 🖼️',
    ctaHref: slide.cta_href || '/custom-canvas',
    secondaryCtaText: slide.secondary_cta_text || undefined,
    secondaryCtaHref: slide.secondary_cta_href || undefined,
  }));

  const activeSlides = heroSlides.length > 0 ? heroSlides : defaultHeroSlides;

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Top Announcement Bar */}
      <AnnouncementBar
        message={
          announcement?.enabled && announcement.message
            ? announcement.message
            : '🇳🇵 Free Delivery Across Kathmandu Valley on Orders Over Rs. 2,000! Express Cash on Delivery Available.'
        }
        href={announcement?.enabled && announcement.link_href ? announcement.link_href : 'https://affordabledecoration.vercel.app/custom-canvas'}
      />

      {/* Multi-Photo Hero Slider */}
      <HeroSlider slides={activeSlides} />

      {/* Shop By Category */}
      <CategoryGrid section={{ id: 'sec-cat', section_key: 'shop_by_category', title: 'Shop by Category', subtitle: 'Explore single canvas prints, multi-panel splits, custom portraits, and customized t-shirts.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 1 }} />

      {/* Best Sellers */}
      <BestSellers section={{ id: 'sec-best', section_key: 'best_sellers', title: 'Best Selling Ready-Made Canvases', subtitle: 'Customer favorite wall art and multi-panel decor handcrafted in Nepal.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 2 }} />

      {/* Cozy Ready Made Canvas Gallery */}
      <CozyCanvasCollection />

      {/* Custom T-Shirt Builder Spotlight */}
      <CustomTShirtCta section={{ id: 'sec-tshirt', section_key: 'custom_tshirt_cta', title: 'Design Your Own Custom T-Shirt', subtitle: 'Pick colors, select print locations, add graphic artwork, or upload your own design.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 6 }} />

      {/* Sales & Wholesale Bulk Order Form */}
      <SalesInquiryForm />

      {/* Verified Moderated Reviews */}
      <Testimonials />

      {/* Why Choose Us */}
      <WhyChooseUs section={{ id: 'sec-why', section_key: 'why_choose_us', title: 'Why Nepal Chooses Affordable Decoration', subtitle: 'Unmatched print quality, pine wood framing, and fast cash on delivery.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 8 }} />

      {/* How Easy It Works */}
      <HowItWorks section={{ id: 'sec-how', section_key: 'how_it_works', title: 'Three Simple Steps to Receive Your Canvas', subtitle: 'Select size, upload photo, and receive at your doorstep.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 9 }} />

      {/* WhatsApp Quick Chat */}
      <WhatsAppCtaSection section={{ id: 'sec-wa', section_key: 'whatsapp_cta', title: 'Need Custom Help or Instant Order?', subtitle: 'Our design team is live on WhatsApp to assist with frame and panel sizing.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 10 }} />
    </main>
  );
}
