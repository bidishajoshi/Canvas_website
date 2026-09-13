import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import { formatPaisa } from '@/lib/utils';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductActions } from '@/components/shop/ProductActions';
import type { Product, ProductImage } from '@/lib/types';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, seo_title, seo_description, short_description')
    .eq('slug', params.slug)
    .single();

  if (!product) return {};

  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!product) notFound();

  const [{ data: images }, { data: reviews }, { data: related }, settings] = await Promise.all([
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('status', 'published'),
    supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('status', 'published')
      .limit(4),
    getSettings(),
  ]);

  const typedProduct = product as Product;
  const hasDiscount =
    typedProduct.discount_price_paisa != null &&
    typedProduct.discount_price_paisa < typedProduct.base_price_paisa;

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-card bg-surface">
            {typedProduct.main_image_url && (
              <Image
                src={typedProduct.main_image_url}
                alt={typedProduct.name}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          {images && images.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(images as ProductImage[]).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-card bg-surface"
                >
                  <Image src={img.image_url} alt={img.alt_text ?? typedProduct.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold">{typedProduct.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">
              {formatPaisa(hasDiscount ? typedProduct.discount_price_paisa! : typedProduct.base_price_paisa)}
            </span>
            {hasDiscount && (
              <span className="text-muted line-through">
                {formatPaisa(typedProduct.base_price_paisa)}
              </span>
            )}
          </div>

          {typedProduct.short_description && (
            <p className="mt-4 text-muted">{typedProduct.short_description}</p>
          )}

          <ProductActions
            product={typedProduct}
            whatsappNumber={settings.whatsapp_number}
          />

          {typedProduct.description && (
            <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
              <h2 className="font-semibold">Description</h2>
              <p className="text-muted">{typedProduct.description}</p>
              {typedProduct.material && <p className="text-muted">Material: {typedProduct.material}</p>}
              {typedProduct.dimensions && (
                <p className="text-muted">Dimensions: {typedProduct.dimensions}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold">Customer Reviews</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-card border border-border p-4">
                <div className="text-sm font-medium">{review.customer_name}</div>
                <div className="mt-1 text-xs text-accent-yellow">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold">You May Also Like</h2>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {(related as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
