import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';
import { FaqAccordion } from '@/components/shop/FaqAccordion';

export async function FaqSection({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}
      <div className="mt-8 max-w-2xl">
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
