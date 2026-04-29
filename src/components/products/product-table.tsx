import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { type ProductListItem } from "@/modules/product/product.types";

type ProductTableProps = {
  products: ProductListItem[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <DataTableShell
      title="Product Master"
      description="Parent products with variant counts. Operational stock is handled at variant level."
      actions={
        <Link className={cn(buttonVariants({ size: "lg" }))} href="/products/new">
          New Product
        </Link>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Variants Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-36 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.variantsCount}</TableCell>
                <TableCell>
                  <StatusBadge status={product.isActive ? "normal" : "info"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    href={`/products/${product.id}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={5}
              >
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
