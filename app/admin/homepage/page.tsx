import { requireAdminUser } from '@/lib/adminAuth';
import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default async function AdminPage() {
  await requireAdminUser();
  return <AdminPlaceholder title="Homepage Builder" table="homepage_sections" />;
}
