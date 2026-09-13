import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCategory, deleteCategory } from './actions';

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Categories</h1>

      <ul className="mt-6 space-y-2">
        {(categories ?? []).map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between rounded-card border border-border p-3 text-sm"
          >
            <span>{category.name}</span>
            <form action={deleteCategory.bind(null, category.id)}>
              <button className="text-red-600 underline">Delete</button>
            </form>
          </li>
        ))}
        {(!categories || categories.length === 0) && (
          <li className="text-sm text-muted">No categories yet.</li>
        )}
      </ul>

      <form action={createCategory} className="mt-6 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs text-muted">Name</label>
          <input
            name="name"
            required
            className="mt-1 block rounded-card border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Description</label>
          <input
            name="description"
            className="mt-1 block rounded-card border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-card bg-accent-yellow px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
        >
          Add Category
        </button>
      </form>
    </div>
  );
}
