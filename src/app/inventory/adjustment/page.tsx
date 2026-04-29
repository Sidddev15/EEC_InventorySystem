import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AdjustmentForm } from "@/components/inventory/adjustment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { listInventoryItemOptions } from "@/modules/inventory/inventory.service";

export default async function AdjustmentPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/inventory");
  }

  const items = await listInventoryItemOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustment"
        description="Controlled stock correction with reason, transaction, ledger, and audit trail."
      />

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AdjustmentForm items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
