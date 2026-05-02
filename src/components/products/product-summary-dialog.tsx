"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { type ProductDetail } from "@/modules/product/product.types";

type ProductSummaryDialogProps = {
  open: boolean;
  product: ProductDetail;
  onClose: () => void;
  selectedVariantId?: string | null;
  showPageLink?: boolean;
};

export function ProductSummaryDialog({
  open,
  product,
  onClose,
  selectedVariantId,
  showPageLink = true,
}: ProductSummaryDialogProps) {
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null;

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      onClick={onClose}
    >
      <div
        aria-describedby="product-detail-description"
        aria-labelledby="product-detail-title"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900" id="product-detail-title">
              {product.name}
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-slate-500"
              id="product-detail-description"
            >
              Review the parent product, status, description, and all linked variants in one place.
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {selectedVariant ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="border-b border-blue-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Selected variant details</p>
                </div>
                <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Variant Name
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedVariant.name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Thickness
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedVariant.thickness || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      GSM
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedVariant.gsm ? `${selectedVariant.gsm} GSM` : "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Material
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedVariant.material || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Size
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedVariant.size || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Unit
                    </p>
                    <p className="mt-2 text-sm text-slate-900">{selectedVariant.unit}</p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Inventory Type
                    </p>
                    <p className="mt-2 text-sm text-slate-900">
                      {selectedVariant.inventoryType.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={selectedVariant.isActive ? "normal" : "info"}>
                        {selectedVariant.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Parent Product
                    </p>
                    <p className="mt-2 text-sm text-slate-900">{product.name}</p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Category
                    </p>
                    <p className="mt-2 text-sm text-slate-900">{product.category}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-slate-50/70 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Product Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={product.isActive ? "normal" : "info"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total Variants
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{product.variantsCount}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Product Description
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {product.description || "No description added."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Variants under this product</p>
              </div>
              {product.variants.length > 0 ? (
                <div className="divide-y">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;

                    return (
                      <div
                        className={cn(
                          "grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_180px_100px_110px]",
                          isSelected && "bg-blue-50/70"
                        )}
                        key={variant.id}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {variant.name}
                          </p>
                          {isSelected ? (
                            <p className="mt-1 text-xs font-medium text-blue-700">
                              Selected variant
                            </p>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-700">
                          {variant.inventoryType.replaceAll("_", " ")}
                        </p>
                        <p className="text-sm font-medium text-slate-700">{variant.unit}</p>
                        <div>
                          <StatusBadge status={variant.isActive ? "normal" : "info"}>
                            {variant.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">No variants created yet.</div>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex gap-3 border-t px-5 py-4",
            showPageLink ? "items-center justify-between" : "justify-end"
          )}
        >
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {showPageLink ? (
            <Link
              className={cn(buttonVariants({ size: "default" }))}
              href={`/products/${product.id}`}
              onClick={onClose}
            >
              Open full page
            </Link>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
