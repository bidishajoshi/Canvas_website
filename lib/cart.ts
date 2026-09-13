export interface CartItem {
  id: string; // local line-item id (uuid)
  type: 'product' | 'custom_canvas' | 'custom_tshirt';
  name: string;
  imageUrl?: string;
  sizeLabel?: string;
  frameLabel?: string;
  finishLabel?: string;
  colorLabel?: string;
  printLocationLabel?: string;
  designLabel?: string;
  quantity: number;
  unitPricePaisa: number;
  productId?: string;
  canvasConfigurationId?: string;
  tshirtConfigurationId?: string;
}

const CART_KEY = 'affordable-decoration-cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: Omit<CartItem, 'id'>) {
  const items = getCart();
  items.push({ ...item, id: crypto.randomUUID() });
  saveCart(items);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((item) => item.id !== id));
}

export function updateCartQuantity(id: string, quantity: number) {
  saveCart(
    getCart().map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
  );
}

export function clearCart() {
  saveCart([]);
}

export function cartSubtotalPaisa(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPricePaisa * item.quantity, 0);
}
