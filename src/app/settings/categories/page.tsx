import { CategoriesManager } from "@/components/settings/categories-manager";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/modules/settings/settings.service";
import { redirect } from "next/navigation";

export default async function SettingsCategoriesPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Product category master used by parent products and reporting."
      />
      <CategoriesManager initialItems={categories} />
    </div>
  );
}
