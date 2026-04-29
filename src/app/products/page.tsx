import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductTable } from "@/components/products/product-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { listProducts } from "@/modules/product/product.service";
import { type ProductListFilters } from "@/modules/product/product.types";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: ProductListFilters["status"];
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireUser();
  const params = await searchParams;
  const filters: ProductListFilters = {
    search: params.q,
    status: params.status ?? "all",
  };
  const products = await listProducts(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse parent products and their configurable variants."
      />

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/products">
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
            <select
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              name="status"
              defaultValue={filters.status}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <ProductTable products={products} />
    </div>
  );
}
