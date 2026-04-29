import { InventoryType } from "@/generated/prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { ProductionWizard } from "@/components/production/production-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { listInventoryItemOptions } from "@/modules/inventory/inventory.service";

export default async function NewProductionPage() {
  await requireUser();
  const [rawItems, semiFinishedItems, finishedItems] = await Promise.all([
    listInventoryItemOptions({ inventoryType: InventoryType.RAW_MATERIAL }),
    listInventoryItemOptions({ inventoryType: InventoryType.SEMI_FINISHED }),
    listInventoryItemOptions({ inventoryType: InventoryType.FINISHED_GOODS }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Production"
        description="Preview raw material consumption and finished stock output before production is posted."
      />

      <Card>
        <CardHeader>
          <CardTitle>Production Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionWizard
            consumptionItems={rawItems}
            outputItems={[...semiFinishedItems, ...finishedItems]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
