import { PageHeader } from "@/components/layout/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { requireUser } from "@/lib/auth";
import {
  listInventoryByType,
  normalizeInventoryTab,
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
  const items = await listInventoryByType(activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Browse stock by inventory type, variant, and location."
      />

      <InventoryTabs active={activeTab} />
      <InventoryTable items={items} />
    </div>
  );
}
