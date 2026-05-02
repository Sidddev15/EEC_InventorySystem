import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UsersManager } from "@/components/settings/users-manager";
import { requireUser } from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";
import { listManagedUsers } from "@/modules/auth/auth.service";

export default async function SettingsUsersPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect(ROLE_HOME_PATH[user.role]);
  }

  const users = await listManagedUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Create employee login accounts with factory, corporate, or admin access. Use real email IDs and controlled passwords."
      />
      <UsersManager currentUserId={user.id} initialItems={users} />
    </div>
  );
}
