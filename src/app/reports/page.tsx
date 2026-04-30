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
  },
  {
    title: "Low Stock",
    description: "Items at or below reorder/minimum levels.",
    href: "/api/reports/low-stock",
  },
  {
    title: "Transaction History",
    description: "Full inventory movement log.",
    href: "/api/reports/transactions",
  },
  {
    title: "Production History",
    description: "Production outputs with references.",
    href: "/api/reports/production-history",
  },
  {
    title: "Consumption Summary",
    description: "Grouped material consumption from production.",
    href: "/api/reports/consumption-summary",
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.href}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>
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
