import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface CmsPageProps {
  params: { slug: string };
}

interface DefaultPageContent {
  title: string;
  seo_description: string;
  blocks: Array<{ heading?: string; body: string }>;
}

const DEFAULT_PAGES: Record<string, DefaultPageContent> = {
  privacy: {
    title: 'Privacy Policy',
    seo_description: 'Privacy Policy for Affordable Decoration. Learn how we handle your custom canvas photos, order metadata, and personal data.',
    blocks: [
      {
        heading: 'Information We Collect',
        body: 'When you place a custom canvas, wall art, or customized t-shirt order with Affordable Decoration, we collect your name, contact phone number, delivery address, and the image files uploaded for printing. We process this information exclusively to design, print, and deliver your order across Nepal.',
      },
      {
        heading: 'Handling of Uploaded Photos',
        body: 'Your uploaded photos are stored securely on encrypted Cloudinary/Supabase storage buckets solely for processing your print order. We respect your copyright and personal privacy; your personal photos are never shared, sold, or published publicly without your explicit written approval.',
      },
      {
        heading: 'Data Security & Third-Party Delivery',
        body: 'We share necessary delivery information (recipient name, phone number, delivery address) with our courier partners (e.g., Nepal Can Move) to ensure prompt delivery. We do not sell your personal data to any third-party advertisers.',
      },
      {
        heading: 'Contact Us Regarding Privacy',
        body: 'If you have questions about your personal data or wish to request deletion of your order records, please contact our support team at support@affordabledecoration.com or via WhatsApp.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    seo_description: 'Terms and Conditions of service for ordering photo canvas prints and customized products from Affordable Decoration Nepal.',
    blocks: [
      {
        heading: '1. Order Acceptance & Custom Printing',
        body: 'By placing an order on Affordable Decoration, you confirm that you hold the necessary rights to print the uploaded photos. Orders are queued for digital proofing and production upon order confirmation.',
      },
      {
        heading: '2. Digital Proof Approval',
        body: 'For custom multi-panel canvas prints and personalized apparel, our team sends a high-resolution digital preview for your review before final canvas stretching or printing. Once approved, production begins immediately.',
      },
      {
        heading: '3. Pricing & Payment Options',
        body: 'All prices listed on our website are in Nepalese Rupees (NPR). We accept Cash on Delivery (COD), eSewa, Khalti, and direct bank transfers.',
      },
      {
        heading: '4. Returns & Replacement Policy',
        body: 'Due to the custom nature of personalized photo prints, returns are accepted in cases of manufacturing defects, frame damage during transit, or incorrect print dimensions. Please inspect your item upon delivery and notify us within 48 hours for immediate replacement.',
      },
    ],
  },
  shipping: {
    title: 'Shipping & Delivery Information',
    seo_description: 'Delivery timelines, shipping charges, and coverage areas across Kathmandu, Pokhara, and all 77 districts in Nepal.',
    blocks: [
      {
        heading: 'Delivery Coverage',
        body: 'Affordable Decoration delivers custom photo canvas prints, wall art, and custom t-shirts across all 77 districts of Nepal, including Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur), Pokhara, Chitwan, Butwal, Biratnagar, and major hub cities.',
      },
      {
        heading: 'Delivery Timelines',
        body: '• Kathmandu Valley Inside Ring Road: 1 – 3 Working Days\n• Kathmandu Valley Suburbs & Outer Areas: 2 – 4 Working Days\n• Major Cities Outside Valley (Pokhara, Chitwan, Butwal, Biratnagar, etc.): 3 – 5 Working Days\n• Remote & Hill Districts: 4 – 7 Working Days',
      },
      {
        heading: 'Packaging Safety Guarantee',
        body: 'Every canvas is wrapped in protective moisture-proof bubble wrap and packaged in sturdy corrugated boxes with corner protectors to guarantee damage-free arrival at your doorstep.',
      },
      {
        heading: 'Order Tracking',
        body: 'You can trace your order status anytime in real-time by entering your Order Reference ID on our Track Order page.',
      },
    ],
  },
  about: {
    title: 'About Affordable Decoration',
    seo_description: 'Learn about Affordable Decoration - Nepal premier brand for high quality custom photo canvas prints, wall art, and personalized decor.',
    blocks: [
      {
        heading: 'Our Mission',
        body: 'Affordable Decoration was founded with a passion to bring beautiful, personalized wall art and custom decorations to homes and offices across Nepal. We believe everyone deserves premium museum-grade photo canvas prints at affordable, transparent prices.',
      },
      {
        heading: 'Craftsmanship & Quality',
        body: 'We utilize 100% genuine heavy-duty cotton canvas, vibrant UV-resistant fade-proof inks, and solid kiln-dried pine wood stretchers. Every panel is hand-crafted and inspected by experienced local artisans in Nepal.',
      },
    ],
  },
};

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('title, seo_title, seo_description')
    .eq('slug', params.slug)
    .single();

  if (page) {
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
    };
  }

  const fallback = DEFAULT_PAGES[params.slug];
  if (fallback) {
    return {
      title: fallback.title,
      description: fallback.seo_description,
    };
  }

  return {};
}

export default async function CmsPage({ params }: CmsPageProps) {
  const supabase = createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  const fallback = DEFAULT_PAGES[params.slug];

  if (!page && !fallback) {
    notFound();
  }

  const title = page?.title || fallback?.title || 'Policy';
  const rawBlocks = page?.content?.blocks as Array<{ heading?: string; body?: string }> | undefined;
  const blocks = rawBlocks && rawBlocks.length > 0 ? rawBlocks : fallback?.blocks || [];

  return (
    <div className="container-page max-w-3xl py-12 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text tracking-tight">{title}</h1>
        <p className="text-xs text-muted mt-2">Affordable Decoration • Customer Policy &amp; Information</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-text/90">
        {blocks.map((block, i) => (
          <section key={i} className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-3">
            {block.heading && (
              <h2 className="font-display text-lg font-bold text-amber-600">{block.heading}</h2>
            )}
            {block.body && <p className="whitespace-pre-line text-muted">{block.body}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
