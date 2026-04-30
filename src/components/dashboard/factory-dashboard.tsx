import Link from "next/link";
import {
  ClipboardList,
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
          value="186 units"
          subtitle="Across 5 filter lines"
          icon={<Factory className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Raw Material Alerts"
          value="3 items"
          subtitle="Needs store attention"
          trend={{ label: "2 urgent", direction: "down" }}
          icon={<Warehouse className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Finished Goods Stock"
          value="1,248 units"
          subtitle="Ready or packed"
          icon={<PackageCheck className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Today’s Consumption"
          value="312.5 kg"
          subtitle="Raw material issued"
          icon={<ClipboardList className="size-4" aria-hidden="true" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <DataTableShell title="Quick Actions" description="Common factory entries">
          <div className="grid gap-3 p-4">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockAlerts.map((alert) => (
                <TableRow key={`${alert.item}-${alert.location}`}>
                  <TableCell className="font-medium">{alert.item}</TableCell>
                  <TableCell>{alert.location}</TableCell>
                  <TableCell>{alert.available}</TableCell>
                  <TableCell>
                    <StatusBadge status={alert.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={`${transaction.time}-${transaction.item}`}>
                <TableCell>{transaction.time}</TableCell>
                <TableCell>{transaction.activity}</TableCell>
                <TableCell className="font-medium">{transaction.item}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
}
