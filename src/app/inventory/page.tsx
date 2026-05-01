import { PageHeader } from "@/components/layout/page-header";
import { InventoryOverviewCards } from "@/components/inventory/inventory-overview-cards";
import { InventoryStatusSummary } from "@/components/inventory/inventory-status-summary";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { requireUser } from "@/lib/auth";
import {
  getInventoryOverview,
  listInventoryByType,
  normalizeInventoryTab,
  summarizeInventoryStatuses,
} from "@/modules/inventory/inventory.service";

type InventoryPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  await requireUser();
  const params = await searchParams;
  const activeTab = normalizeInventoryTab(params.type);
  const [items, overview] = await Promise.all([
    listInventoryByType(activeTab),
    getInventoryOverview(activeTab),
  ]);
  const statusCounts = summarizeInventoryStatuses(items);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Browse stock by inventory type, variant, and location."
      />

      <InventoryOverviewCards overview={overview} />
      <InventoryTabs active={activeTab} summaries={overview.summaries} />
      <InventoryStatusSummary counts={statusCounts} />
      <InventoryTable items={items} />
    </div>
  );
}
