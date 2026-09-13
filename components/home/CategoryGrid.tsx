import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, Category } from '@/lib/types';

export async function CategoryGrid({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(8);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}
      {section.subtitle && <p className="mt-2 text-muted">{section.subtitle}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(categories as Category[]).map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-card bg-surface"
          >
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm font-medium text-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
