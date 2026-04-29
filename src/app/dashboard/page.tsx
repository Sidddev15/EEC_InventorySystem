import { CorporateDashboard } from "@/components/dashboard/corporate-dashboard";
import { FactoryDashboard } from "@/components/dashboard/factory-dashboard";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "CORPORATE") {
    return <CorporateDashboard />;
  }

  return <FactoryDashboard />;
}
