"use client";

import { useEffect, useState } from "react";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { ProductSummaryDialog } from "@/components/products/product-summary-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ProductDetail } from "@/modules/product/product.types";

type ProductVariantsPanelProps = {
  product: ProductDetail;
};

export function ProductVariantsPanel({ product }: ProductVariantsPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openSummary(variantId: string) {
    setSelectedVariantId(variantId);
    setOpen(true);
  }

  return (
    <>
      <DataTableShell
        title="Variants"
        description="Click any variant row to review the full parent product summary and the selected variant context."
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
                <TableRow
                  className="cursor-pointer hover:bg-slate-50"
                  key={variant.id}
                  onClick={() => openSummary(variant.id)}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="text-left text-sm font-semibold text-slate-900"
                      onClick={(event) => {
                        event.stopPropagation();
                        openSummary(variant.id);
                      }}
                    >
                      {variant.name}
                    </button>
                  </TableCell>
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
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={4}>
                  No variants created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <ProductSummaryDialog
        open={open}
        product={product}
        selectedVariantId={selectedVariantId}
        showPageLink={false}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
