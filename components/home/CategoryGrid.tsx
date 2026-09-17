import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, Category } from '@/lib/types';
import { filterDeleted, getCategoriesStore } from '@/lib/adminStore';

export async function CategoryGrid({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(8);

  const rawList = data && data.length > 0 ? (data as Category[]) : getCategoriesStore();
  const categories = filterDeleted(rawList);

  return (
    <section className="container-page py-14">
      <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text">
        {section.title || 'Shop by Category'}
      </h2>
      <p className="mt-2 text-muted text-sm sm:text-base">
        {section.subtitle ||
          'Explore our high resolution canvas prints, multi-panels, custom portraits, and customized t-shirts.'}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:border-amber-600 hover:shadow-md"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-500/20">
                🖼️
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 flex items-end">
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
