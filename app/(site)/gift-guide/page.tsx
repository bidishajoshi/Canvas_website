import type { Metadata } from 'next';
import { getSettings } from '@/lib/content';
import { GiftGuideClient } from './GiftGuideClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Personalized Gift Guide | ${settings.business_name}`,
    description: `Find the perfect personalized photo gifts for Weddings, Anniversaries, Birthdays, Housewarming (Griha Pravesh), and Festivals in Nepal.`,
  };
}

export default async function GiftGuidePage() {
  const settings = await getSettings();
  return <GiftGuideClient settings={settings} />;
}
