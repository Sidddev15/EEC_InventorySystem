import Link from "next/link";
import {
  Factory,
  PackageCheck,
  PackagePlus,
  Truck,
  Warehouse,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { ActionButton } from "@/components/ui/action-button";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const lowStockAlerts = [
  {
    item: "Synthetic Filter Media Roll",
    location: "Factory Store",
    available: "4 Roll",
    status: "low" as const,
  },
  {
    item: "Glass Fiber Media",
    location: "Factory Store",
    available: "126 Sq Meter",
    status: "reorder" as const,
  },
  {
    item: "Pocket Filter F7",
    location: "Finished Goods Store",
    available: "28 NOS",
    status: "reorder" as const,
  },
];

const recentTransactions = [
  {
    time: "09:15",
    activity: "Raw material inward",
    item: "Activated Carbon Granules",
    quantity: "+80 Kg",
  },
  {
    time: "11:30",
    activity: "Production logged",
    item: "Floor Filter 50mm",
    quantity: "+18 Sq Meter",
  },
  {
    time: "14:05",
    activity: "Dispatch staged",
    item: "Panel Pre Filter G4",
    quantity: "-24 NOS",
  },
];

export function FactoryDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Dashboard"
        description="Today’s stock actions, production, and material alerts."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Today’s Production"
          value="186"
          unit="Sq M"
          subtitle="Across 5 filter lines"
          icon={<Factory className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Raw Material"
          value="428"
          unit="Units"
          subtitle="Available across active stores"
          icon={<Warehouse className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Finished Goods Stock"
          value="1,248"
          unit="Units"
          subtitle="Ready or packed"
          icon={<PackageCheck className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Low Stock Count"
          value="3"
          unit="Items"
          subtitle="Needs immediate review"
          trend={{ label: "2 urgent", direction: "down" }}
          icon={<PackagePlus className="size-4" aria-hidden="true" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <DataTableShell title="Quick Actions" description="Common factory entries">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <ActionButton
              icon={PackagePlus}
              label="Add raw material"
              description="Record store inward"
              href="/inventory/inward"
            />
            <ActionButton
              icon={Factory}
              label="Log production"
              description="Consume input and add output"
              href="/production/new"
            />
            <ActionButton
              icon={Truck}
              label="Dispatch goods"
              description="Move finished stock out"
              href="/transactions"
              variant="outline"
            />
            <ActionButton
              icon={Warehouse}
              label="View stock"
              description="Check variant stock by location"
              href="/inventory"
              variant="outline"
            />
          </div>
        </DataTableShell>

        <DataTableShell
          title="Low Stock Alerts"
          description="Variant-level stock requiring action"
          actions={
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              href="/inventory"
            >
              View stock
            </Link>
          }
        >
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <p className="text-sm font-semibold text-red-800">Low stock</p>
              <div className="mt-3 space-y-3">
                {lowStockAlerts
                  .filter((alert) => alert.status === "low")
                  .map((alert) => (
                    <div
                      className="rounded-lg border border-red-200 bg-card p-3"
                      key={`${alert.item}-${alert.location}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.item}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {alert.location}
                          </p>
                        </div>
                        <StatusBadge status="low" />
                      </div>
                      <p className="mt-2 text-sm text-red-800">{alert.available} available</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-semibold text-amber-800">Reorder soon</p>
              <div className="mt-3 space-y-3">
                {lowStockAlerts
                  .filter((alert) => alert.status === "reorder")
                  .map((alert) => (
                    <div
                      className="rounded-lg border border-amber-200 bg-card p-3"
                      key={`${alert.item}-${alert.location}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.item}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {alert.location}
                          </p>
                        </div>
                        <StatusBadge status="reorder" />
                      </div>
                      <p className="mt-2 text-sm text-amber-800">{alert.available} available</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DataTableShell>
      </section>

      <DataTableShell title="Recent Transactions" description="Latest factory stock activity">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={`${transaction.time}-${transaction.item}`}>
                <TableCell>{transaction.time}</TableCell>
                <TableCell>{transaction.activity}</TableCell>
                <TableCell className="font-medium">{transaction.item}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={
                      transaction.quantity.startsWith("-") ? "reorder" : "normal"
                    }
                  >
                    {transaction.quantity.startsWith("-") ? "Issued" : "Posted"}
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
