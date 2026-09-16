import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';
import { removeWishlistItem } from './actions';

export default async function WishlistPage() {
  const supabase = createClient();
  let user: { id: string; email: string } | null = null;

  try {
    const {
      data: { user: sbUser },
    } = await supabase.auth.getUser();
    if (sbUser && sbUser.email) {
      user = { id: sbUser.id, email: sbUser.email };
    }
  } catch {}

  if (!user) {
    const cookieStore = cookies();
    const demoEmail = cookieStore.get('ad_demo_user')?.value;
    if (demoEmail) {
      user = { id: 'demo-user', email: decodeURIComponent(demoEmail) };
    }
  }

  if (!user) redirect('/login?redirect=/account/wishlist');

  let items: any[] | null = null;
  try {
    const res = await supabase
      .from('wishlist_items')
      .select('id, products(id, name, slug, main_image_url, base_price_paisa)')
      .eq('customer_id', user.id);
    items = res.data;
  } catch {}

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
            My Wishlist ❤️
          </h1>
          <p className="text-xs text-muted mt-1">Saved items you love for your home wall decor.</p>
        </div>
        <Link href="/shop" className="text-xs font-bold text-amber-600 hover:text-amber-700">
          Explore Shop →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {(items ?? []).map((item: any) => {
          const product = item.products;
          if (!product) return null;
          return (
            <div key={item.id} className="rounded-2xl border border-border p-3 bg-surface shadow-sm">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
                  {product.main_image_url && (
                    <Image
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-bold text-text truncate">{product.name}</p>
                <p className="text-xs font-bold text-amber-600 mt-0.5">{formatPaisa(product.base_price_paisa)}</p>
              </Link>
              <form action={removeWishlistItem.bind(null, item.id)} className="mt-2">
                <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>
          );
        })}
        {(!items || items.length === 0) && (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border bg-surface/50 space-y-3">
            <div className="text-4xl">❤️</div>
            <p className="text-sm text-muted font-medium">Your wishlist is currently empty.</p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
