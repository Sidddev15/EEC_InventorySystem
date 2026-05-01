import { PageHeader } from "@/components/layout/page-header";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { listSettingsLocations } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsLocationsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const locations = await listSettingsLocations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Operational stock locations and reporting-only locations used by inventory and production."
      />

      <DataTableShell
        title="Location Master"
        description="Stock-holding locations create inventory rows for every active variant. Reporting-only locations should not hold stock."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Inventory Rows</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.description || "Not set"}</TableCell>
                <TableCell>
                  <StatusBadge status={location.isStockHolding ? "normal" : "info"}>
                    {location.isStockHolding ? "Stock Holding" : "Reporting Only"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {location.inventoryItemsCount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={location.isActive ? "normal" : "info"}>
                    {location.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
}
