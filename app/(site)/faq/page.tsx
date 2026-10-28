import type { Metadata } from 'next';
import { FaqPageClient } from './FaqPageClient';
import { getSettings } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Frequently Asked Questions (FAQ) | ${settings.business_name}`,
    description: `Find answers to common questions about custom canvas printing, panel sizes, photo resolution, delivery across Nepal, payments, and custom t-shirts.`,
  };
}

export default async function FaqPage() {
  const settings = await getSettings();
  return <FaqPageClient settings={settings} />;
}
