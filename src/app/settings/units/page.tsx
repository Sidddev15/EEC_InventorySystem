import { UnitsManager } from "@/components/settings/units-manager";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";
import { listUnits } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsUnitsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect(ROLE_HOME_PATH[user.role]);
  }

  const units = await listUnits();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Operational measurement units used by product variants and stock transactions."
      />
      <UnitsManager initialItems={units} />
    </div>
  );
}
