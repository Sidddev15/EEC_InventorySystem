"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type InventoryItemOption } from "@/modules/inventory/inventory.types";

type InwardFormProps = {
  items: InventoryItemOption[];
};

export function InwardForm({ items }: InwardFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedItemId = searchParams.get("item") ?? "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/inventory/inward", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventoryItemId: formData.get("inventoryItemId"),
        quantity: formData.get("quantity"),
        referenceNo: formData.get("referenceNo"),
        notes: formData.get("notes"),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to add stock.");
      return;
    }

    router.replace("/inventory?type=RAW_MATERIAL");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="inventoryItemId">
          Raw Material Item
        </label>
        <select
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          id="inventoryItemId"
          name="inventoryItemId"
          required
          defaultValue={selectedItemId}
        >
          <option value="">Select item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} / {item.location} / {item.unit}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="quantity">
            Quantity
          </label>
          <Input id="quantity" name="quantity" inputMode="decimal" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="referenceNo">
            Reference Number
          </label>
          <Input id="referenceNo" name="referenceNo" placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          id="notes"
          name="notes"
          placeholder="Supplier, challan, batch, or store note"
        />
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || items.length === 0}>
          {isSubmitting ? "Saving" : "Add Stock"}
        </Button>
      </div>
    </form>
  );
}
