import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, themeInitScript } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { getSettings } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.business_name,
      template: `%s | ${settings.business_name}`,
    },
    description: settings.short_description ?? settings.tagline ?? undefined,
    icons: settings.favicon_url ? [{ url: settings.favicon_url }] : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before hydration so the correct theme applies with no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
