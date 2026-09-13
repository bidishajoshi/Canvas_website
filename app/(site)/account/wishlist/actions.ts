'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function removeWishlistItem(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS should restrict this to the caller's own rows; the explicit
  // customer_id filter here is defense in depth.
  await supabase.from('wishlist_items').delete().eq('id', id).eq('customer_id', user.id);
  revalidatePath('/account/wishlist');
}
