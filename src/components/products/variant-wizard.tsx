"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ProductOption,
  type UnitOption,
} from "@/modules/product/product.types";

type VariantWizardProps = {
  products: ProductOption[];
  units: UnitOption[];
  initialProductId?: string;
};

const steps = ["Parent Product", "Variant Name", "Attributes", "Unit", "Save"];

export function VariantWizard({
  products,
  units,
  initialProductId,
}: VariantWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultUnitId = useMemo(() => {
    return units.find((unit) => unit.code === "NOS")?.id ?? units[0]?.id ?? "";
  }, [units]);

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/variants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: formData.get("productId"),
        name: formData.get("name"),
        thickness: formData.get("thickness"),
        gsm: formData.get("gsm"),
        material: formData.get("material"),
        size: formData.get("size"),
        unitId: formData.get("unitId"),
        inventoryType: formData.get("inventoryType"),
        isActive: formData.get("isActive") === "on",
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to create variant.");
      return;
    }

    router.refresh();
    setStepIndex(0);
    event.currentTarget.reset();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <ol className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => (
          <li
            className={
              index === stepIndex
                ? "rounded-lg border border-primary bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                : "rounded-lg border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
            }
            key={step}
          >
            {index + 1}. {step}
          </li>
        ))}
      </ol>

      <div className={stepIndex === 0 ? "grid gap-4" : "hidden"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="productId">
            Parent Product
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="productId"
            name="productId"
            required
            defaultValue={initialProductId}
          >
            <option value="">Select parent product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={stepIndex === 1 ? "grid gap-4" : "hidden"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">
            Variant Name
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Floor Filter 50mm"
          />
        </div>
      </div>

      <div className={stepIndex === 2 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="thickness">
            Thickness
          </label>
          <Input id="thickness" name="thickness" placeholder="50mm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="gsm">
            GSM
          </label>
          <Input id="gsm" name="gsm" inputMode="numeric" placeholder="250" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="material">
            Material
          </label>
          <Input id="material" name="material" placeholder="Synthetic media" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="size">
            Size
          </label>
          <Input id="size" name="size" placeholder="1m x 20m" />
        </div>
      </div>

      <div className={stepIndex === 3 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="unitId">
            Default Unit
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="unitId"
            name="unitId"
            required
            defaultValue={defaultUnitId}
          >
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.code} - {unit.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="inventoryType">
            Inventory Type
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="inventoryType"
            name="inventoryType"
            required
            defaultValue="FINISHED_GOODS"
          >
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="SEMI_FINISHED">Semi-Finished</option>
            <option value="FINISHED_GOODS">Finished Goods</option>
          </select>
        </div>
      </div>

      <div className={stepIndex === 4 ? "space-y-4" : "hidden"}>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            className="size-4 rounded border-input"
            name="isActive"
            type="checkbox"
            defaultChecked
          />
          Active
        </label>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Save only after checking parent product, unit, inventory type, and
          naming. Variants are the operational stock truth.
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0}>
          Back
        </Button>
        {stepIndex < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving" : "Save Variant"}
          </Button>
        )}
      </div>
    </form>
  );
}
