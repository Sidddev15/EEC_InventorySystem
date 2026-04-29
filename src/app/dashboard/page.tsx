import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const dashboardCards = [
  {
    title: "Products",
    description: "Parent products and configurable variants.",
  },
  {
    title: "Inventory",
    description: "Stock will be updated only through controlled movements.",
  },
  {
    title: "Production",
    description: "Production entries will convert input stock to output stock.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Factory inventory control overview for EEC filter manufacturing."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Module foundation ready.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
