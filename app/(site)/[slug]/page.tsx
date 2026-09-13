import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface CmsPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('title, seo_title, seo_description')
    .eq('slug', params.slug)
    .single();

  if (!page) return {};
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? undefined,
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const supabase = createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!page) notFound();

  const blocks = (page.content?.blocks as Array<{ heading?: string; body?: string }>) ?? [];

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold">{page.title}</h1>
      <div className="mt-6 space-y-6">
        {blocks.map((block, i) => (
          <section key={i}>
            {block.heading && (
              <h2 className="font-display text-lg font-semibold">{block.heading}</h2>
            )}
            {block.body && <p className="mt-2 whitespace-pre-line text-muted">{block.body}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
