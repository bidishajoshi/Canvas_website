import { requireAdminUser } from '@/lib/adminAuth';
import AdminSettingsPage from '../settings/page';

export default async function AdminSocialPage() {
  await requireAdminUser();
  return <AdminSettingsPage />;
}
