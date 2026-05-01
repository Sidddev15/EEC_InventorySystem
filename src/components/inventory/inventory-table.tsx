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
      {items.length > 0 ? (
        <>
          <div className="space-y-3 p-4 md:hidden">
            {items.map((item) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.itemName}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {item.category}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Variant
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{item.variant}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Stock
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.currentStock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Location
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.location}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Reorder Level
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{item.reorderLevel}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <ReorderInsightButton inventoryItemId={item.id} />
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                      href={`/inventory/inward?item=${item.id}`}
                    >
                      Add Stock
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
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
                {items.map((item) => (
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
                      <div className="space-y-1">
                        <p className="font-semibold tabular-nums text-foreground">
                          {item.currentStock}
                        </p>
                        {item.status === "low" ? (
                          <p className="text-xs font-medium text-red-700">
                            Below minimum stock
                          </p>
                        ) : item.status === "reorder" ? (
                          <p className="text-xs font-medium text-amber-700">
                            At reorder threshold
                          </p>
                        ) : (
                          <p className="text-xs text-emerald-700">Within stock target</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{item.location}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-foreground">{item.reorderLevel}</p>
                        {item.reorderLevel === "Not set" ? (
                          <p className="text-xs font-medium text-amber-700">
                            Set a reorder level
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState
          title="No inventory items found"
          description="Create variants and record inward stock to start tracking location-wise quantity."
        />
      )}
    </DataTableShell>
  );
}
