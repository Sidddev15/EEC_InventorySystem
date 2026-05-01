import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  Factory,
  PackagePlus,
  RefreshCcw,
  Truck,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Add Raw Material",
    description: "Record material received in store",
    href: "/inventory/inward",
    icon: PackagePlus,
  },
  {
    title: "Log Production",
    description: "Consume raw material and add output stock",
    href: "/production/new",
    icon: Factory,
  },
  {
    title: "Dispatch Goods",
    description: "Dispatch workflow coming next",
    href: "/transactions",
    icon: Truck,
  },
  {
    title: "View Stock",
    description: "Check inventory by type and location",
    href: "/inventory",
    icon: Boxes,
  },
];

export default async function FactoryPanelPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Factory Panel"
        description="Large operational actions for phone and tablet use. Use this panel for movement entry, production posting, and stock checking."
      />

      <section className="rounded-xl border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">Primary actions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use these actions for shop-floor work. Each entry updates stock through the proper server-side flow.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action) => (
            <ActionButton
              className="h-28 items-start text-left"
              description={action.description}
              href={action.href}
              icon={action.icon}
              key={action.title}
              label={action.title}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Operational reminders</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Post only physical stock movement. Use adjustments only for corrections, not normal flow.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-sm font-medium text-foreground">Raw material inward</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Record received stock with the correct location and reference.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-sm font-medium text-foreground">Production posting</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Confirm consumption and output preview before posting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-semibold text-foreground">Support links</p>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
              href="/inventory?type=RAW_MATERIAL"
            >
              <Boxes className="size-4" aria-hidden="true" />
              Raw Material Stock
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
              href="/transactions"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              Transaction Log
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
              href="/inventory/adjustment"
            >
              <RefreshCcw className="size-4" aria-hidden="true" />
              Stock Adjustment
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
