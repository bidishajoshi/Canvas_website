'use client';

import { useEffect, useState } from 'react';

export function WishlistBadge() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = localStorage.getItem('ad-wishlist');
        const list = raw ? JSON.parse(raw) : [];
        setCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setCount(0);
      }
    };

    updateCount();
    window.addEventListener('wishlist-updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('wishlist-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-pink-600 text-[9px] font-extrabold text-white shadow-md">
      {count > 99 ? '99+' : count}
    </span>
  );
}
