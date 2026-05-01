"use client";

import { FormEvent, useState } from "react";
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

const inventoryTypeLabels: Record<string, string> = {
  RAW_MATERIAL: "Raw Material",
  SEMI_FINISHED: "Semi-Finished",
  FINISHED_GOODS: "Finished Goods",
};

export function VariantWizard({
  products,
  units,
  initialProductId,
}: VariantWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [variantName, setVariantName] = useState("");
  const [thickness, setThickness] = useState("");
  const [gsm, setGsm] = useState("");
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [inventoryType, setInventoryType] = useState("FINISHED_GOODS");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [unitId, setUnitId] = useState(
    () => units.find((unit) => unit.code === "NOS")?.id ?? units[0]?.id ?? ""
  );
  const selectedProduct = products.find((product) => product.id === productId);
  const selectedUnit = units.find((unit) => unit.id === unitId);

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function suggestName() {
    setAiSuggestion(null);
    setIsSuggestingName(true);

    const response = await fetch("/api/ai/variant-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        thickness,
        gsm,
        material,
        size,
        inventoryType,
      }),
    });

    setIsSuggestingName(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setAiSuggestion(data.message ?? "Unable to suggest variant name.");
      return;
    }

    const data = (await response.json()) as { suggestion: string };
    setVariantName(data.suggestion);
    setHasConfirmed(false);
    setAiSuggestion(`Suggested variant name: ${data.suggestion}`);
  }

  async function suggestUnit() {
    setAiSuggestion(null);

    const response = await fetch("/api/ai/unit-suggestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantName,
        material,
        size,
        inventoryType,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setAiSuggestion(data.message ?? "Unable to suggest unit.");
      return;
    }

    const data = (await response.json()) as {
      suggestion: string;
      unitCode: string;
    };
    const suggestedUnit = units.find((unit) => unit.code === data.unitCode);

    if (suggestedUnit) {
      setUnitId(suggestedUnit.id);
      setHasConfirmed(false);
    }

    setAiSuggestion(data.suggestion);
  }

  async function reviewMissingFields() {
    setAiSuggestion(null);

    const selectedUnit = units.find((unit) => unit.id === unitId);
    const response = await fetch("/api/ai/missing-fields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantName,
        thickness,
        gsm,
        material,
        size,
        unitCode: selectedUnit?.code,
        inventoryType,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setAiSuggestion(data.message ?? "Unable to review missing fields.");
      return;
    }

    const data = (await response.json()) as { suggestion: string };
    setAiSuggestion(data.suggestion);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);

    if (stepIndex !== steps.length - 1) {
      return;
    }

    if (!hasConfirmed) {
      setError("Confirm the variant details before creating it.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(form);
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
    setVariantName("");
    setThickness("");
    setGsm("");
    setMaterial("");
    setSize("");
    setAiSuggestion(null);
    setHasConfirmed(false);
    form.reset();
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
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setHasConfirmed(false);
            }}
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
            value={variantName}
            onChange={(event) => {
              setVariantName(event.target.value);
              setHasConfirmed(false);
            }}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={!productId || isSuggestingName}
              onClick={suggestName}
            >
              {isSuggestingName ? "Suggesting" : "Suggest variant name"}
            </Button>
          </div>
        </div>
      </div>

      <div className={stepIndex === 2 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
        <div className="space-y-1.5 rounded-xl border bg-background p-4">
          <label className="text-sm font-medium" htmlFor="thickness">
            Thickness
          </label>
          <Input
            id="thickness"
            name="thickness"
            placeholder="50mm"
            value={thickness}
            onChange={(event) => {
              setThickness(event.target.value);
              setHasConfirmed(false);
            }}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Use the operational thickness used on the shop floor and in dispatch communication.
          </p>
        </div>
        <div className="space-y-1.5 rounded-xl border bg-background p-4">
          <label className="text-sm font-medium" htmlFor="gsm">
            GSM
          </label>
          <Input
            id="gsm"
            name="gsm"
            inputMode="numeric"
            placeholder="250"
            value={gsm}
            onChange={(event) => {
              setGsm(event.target.value);
              setHasConfirmed(false);
            }}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Keep GSM numeric so variants stay comparable and searchable later.
          </p>
        </div>
        <div className="space-y-1.5 rounded-xl border bg-background p-4">
          <label className="text-sm font-medium" htmlFor="material">
            Material
          </label>
          <Input
            id="material"
            name="material"
            placeholder="Synthetic media"
            value={material}
            onChange={(event) => {
              setMaterial(event.target.value);
              setHasConfirmed(false);
            }}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Enter the actual filter media or assembly material used in stock handling.
          </p>
        </div>
        <div className="space-y-1.5 rounded-xl border bg-background p-4">
          <label className="text-sm font-medium" htmlFor="size">
            Size
          </label>
          <Input
            id="size"
            name="size"
            placeholder="1m x 20m"
            value={size}
            onChange={(event) => {
              setSize(event.target.value);
              setHasConfirmed(false);
            }}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Use a stable dimensional format. This affects naming quality and unit suggestions.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 md:col-span-2">
          <p className="text-sm font-semibold text-foreground">Attribute preview</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {[thickness || "Thickness not set", gsm ? `${gsm} GSM` : "GSM not set", material || "Material not set", size || "Size not set"].join(" • ")}
          </p>
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
            value={unitId}
            onChange={(event) => {
              setUnitId(event.target.value);
              setHasConfirmed(false);
            }}
          >
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.code} - {unit.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={suggestUnit}>
              Suggest unit
            </Button>
            <Button type="button" variant="outline" onClick={reviewMissingFields}>
              Review missing fields
            </Button>
          </div>
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
            value={inventoryType}
            onChange={(event) => {
              setInventoryType(event.target.value);
              setHasConfirmed(false);
            }}
          >
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="SEMI_FINISHED">Semi-Finished</option>
            <option value="FINISHED_GOODS">Finished Goods</option>
          </select>
        </div>
      </div>

      <div className={stepIndex === 4 ? "space-y-4" : "hidden"}>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Review variant details</h3>
          <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">Parent Product</dt>
              <dd className="mt-1 text-foreground">
                {selectedProduct
                  ? `${selectedProduct.name} - ${selectedProduct.category}`
                  : "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Variant Name</dt>
              <dd className="mt-1 text-foreground">{variantName || "Not entered"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Attributes</dt>
              <dd className="mt-1 text-foreground">
                {[thickness, gsm ? `${gsm} GSM` : "", material, size]
                  .filter(Boolean)
                  .join(", ") || "No attributes entered"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Unit</dt>
              <dd className="mt-1 text-foreground">
                {selectedUnit ? `${selectedUnit.code} - ${selectedUnit.name}` : "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Inventory Type</dt>
              <dd className="mt-1 text-foreground">
                {inventoryTypeLabels[inventoryType] ?? inventoryType}
              </dd>
            </div>
          </dl>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            className="size-4 rounded border-input"
            name="isActive"
            type="checkbox"
            defaultChecked
          />
          Active
        </label>

        <label className="flex items-start gap-2 rounded-lg border bg-background p-3 text-sm font-medium text-foreground">
          <input
            className="mt-0.5 size-4 rounded border-input"
            checked={hasConfirmed}
            type="checkbox"
            onChange={(event) => setHasConfirmed(event.target.checked)}
          />
          I have checked the parent product, variant name, unit, and inventory type.
        </label>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          Save only after checking parent product, unit, inventory type, and
          naming. Variants are the operational stock truth.
        </div>
      </div>

      {aiSuggestion ? (
        <p className="rounded-xl border bg-background p-3 text-sm font-medium text-foreground">
          {aiSuggestion}
        </p>
      ) : null}

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
          <Button type="submit" disabled={isSubmitting || !hasConfirmed}>
            {isSubmitting ? "Creating" : "Create Variant"}
          </Button>
        )}
      </div>
    </form>
  );
}
