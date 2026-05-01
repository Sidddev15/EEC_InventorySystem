import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductTable } from "@/components/products/product-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { requireUser } from "@/lib/auth";
import {
  listProductCategories,
  listProducts,
} from "@/modules/product/product.service";
import { type ProductListFilters } from "@/modules/product/product.types";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    status?: ProductListFilters["status"];
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireUser();
  const params = await searchParams;
  const filters: ProductListFilters = {
    search: params.q,
    categoryId: params.categoryId,
    status: params.status ?? "all",
  };
  const [products, categories] = await Promise.all([
    listProducts(filters),
    listProductCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse parent products and their configurable variants."
      />

      <Card>
        <CardContent className="p-4">
          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_220px_180px_auto]"
            action="/products"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                name="q"
                placeholder="Search product, category, or variant"
                defaultValue={filters.search}
              />
            </div>
            <SelectField
              defaultValue={filters.categoryId}
              name="categoryId"
              options={[
                { value: "", label: "All categories" },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
            />
            <SelectField
              defaultValue={filters.status}
              name="status"
              options={[
                { value: "all", label: "All status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <ProductTable products={products} />
    </div>
  );
}
