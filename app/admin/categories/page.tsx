import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { filterDeleted, getCategoriesStore } from '@/lib/adminStore';
import { CategoryManager } from '@/components/admin/CategoryManager';
import type { Category } from '@/lib/types';

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  const rawList = (dbCategories && dbCategories.length > 0)
    ? (dbCategories as Category[])
    : getCategoriesStore();

  const categories = filterDeleted(rawList);

  return <CategoryManager categories={categories} />;
}
