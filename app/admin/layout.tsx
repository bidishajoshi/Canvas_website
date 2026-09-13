import { requireAdminUser } from '@/lib/adminAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
