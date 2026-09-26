import Link from 'next/link';
import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { deleteProduct } from './actions';
import { filterDeleted, getProductsStore, getCategoriesStore } from '@/lib/adminStore';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Product, Category } from '@/lib/types';

export default async function AdminProductsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: dbProducts }, { data: dbCategories }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);

  const rawProducts = dbProducts && dbProducts.length > 0 ? (dbProducts as Product[]) : getProductsStore();
  const rawCategories = dbCategories && dbCategories.length > 0 ? (dbCategories as Category[]) : getCategoriesStore();

  const products = filterDeleted(rawProducts);
  const categories = filterDeleted(rawCategories);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products & Photos</h1>
          <p className="text-sm text-muted">Manage store catalog, product photos, prices, and status.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-md transition-all"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg border-b border-border text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-4">Photo</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-bg/50 transition-colors">
                <td className="p-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-900 border border-border shrink-0">
                    {product.main_image_url ? (
                      <Image
                        src={product.main_image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        📷
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-semibold text-text">
                  <div>{product.name}</div>
                  <div className="text-xs font-mono font-normal text-muted">{product.sku || product.slug}</div>
                </td>
                <td className="p-4">
                  <span className="inline-block rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                    {categoryMap.get(product.category_id || '') || 'Unassigned'}
                  </span>
                </td>
                <td className="p-4 font-bold text-amber-600">
                  {formatPaisa(product.base_price_paisa)}
                  {product.discount_price_paisa && (
                    <span className="block text-xs font-normal text-muted line-through">
                      {formatPaisa(product.discount_price_paisa)}
                    </span>
                  )}
                </td>
                <td className="p-4">{product.stock ?? '—'}</td>
                <td className="p-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      product.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-neutral-500/10 text-neutral-500'
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
                    >
                      ✏️ Edit Photo &amp; Product
                    </Link>
                    <DeleteButton action={deleteProduct.bind(null, product.id)} itemName={product.name} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted">
                  No products found in catalog. Click &apos;+ Add Product&apos; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
