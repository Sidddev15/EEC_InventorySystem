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
import { listSettingsUnits } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsUnitsPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const units = await listSettingsUnits();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Operational measurement units used by product variants and stock transactions."
      />

      <DataTableShell
        title="Unit Master"
        description="Variant unit choice affects inward, production, and reporting. Keep unit definitions clean."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.code}</TableCell>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.description || "Not set"}</TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {unit.variantsCount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={unit.isActive ? "normal" : "info"}>
                    {unit.isActive ? "Active" : "Inactive"}
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
