"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { type InventoryItemOption } from "@/modules/inventory/inventory.types";

type InwardFormProps = {
  items: InventoryItemOption[];
};

export function InwardForm({ items }: InwardFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(
    () => searchParams.get("item") ?? ""
  );
  const selectedItem = items.find((item) => item.id === selectedItemId);

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
      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventoryItemId">
            Raw Material Item
          </label>
          <SelectField
            id="inventoryItemId"
            name="inventoryItemId"
            options={[
              { value: "", label: "Select item" },
              ...items.map((item) => ({
                value: item.id,
                label: `${item.label} / ${item.location} / ${item.unit}`,
              })),
            ]}
            required
            value={selectedItemId}
            onValueChange={setSelectedItemId}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Variant
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {selectedItem?.variantName ?? "Select a raw material item"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedItem?.itemName ?? "Parent product will appear here"}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Stock
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {selectedItem ? `${selectedItem.currentStock} ${selectedItem.unit}` : "0"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stock before this inward entry
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Location
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {selectedItem?.location ?? "Not selected"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stock is updated location-wise
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="quantity">
              Quantity
            </label>
            <Input id="quantity" name="quantity" inputMode="decimal" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="referenceNo">
              Reference Number
            </label>
            <Input id="referenceNo" name="referenceNo" placeholder="Optional" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Submission flow</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Save this inward only when the quantity is physically received. The system
          creates an inventory transaction, updates stock, writes a stock ledger
          entry, and stores an audit log in one server-side flow.
        </p>
      </div>

      {items.length === 0 ? (
        <FormMessage tone="warning">
          No raw material inventory items are available. Create a raw material
          variant before adding inward stock.
        </FormMessage>
      ) : null}

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

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
