import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/content';
import { BulkOrderClient } from './BulkOrderClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Corporate & Wholesale Bulk Orders | ${settings.business_name}`,
    description: `Special volume discounts on custom canvas wall art, office decor, hotel interior art, and customized company t-shirts in Nepal.`,
  };
}

export default async function BulkOrdersPage() {
  const settings = await getSettings();
  return <BulkOrderClient settings={settings} />;
}
