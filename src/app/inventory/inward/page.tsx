import { InventoryType } from "@/generated/prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { InwardForm } from "@/components/inventory/inward-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { listInventoryItemOptions } from "@/modules/inventory/inventory.service";

export default async function InwardPage() {
  await requireUser();
  const items = await listInventoryItemOptions({
    inventoryType: InventoryType.RAW_MATERIAL,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Raw Material"
        description="Create inward transaction, update inventory, write ledger, and audit the stock movement."
      />

      <Card>
        <CardHeader>
          <CardTitle>Raw Material Inward</CardTitle>
        </CardHeader>
        <CardContent>
          <InwardForm items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
