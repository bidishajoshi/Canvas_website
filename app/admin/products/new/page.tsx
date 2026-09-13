import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct } from '../actions';

export default async function NewProductPage() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Add Product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} categories={categories ?? []} />
      </div>
    </div>
  );
}
