import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { VariantWizard } from "@/components/products/variant-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <DataTableShell
          title="Variants"
          description="Variant records are used for inventory, transactions, and production."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Inventory Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell>{variant.inventoryType.replaceAll("_", " ")}</TableCell>
                    <TableCell>{variant.unit}</TableCell>
                    <TableCell>
                      <StatusBadge status={variant.isActive ? "normal" : "info"}>
                        {variant.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No variants created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DataTableShell>

        <Card>
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
