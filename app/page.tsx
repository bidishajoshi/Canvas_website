import { getHomepageSections } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/home/HeroSection';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { CustomCanvasCta } from '@/components/home/CustomCanvasCta';
import { PanelShowcase } from '@/components/home/PanelShowcase';
import { BestSellers } from '@/components/home/BestSellers';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { GallerySection } from '@/components/home/GallerySection';
import { FaqSection } from '@/components/home/FaqSection';
import { WhatsAppCtaSection } from '@/components/home/WhatsAppCtaSection';
import type { HomepageSection } from '@/lib/types';

// Maps each admin-configured section_key to its renderer. Sections are
// looked up dynamically and rendered in the order + enabled state the
// admin set in /admin/homepage — nothing here is a fixed layout.
const SECTION_RENDERERS: Record<
  string,
  (section: HomepageSection) => React.ReactNode
> = {
  hero: (s) => <HeroSection key={s.id} section={s} />,
  shop_by_category: (s) => <CategoryGrid key={s.id} section={s} />,
  custom_canvas_cta: (s) => <CustomCanvasCta key={s.id} section={s} />,
  panel_showcase: (s) => <PanelShowcase key={s.id} section={s} />,
  best_sellers: (s) => <BestSellers key={s.id} section={s} />,
  why_choose_us: (s) => <WhyChooseUs key={s.id} section={s} />,
  how_it_works: (s) => <HowItWorks key={s.id} section={s} />,
  customer_reviews: (s) => <Testimonials key={s.id} section={s} />,
  gallery: (s) => <GallerySection key={s.id} section={s} />,
  faq: (s) => <FaqSection key={s.id} section={s} />,
  whatsapp_cta: (s) => <WhatsAppCtaSection key={s.id} section={s} />,
};

export default async function HomePage() {
  const sections = await getHomepageSections();
  const supabase = createClient();
  const { data: announcement } = await supabase
    .from('announcement_bar')
    .select('*')
    .single();

  return (
    <>
      {announcement?.enabled && (
        <AnnouncementBar message={announcement.message} href={announcement.link_href} />
      )}

      {sections.map((section) => {
        const render = SECTION_RENDERERS[section.section_key];
        return render ? render(section) : null;
      })}
    </>
  );
}
