import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { listProductCategories } from "@/modules/product/product.service";

export default async function NewProductPage() {
  await requireUser();
  const categories = await listProductCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Product"
        description="Create a parent product. Stock will still be managed only against variants."
      />

      <Card>
        <CardHeader>
          <CardTitle>Parent Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
