import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, themeInitScript } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { getSettings } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affordabledecoration.com';
  const logoUrl = settings.logo_url || `${siteUrl}/images/logo.png`;
  const description = settings.short_description || settings.tagline || 'Custom photo canvas prints, wall art, and personalized t-shirts delivered across Nepal.';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.business_name} | Custom Canvas & Wall Decor Nepal`,
      template: `%s | ${settings.business_name}`,
    },
    description,
    keywords: [
      'affordable decoration Nepal',
      'home decoration Nepal',
      'wall decor Nepal',
      'customized canvas Nepal',
      'personalized gifts Nepal',
      'custom t-shirt Nepal',
      'photo canvas Nepal',
      'customized gifts Kathmandu',
    ],
    icons: settings.favicon_url ? [{ url: settings.favicon_url }] : [{ url: '/images/logo.png' }],
    openGraph: {
      type: 'website',
      locale: 'en_NP',
      url: siteUrl,
      siteName: settings.business_name,
      title: settings.business_name,
      description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: settings.business_name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.business_name,
      description,
      images: [logoUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affordabledecoration.com';
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.business_name,
    url: siteUrl,
    logo: settings.logo_url || `${siteUrl}/images/logo.png`,
    description: settings.short_description,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressCountry: 'NP',
        }
      : undefined,
    contactPoint: settings.phone
      ? {
          '@type': 'ContactPoint',
          telephone: settings.phone,
          contactType: 'customer service',
        }
      : undefined,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.business_name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden w-full max-w-full">
      <head>
        {/* Theme init script prevents dark/light theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="overflow-x-hidden w-full max-w-full min-h-screen">
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[60vh] overflow-x-hidden w-full max-w-full">{children}</main>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}

