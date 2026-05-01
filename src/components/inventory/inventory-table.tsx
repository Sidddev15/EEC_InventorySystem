import Link from "next/link";
import { ReorderInsightButton } from "@/components/ai/reorder-insight-button";
import { buttonVariants } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type InventoryListItem } from "@/modules/inventory/inventory.types";

type InventoryTableProps = {
  items: InventoryListItem[];
};

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <DataTableShell
      title="Inventory Stock"
      description="Stock is shown by variant and location. All changes must go through transactions."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-36 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.variant}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {item.currentStock}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-muted-foreground">{item.location}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <ReorderInsightButton inventoryItemId={item.id} />
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      href={`/inventory/inward?item=${item.id}`}
                    >
                      Add Stock
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="p-0"
                colSpan={9}
              >
                <EmptyState
                  title="No inventory items found"
                  description="Create variants and record inward stock to start tracking location-wise quantity."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
