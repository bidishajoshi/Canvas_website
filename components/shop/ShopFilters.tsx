'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/lib/types';

interface ShopFiltersProps {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
}

export function ShopFilters({ categories, activeCategory, activeSort }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <aside className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold">Category</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              href="/shop"
              className={`text-sm ${!activeCategory ? 'font-semibold text-accent-yellow' : 'text-text'}`}
            >
              All
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/shop?category=${category.slug}`}
                className={`text-sm ${
                  activeCategory === category.slug ? 'font-semibold text-accent-yellow' : 'text-text'
                }`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Sort By</h2>
        <select
          value={activeSort ?? 'newest'}
          onChange={(e) => updateSort(e.target.value)}
          className="mt-3 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
