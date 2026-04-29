import { FactoryDashboard } from "@/components/dashboard/factory-dashboard";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();

  return <FactoryDashboard />;
}
