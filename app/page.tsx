import { createClient } from '@/lib/supabase/server';
import { HeroSlider, type HeroSlide } from '@/components/home/HeroSlider';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BestSellers } from '@/components/home/BestSellers';
import { CozyCanvasCollection } from '@/components/home/CozyCanvasCollection';
import { CustomCanvasCta } from '@/components/home/CustomCanvasCta';
import { CustomTShirtCta } from '@/components/home/CustomTShirtCta';
import { SalesInquiryForm } from '@/components/home/SalesInquiryForm';
import { Testimonials } from '@/components/home/Testimonials';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhatsAppCtaSection } from '@/components/home/WhatsAppCtaSection';

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: announcement }, { data: dbSlides }] = await Promise.all([
    supabase.from('announcement_bar').select('*').single(),
    supabase.from('hero_slides').select('*').eq('active', true).order('sort_order', { ascending: true }),
  ]);

  const heroSlides: HeroSlide[] = (dbSlides || []).map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle || '',
    badge: slide.badge || undefined,
    imageUrl: slide.image_url,
    ctaText: slide.cta_text || 'Explore Products 🖼️',
    ctaHref: slide.cta_href || '/custom-canvas',
  }));

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Top Announcement Bar */}
      <AnnouncementBar
        message={
          announcement?.enabled
            ? announcement.message
            : '🇳🇵 Free Delivery Across Kathmandu Valley on Orders Over Rs. 2,000! Express Cash on Delivery Available.'
        }
        href={announcement?.enabled ? announcement.link_href : '/custom-canvas'}
      />

      {/* Multi-Photo Hero Slider */}
      <HeroSlider slides={heroSlides} />

      {/* Shop By Category */}
      <CategoryGrid section={{ id: 'sec-cat', section_key: 'shop_by_category', title: 'Explore Decor & Apparel Categories', subtitle: 'Choose from single canvas, multi-panel splits, and custom t-shirts.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 1 }} />

      {/* Best Sellers & Discounted Products */}
      <BestSellers section={{ id: 'sec-best', section_key: 'best_sellers', title: 'Best Selling Ready-Made Wall Art', subtitle: 'Top rated decorative canvas pieces loved by homes across Nepal.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 2 }} />

      {/* 7-Piece Staggered Canvas Builder Spotlight */}
      <CustomCanvasCta section={{ id: 'sec-canvas', section_key: 'custom_canvas_cta', title: 'Custom 7-Panel Canvas Wall Builder', subtitle: 'Upload your photo, preview 1 to 7 panel splits on actual wall backgrounds.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 3 }} />

      {/* Ready Made Pinterest-Style Canvas Collection */}
      <CozyCanvasCollection />

      {/* Custom T-Shirt Builder Spotlight */}
      <CustomTShirtCta section={{ id: 'sec-tshirt', section_key: 'custom_tshirt_cta', title: 'Design Your Own Custom T-Shirt', subtitle: 'Pick colors, add graphic artwork, or upload your own design with custom text.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 5 }} />

      {/* Sales & Wholesale Bulk Inquiry Form */}
      <SalesInquiryForm />

      {/* Moderated Verified Customer Reviews */}
      <Testimonials />

      {/* Why Choose Us */}
      <WhyChooseUs section={{ id: 'sec-why', section_key: 'why_choose_us', title: 'Why Nepal Chooses Affordable Decoration', subtitle: 'Unmatched print quality, pine wood framing, and fast cash on delivery.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 7 }} />

      {/* How Easy It Works */}
      <HowItWorks section={{ id: 'sec-how', section_key: 'how_it_works', title: 'Three Simple Steps to Receive Your Canvas', subtitle: 'Select size, upload photo, and receive at your doorstep.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 8 }} />

      {/* WhatsApp Quick Chat */}
      <WhatsAppCtaSection section={{ id: 'sec-wa', section_key: 'whatsapp_cta', title: 'Need Custom Help or Instant Order?', subtitle: 'Our design team is live on WhatsApp to assist with frame and panel sizing.', body: null, cta_label: null, cta_href: null, secondary_cta_label: null, secondary_cta_href: null, media: {}, settings: {}, enabled: true, sort_order: 9 }} />
    </main>
  );
}
