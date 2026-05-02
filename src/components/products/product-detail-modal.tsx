"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ProductDetail } from "@/modules/product/product.types";
import { ProductSummaryDialog } from "./product-summary-dialog";

type ProductDetailModalProps = {
  productId: string;
  triggerLabel: string;
  triggerMode?: "inline" | "button";
  showPageLink?: boolean;
};

export function ProductDetailModal({
  productId,
  triggerLabel,
  triggerMode = "inline",
  showPageLink = true,
}: ProductDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);

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

  async function openModal() {
    setOpen(true);

    if (product || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setError(data.message ?? "Unable to load product details.");
        return;
      }

      const data = (await response.json()) as ProductDetail;
      setProduct(data);
    } catch {
      setError("Unable to load product details.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {triggerMode === "button" ? (
        <Button type="button" variant="outline" onClick={openModal}>
          {triggerLabel}
        </Button>
      ) : (
        <button
          type="button"
          className="h-auto justify-start px-0 py-0 text-left text-sm font-semibold text-slate-900 hover:bg-transparent hover:text-blue-700"
          onClick={openModal}
        >
          {triggerLabel}
        </button>
      )}

      {open ? (
        isLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
            <div className="rounded-xl border bg-white px-5 py-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Loading product details
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
            <div className="w-full max-w-lg rounded-xl border bg-white p-5 shadow-sm">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : product ? (
          <ProductSummaryDialog
            open={open}
            product={product}
            showPageLink={showPageLink}
            onClose={() => setOpen(false)}
          />
        ) : null
      ) : null}
    </>
  );
}
