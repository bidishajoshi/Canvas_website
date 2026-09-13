import { notFound } from 'next/navigation';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/admin/ProductForm';
import { updateProduct } from '../actions';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit Product</h1>
      <div className="mt-6">
        <ProductForm action={updateWithId} categories={categories ?? []} product={product} />
      </div>
    </div>
  );
}
