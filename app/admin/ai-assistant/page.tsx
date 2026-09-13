import { requireAdminUser } from '@/lib/adminAuth';
import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default async function AdminPage() {
  await requireAdminUser();
  return <AdminPlaceholder title="AI Assistant Knowledge" table="chat_knowledge" />;
}
