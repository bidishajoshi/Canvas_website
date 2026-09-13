import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';
import { removeWishlistItem } from './actions';

export default async function WishlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/account/wishlist');

  const { data: items } = await supabase
    .from('wishlist_items')
    .select('id, products(id, name, slug, main_image_url, base_price_paisa)')
    .eq('customer_id', user.id);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold">Wishlist</h1>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {(items ?? []).map((item: any) => {
          const product = item.products;
          if (!product) return null;
          return (
            <div key={item.id} className="rounded-card border border-border p-3">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden rounded-card bg-surface">
                  {product.main_image_url && (
                    <Image
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">{product.name}</p>
                <p className="text-sm text-muted">{formatPaisa(product.base_price_paisa)}</p>
              </Link>
              <form action={removeWishlistItem.bind(null, item.id)} className="mt-2">
                <button type="submit" className="text-xs text-red-600 underline">
                  Remove
                </button>
              </form>
            </div>
          );
        })}
        {(!items || items.length === 0) && (
          <p className="text-sm text-muted">Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
}
