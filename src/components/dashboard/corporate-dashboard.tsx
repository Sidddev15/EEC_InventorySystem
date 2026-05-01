import {
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  PackageCheck,
  Scale,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
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

const stockOverview = [
  {
    category: "Paint Booth Filters",
    raw: "428 Sq Meter",
    finished: "312 Sq Meter",
    status: "normal" as const,
  },
  {
    category: "HEPA Filters",
    raw: "186 Sq Meter",
    finished: "42 NOS",
    status: "normal" as const,
  },
  {
    category: "Filter Media",
    raw: "9 Roll",
    finished: "Not applicable",
    status: "reorder" as const,
  },
  {
    category: "Carbon Filters",
    raw: "88 Kg",
    finished: "64 NOS",
    status: "low" as const,
  },
];

const topConsumedMaterials = [
  {
    material: "Synthetic Filter Media Roll",
    consumed: "18 Roll",
    usage: "Paint booth and pre filter lines",
  },
  {
    material: "Glass Fiber Media",
    consumed: "420 Sq Meter",
    usage: "HEPA production",
  },
  {
    material: "Activated Carbon Granules",
    consumed: "260 Kg",
    usage: "Carbon filter assemblies",
  },
];

const productionSummary = [
  {
    line: "Paint Booth Filters",
    produced: "1,240 Sq Meter",
    dispatchReady: "312 Sq Meter",
  },
  {
    line: "Panel and Pre Filters",
    produced: "860 NOS",
    dispatchReady: "420 NOS",
  },
  {
    line: "HEPA Filters",
    produced: "96 NOS",
    dispatchReady: "42 NOS",
  },
];

export function CorporateDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Dashboard"
        description="Stock, production, and consumption visibility without factory entry workflows."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Raw Material"
          value="4,860"
          unit="Units"
          subtitle="Across active stores"
          icon={<Boxes className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Total Finished Goods"
          value="2,418"
          unit="Units"
          subtitle="Ready and packed stock"
          icon={<PackageCheck className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Monthly Production"
          value="3,920"
          unit="Units"
          subtitle="Current month"
          trend={{ label: "8% higher", direction: "up" }}
          icon={<Factory className="size-4" aria-hidden="true" />}
        />
        <KpiCard
          title="Low Stock Count"
          value="2"
          unit="Items"
          subtitle="Corporate action items"
          icon={<Scale className="size-4" aria-hidden="true" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <DataTableShell
          title="Stock Overview"
          description="Category-level inventory position"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Raw Material</TableHead>
                <TableHead>Finished Goods</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockOverview.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>{row.raw}</TableCell>
                  <TableCell>{row.finished}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>

        <DataTableShell title="Low Stock Alerts" description="Decision items">
          <div className="space-y-3 p-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Activated Carbon Granules</p>
                <StatusBadge status="low" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                88 Kg available against 100 Kg minimum.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Synthetic Filter Media Roll</p>
                <StatusBadge status="reorder" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                9 rolls available against 10 roll reorder level.
              </p>
            </div>
          </div>
        </DataTableShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DataTableShell
          title="Top Consumed Materials"
          description="Current month consumption"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Consumed</TableHead>
                <TableHead>Used In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topConsumedMaterials.map((row) => (
                <TableRow key={row.material}>
                  <TableCell className="font-medium">{row.material}</TableCell>
                  <TableCell>{row.consumed}</TableCell>
                  <TableCell>{row.usage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>

        <DataTableShell
          title="Production Summary"
          description="Output and dispatch readiness"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead>Produced</TableHead>
                <TableHead>Dispatch Ready</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionSummary.map((row) => (
                <TableRow key={row.line}>
                  <TableCell className="font-medium">{row.line}</TableCell>
                  <TableCell>{row.produced}</TableCell>
                  <TableCell>{row.dispatchReady}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      </section>

      <DataTableShell
        title="Monthly Production and Consumption Insights"
        description="Compact management indicators"
      >
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">Paint booth demand is steady</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Finished goods cover near-term dispatches.
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">Carbon stock needs review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Raw material is below minimum level.
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <Factory className="size-4 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">HEPA output is constrained</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Glass fiber consumption is trending high.
            </p>
          </div>
        </div>
      </DataTableShell>
    </div>
  );
}
