import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const reports = [
  {
    title: "Current Stock",
    description: "All variant stock by location.",
    href: "/api/reports/current-stock",
    includes: ["Category", "Product", "Variant", "Quantity", "Unit", "Location"],
  },
  {
    title: "Low Stock",
    description: "Items at or below reorder/minimum levels.",
    href: "/api/reports/low-stock",
    includes: ["Category", "Variant", "Quantity", "Min Stock", "Reorder Level"],
  },
  {
    title: "Transaction History",
    description: "Full inventory movement log.",
    href: "/api/reports/transactions",
    includes: ["Date & Time", "Type", "Product", "Variant", "Reference", "User"],
  },
  {
    title: "Production History",
    description: "Production outputs with references.",
    href: "/api/reports/production-history",
    includes: ["Date", "Production No", "Product", "Output Variant", "Quantity"],
  },
  {
    title: "Consumption Summary",
    description: "Grouped material consumption from production.",
    href: "/api/reports/consumption-summary",
    includes: ["Category", "Product", "Material Variant", "Consumed Quantity", "Unit"],
  },
];

export default async function ReportsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="CSV exports for stock, transactions, production, and consumption."
      />

      <section className="rounded-xl border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">Export notes</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Exports download as CSV with a date-stamped filename. Use transaction
          filters before exporting transaction history when you need a narrower audit range.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.href}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Includes
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.includes.map((field) => (
                    <span
                      className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-foreground"
                      key={field}
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                className={cn(buttonVariants({ variant: "outline" }))}
                href={report.href}
              >
                <Download className="size-4" aria-hidden="true" />
                Export CSV
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
