import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Wishlist | Affordable Decoration',
  description: 'Your saved favorite canvas prints and customized t-shirts.',
};

export default function WishlistPage() {
  return (
    <div className="container-page py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
            My Wishlist
          </h1>
          <p className="text-xs text-muted mt-1">Saved items you love for your home wall decor.</p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          Explore Shop →
        </Link>
      </div>

      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface space-y-4 max-w-lg mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 text-3xl mx-auto">
          ❤️
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-text">Your Wishlist is Empty</h2>
          <p className="text-xs text-muted">
            Explore our custom canvases, wall paintings, and t-shirts to add items to your wishlist.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/custom-canvas"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Custom Canvas Builder
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl border border-border bg-bg hover:bg-surface text-text font-bold text-xs shadow-sm transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
