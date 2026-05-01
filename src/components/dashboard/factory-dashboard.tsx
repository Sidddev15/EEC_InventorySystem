import Link from "next/link";
import {
  ArrowRight,
  Factory,
  PackagePlus,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const actionCards = [
  {
    title: "Add Raw Material",
    description: "Record inward stock to the correct store location.",
    href: "/inventory/inward",
    icon: PackagePlus,
    iconClassName: "bg-green-100 text-green-700",
  },
  {
    title: "Log Production",
    description: "Post consumed material and finished output together.",
    href: "/production/new",
    icon: Factory,
    iconClassName: "bg-blue-100 text-blue-700",
  },
  {
    title: "Dispatch Goods",
    description: "Review movement history before dispatch posting.",
    href: "/transactions",
    icon: Truck,
    iconClassName: "bg-amber-100 text-amber-700",
  },
] as const;

const rawMaterialAlerts = [
  {
    item: "Synthetic Filter Media Roll",
    location: "Factory Store",
    available: "4 Roll",
    priority: "low",
    label: "Urgent",
  },
  {
    item: "Glass Fiber Media",
    location: "Factory Store",
    available: "126 Sq Meter",
    priority: "reorder",
    label: "Reorder soon",
  },
  {
    item: "Pocket Filter F7 Bag",
    location: "Production Floor",
    available: "12 NOS",
    priority: "reorder",
    label: "Reorder soon",
  },
] as const;

const todaysProduction = [
  {
    time: "09:30",
    variant: "Floor Filter 50mm",
    quantity: "42 Sq Meter",
    line: "Line 1",
  },
  {
    time: "11:10",
    variant: "EEC 560 Ceiling Filter",
    quantity: "28 NOS",
    line: "Line 2",
  },
  {
    time: "14:45",
    variant: "Pocket Filter F7",
    quantity: "18 NOS",
    line: "Line 3",
  },
] as const;

const recentActivity = [
  {
    time: "15:20",
    activity: "Raw material inward",
    reference: "INW-20260501-04",
  },
  {
    time: "14:45",
    activity: "Production posted",
    reference: "PROD-20260501-03",
  },
  {
    time: "13:05",
    activity: "Stock check completed",
    reference: "Factory Store",
  },
] as const;

export function FactoryDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Dashboard"
        description="Action-first view for raw material receipt, production posting, and stock attention."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actionCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
              href={card.href}
              key={card.title}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl",
                    card.iconClassName
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900">
                    {card.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Raw Material Alerts</CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  Focus on items that can block production today.
                </p>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                href="/inventory?type=RAW_MATERIAL"
              >
                View all inventory
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {rawMaterialAlerts.map((alert) => (
              <div
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-3 last:pb-3"
                key={`${alert.item}-${alert.location}`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-2 size-2.5 shrink-0 rounded-full",
                      alert.priority === "low" ? "bg-red-500" : "bg-amber-500"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {alert.item}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{alert.location}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs font-medium",
                        alert.priority === "low" ? "text-red-700" : "text-amber-700"
                      )}
                    >
                      {alert.label}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-slate-900">{alert.available}</p>
                  <p className="text-xs text-slate-500">Available</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Recent Floor Activity</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Latest operational events posted from store and production.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {recentActivity.map((row) => (
              <div
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                key={`${row.time}-${row.reference}`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.activity}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.reference}</p>
                </div>
                <p className="text-sm font-medium text-slate-600">{row.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Today&apos;s Production</CardTitle>
              <p className="mt-1 text-sm text-slate-600">
                Compact view of finished output posted during the current shift.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">88</p>
              <p className="text-xs font-medium text-slate-500">Total output units</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Line</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysProduction.map((row) => (
                <TableRow key={`${row.time}-${row.variant}`}>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{row.variant}</p>
                      <p className="text-xs text-slate-500">{row.line}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{row.line}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-slate-900">
                    {row.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
