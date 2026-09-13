import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function AboutPage() {
  const supabase = createClient();
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'about')
    .eq('status', 'published')
    .single();

  if (!page) {
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-semibold">About Us</h1>
        <p className="mt-4 text-muted">
          This page hasn&apos;t been set up yet — add content in Admin → Pages → About.
        </p>
      </div>
    );
  }

  const blocks = (page.content?.blocks as Array<{ heading?: string; body?: string }>) ?? [];

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold">{page.title}</h1>
      <div className="mt-6 space-y-8">
        {blocks.map((block, i) => (
          <section key={i}>
            {block.heading && (
              <h2 className="font-display text-xl font-semibold">{block.heading}</h2>
            )}
            {block.body && <p className="mt-2 text-muted">{block.body}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
