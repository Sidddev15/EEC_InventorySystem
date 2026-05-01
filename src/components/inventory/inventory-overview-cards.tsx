import { Layers3, MapPinned, Package2 } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { type InventoryOverview } from "@/modules/inventory/inventory.types";

type InventoryOverviewCardsProps = {
  overview: InventoryOverview;
};

export function InventoryOverviewCards({
  overview,
}: InventoryOverviewCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      <KpiCard
        title="Visible Stock Rows"
        value={overview.activeSummary.itemCount.toString()}
        subtitle={`${overview.activeSummary.label} items currently visible`}
        icon={<Package2 className="size-4" aria-hidden="true" />}
      />
      <KpiCard
        title="Active Variants"
        value={overview.activeSummary.variantCount.toString()}
        subtitle="Distinct variants in the selected inventory tab"
        icon={<Layers3 className="size-4" aria-hidden="true" />}
      />
      <KpiCard
        title="Stock Locations"
        value={overview.activeSummary.locationCount.toString()}
        subtitle="Stock-holding locations with quantity for this tab"
        icon={<MapPinned className="size-4" aria-hidden="true" />}
      />
      <KpiCard
        title="Network Coverage"
        value={overview.totalLocations.toString()}
        subtitle={`${overview.totalItems} stock rows across ${overview.totalVariants} tracked variants`}
        icon={<Package2 className="size-4" aria-hidden="true" />}
      />
    </div>
  );
}
