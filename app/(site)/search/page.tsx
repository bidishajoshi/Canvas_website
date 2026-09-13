import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/lib/types';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const supabase = createClient();

  const [{ data: products }, { data: faqs }] = q
    ? await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .ilike('name', `%${q}%`)
          .limit(12),
        supabase
          .from('faqs')
          .select('*')
          .eq('status', 'published')
          .or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
          .limit(5),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="container-page py-10">
      <form className="max-w-lg" action="/search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products, sizes, canvas types…"
          className="w-full rounded-card border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-accent-yellow"
        />
      </form>

      {q && (
        <>
          <h2 className="mt-8 text-sm font-semibold">
            {products?.length ?? 0} results for &ldquo;{q}&rdquo;
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {(products as Product[] | null)?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {faqs && faqs.length > 0 && (
            <div className="mt-10">
              <h2 className="text-sm font-semibold">Related Questions</h2>
              <ul className="mt-3 space-y-3">
                {faqs.map((faq) => (
                  <li key={faq.id} className="rounded-card border border-border p-4 text-sm">
                    <p className="font-medium">{faq.question}</p>
                    <p className="mt-1 text-muted">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
