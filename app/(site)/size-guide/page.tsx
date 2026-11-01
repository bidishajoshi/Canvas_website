import type { Metadata } from 'next';
import { getSettings } from '@/lib/content';
import { SizeGuideClient } from './SizeGuideClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Canvas & T-Shirt Size Guide — Dimensions & Hanging Rules | ${settings.business_name}`,
    description: `Complete sizing chart and hanging recommendations for 1 to 7 panel custom photo canvases, framing depths, and customized t-shirt measurements in Nepal.`,
  };
}

export default async function SizeGuidePage() {
  const settings = await getSettings();
  return <SizeGuideClient settings={settings} />;
}
