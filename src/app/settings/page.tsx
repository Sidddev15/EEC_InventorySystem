import { Boxes, MapPinned, Tags } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsHubCard } from "@/components/settings/settings-hub-card";
import { requireUser } from "@/lib/auth";
import {
  buildSettingsSections,
  getSettingsOverview,
} from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const overview = await getSettingsOverview();
  const sections = buildSettingsSections(overview);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Master data used by products, variants, inventory, and production. Keep these lists controlled and stable."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Categories"
          value={String(overview.categoriesCount)}
          subtitle="Parent product groupings"
        />
        <KpiCard
          title="Units"
          value={String(overview.unitsCount)}
          subtitle="Variant stock units"
        />
        <KpiCard
          title="Locations"
          value={String(overview.locationsCount)}
          subtitle="Operational and reporting locations"
        />
        <KpiCard
          title="Stock Locations"
          value={String(overview.stockLocationsCount)}
          subtitle="Locations that hold inventory"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SettingsHubCard
          title={sections[0].title}
          description={sections[0].description}
          href={sections[0].href}
          total={sections[0].total}
          active={sections[0].active}
          icon={Tags}
        />
        <SettingsHubCard
          title={sections[1].title}
          description={sections[1].description}
          href={sections[1].href}
          total={sections[1].total}
          active={sections[1].active}
          icon={Boxes}
        />
        <SettingsHubCard
          title={sections[2].title}
          description={sections[2].description}
          href={sections[2].href}
          total={sections[2].total}
          active={sections[2].active}
          icon={MapPinned}
        />
      </section>
    </div>
  );
}
