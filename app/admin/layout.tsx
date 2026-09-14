import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await isAdminAuthenticated();

  // If unauthenticated, render children directly (allows /admin/login to display cleanly without loop)
  if (!isAuth) {
    return <div className="min-h-screen bg-bg">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-x-auto">{children}</main>
    </div>
  );
}
