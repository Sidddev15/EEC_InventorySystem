import Link from "next/link";
import { Boxes, Factory, PackagePlus, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

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
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Factory Panel"
        description="Large operational actions for phone and tablet use."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link href={action.href} key={action.title}>
              <Card className="min-h-36 transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
                  <div className="flex size-12 items-center justify-center rounded-xl border bg-background">
                    <Icon className="size-6 text-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-normal">
                      {action.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
