import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { filterDeleted } from '@/lib/adminStore';
import { addTShirtCategory, deleteTShirtCategory } from './actions';

export default async function AdminTShirtCategoriesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  let dbCategories: any[] | null = null;
  try {
    const res = await supabase
      .from('tshirt_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    dbCategories = res.data;
  } catch {
    dbCategories = null;
  }

  const defaultCategories = [
    { id: 'cat-1', name: 'Logo & Brand T-Shirts', slug: 'logo-brand', description: 'Corporate logos and minimalist brand graphic tees.', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-2', name: 'Couple & Matching T-Shirts', slug: 'couple-matching', description: 'Matching couple quotes, split heart designs, and anniversary prints.', image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-3', name: 'Birthday & Celebration T-Shirts', slug: 'birthday-celebration', description: 'Fun milestone birthday prints and squad tees.', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-4', name: 'Anniversary & Love T-Shirts', slug: 'anniversary-love', description: 'Custom romantic date prints and family portrait apparel.', image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-5', name: 'Typography & Quote T-Shirts', slug: 'typography-quote', description: 'Bold Nepalese typography, aesthetic proverbs, and motivational quotes.', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-6', name: 'Oversized & Streetwear T-Shirts', slug: 'oversized-streetwear', description: 'Heavyweight drop shoulder streetwear aesthetics.', image_url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80' },
  ];

  const categories = filterDeleted(
    dbCategories && dbCategories.length > 0 ? dbCategories : defaultCategories
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">T-Shirt Categories Management</h1>
        <p className="text-xs text-muted mt-1">
          Organize apparel products and customization templates into categories (Logo, Couple, Birthday, Anniversary, Typography, Oversized, Corporate, etc.).
        </p>
      </div>

      {/* Add New Category Form */}
      <form action={addTShirtCategory} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New T-Shirt Category</h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Category Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Couple & Matching T-Shirts"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Cover Image URL</label>
            <input
              type="url"
              name="image_url"
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Description</label>
          <input
            type="text"
            name="description"
            placeholder="Brief description of this apparel category..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 btn-glow"
        >
          + Save Category
        </button>
      </form>

      {/* Category Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {cat.image_url && (
                <div className="relative aspect-[16/9] w-full bg-neutral-900">
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-text text-sm">{cat.name}</h4>
                <p className="text-xs text-muted line-clamp-2">{cat.description || 'Apparel category'}</p>
              </div>
            </div>

            <div className="p-4 pt-0 flex justify-end">
              <form action={deleteTShirtCategory.bind(null, cat.id)}>
                <button type="submit" className="text-xs text-rose-600 font-bold hover:underline">
                  Delete Category
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
