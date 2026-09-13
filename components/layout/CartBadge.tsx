'use client';

import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

export function CartBadge() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = getCart();
      const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
      setCount(totalQuantity);
    };

    updateCount();

    window.addEventListener('cart-updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('cart-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-extrabold text-white shadow-md animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
}
