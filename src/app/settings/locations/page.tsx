import { LocationsManager } from "@/components/settings/locations-manager";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";
import { listLocations } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsLocationsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect(ROLE_HOME_PATH[user.role]);
  }

  const locations = await listLocations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Operational stock locations and reporting-only locations used by inventory and production."
      />
      <LocationsManager initialItems={locations} />
    </div>
  );
}
