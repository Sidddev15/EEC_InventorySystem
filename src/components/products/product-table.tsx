"use client";

import Link from "next/link";
import { ProductDetailModal } from "@/components/products/product-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
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
                <TableCell>
                  <div className="space-y-1">
                    <ProductDetailModal productId={product.id} triggerLabel={product.name} />
                    <p className="text-xs text-slate-500">Click product name for full details</p>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {product.variantsCount}
                </TableCell>
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
                className="p-0"
                colSpan={5}
              >
                <EmptyState
                  title="No products found"
                  description="Create a parent product first, then add variants under it. Stock will be tracked at variant level."
                  action={
                    <Link
                      className={cn(buttonVariants({ size: "sm" }))}
                      href="/products/new"
                    >
                      New Product
                    </Link>
                  }
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
