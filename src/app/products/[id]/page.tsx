import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductDetailModal } from "@/components/products/product-detail-modal";
import { ProductVariantsPanel } from "@/components/products/product-variants-panel";
import { VariantWizard } from "@/components/products/variant-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import {
  getProductDetail,
  listProductOptions,
} from "@/modules/product/product.service";
import { listUnitOptions } from "@/modules/product/variant.service";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await requireUser();
  const { id } = await params;
  const [product, products, units] = await Promise.all([
    getProductDetail(id),
    listProductOptions(),
    listUnitOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`${product.category}. Create and review variants for this parent product.`}
        actions={
          <ProductDetailModal
            productId={product.id}
            triggerLabel="View Product Summary"
            triggerMode="button"
            showPageLink={false}
          />
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardContent className="space-y-2 py-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Category
            </p>
            <p className="text-sm font-semibold text-slate-900">{product.category}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="space-y-2 py-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </p>
            <div>
              <StatusBadge status={product.isActive ? "normal" : "info"}>
                {product.isActive ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="space-y-2 py-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Variants
            </p>
            <p className="text-sm font-semibold text-slate-900">{product.variantsCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="space-y-2 py-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="text-sm text-slate-700">
              {product.description || "No description added."}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(440px,520px)] xl:items-start">
        <ProductVariantsPanel product={product} />

        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Variant Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <VariantWizard
              products={products}
              units={units}
              initialProductId={product.id}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
