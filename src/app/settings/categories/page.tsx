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
import { listSettingsCategories } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsCategoriesPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await listSettingsCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Product category master used by parent products and reporting."
      />

      <DataTableShell
        title="Category Master"
        description="Keep category names stable. Product grouping should not drift after operational use starts."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description || "Not set"}</TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {category.productsCount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={category.isActive ? "normal" : "info"}>
                    {category.isActive ? "Active" : "Inactive"}
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
