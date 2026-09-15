// Google Analytics & Ecommerce Event Tracking Helper

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackProductView(product: { id: string; name: string; category?: string; pricePaisa: number }) {
  trackEvent('view_item', {
    currency: 'NPR',
    value: product.pricePaisa / 100,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.pricePaisa / 100,
      },
    ],
  });
}

export function trackAddToCart(item: { id: string; name: string; quantity: number; unitPricePaisa: number }) {
  trackEvent('add_to_cart', {
    currency: 'NPR',
    value: (item.unitPricePaisa * item.quantity) / 100,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.unitPricePaisa / 100,
      },
    ],
  });
}

export function trackRemoveFromCart(itemId: string, name: string) {
  trackEvent('remove_from_cart', {
    items: [{ item_id: itemId, item_name: name }],
  });
}

export function trackBeginCheckout(items: Array<{ name: string; quantity: number; unitPricePaisa: number }>, totalPaisa: number) {
  trackEvent('begin_checkout', {
    currency: 'NPR',
    value: totalPaisa / 100,
    items: items.map((i) => ({
      item_name: i.name,
      quantity: i.quantity,
      price: i.unitPricePaisa / 100,
    })),
  });
}

export function trackPromoApplied(code: string, discountPaisa: number) {
  trackEvent('apply_promo_code', {
    coupon_code: code,
    discount_value: discountPaisa / 100,
  });
}

export function trackPurchase(orderId: string, totalPaisa: number, itemCount: number) {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'NPR',
    value: totalPaisa / 100,
    item_count: itemCount,
  });
}

export function trackCustomProductCreated(productType: 'custom_canvas' | 'custom_tshirt') {
  trackEvent('customize_product', {
    product_type: productType,
  });
}
