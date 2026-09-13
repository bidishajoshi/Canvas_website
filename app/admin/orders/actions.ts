'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { OrderStatus } from '@/lib/types';

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders');
}
