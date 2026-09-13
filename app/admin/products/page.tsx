import Link from 'next/link';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { deleteProduct } from './actions';

export default async function AdminProductsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-card bg-accent-yellow px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{formatPaisa(product.base_price_paisa)}</td>
                <td className="p-3">{product.stock ?? '—'}</td>
                <td className="p-3 capitalize">{product.status}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="mr-3 text-accent-yellow underline"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      'use server';
                      await deleteProduct(product.id);
                    }}
                    className="inline"
                  >
                    <button type="submit" className="text-red-600 underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
