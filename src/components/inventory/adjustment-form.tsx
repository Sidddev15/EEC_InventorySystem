"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { type InventoryItemOption } from "@/modules/inventory/inventory.types";

type AdjustmentFormProps = {
  items: InventoryItemOption[];
};

export function AdjustmentForm({ items }: AdjustmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("INCREASE");
  const selectedItem = items.find((item) => item.id === selectedItemId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/inventory/adjustment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventoryItemId: formData.get("inventoryItemId"),
        adjustmentType: formData.get("adjustmentType"),
        quantity: formData.get("quantity"),
        reason: formData.get("reason"),
        referenceNo: formData.get("referenceNo"),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to adjust stock.");
      return;
    }

    router.replace("/inventory");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="inventoryItemId">
            Item
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
              {selectedItem?.variantName ?? "Select an item"}
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
              Stock before correction
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
              Audit trail is location-aware
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="adjustmentType">
              Adjustment Type
            </label>
            <SelectField
              id="adjustmentType"
              name="adjustmentType"
              options={[
                { value: "INCREASE", label: "Increase" },
                { value: "DECREASE", label: "Decrease" },
              ]}
              required
              value={adjustmentType}
              onValueChange={setAdjustmentType}
            />
          </div>
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

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {adjustmentType === "DECREASE"
            ? "Decrease only when physical stock is lower than system stock. Negative stock is blocked server-side."
            : "Increase only when stock exists physically but was missed in a prior inward or production entry."}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="reason">
            Reason
          </label>
          <textarea
            className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="reason"
            name="reason"
            required
            placeholder="Explain the correction clearly. This is written to audit logs."
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Submission flow</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Each adjustment creates an adjustment transaction, updates the stock
          balance, writes a stock ledger record, and stores an audit entry with
          the reason and reference number.
        </p>
      </div>

      {items.length === 0 ? (
        <FormMessage tone="warning">
          No inventory items are available for adjustment.
        </FormMessage>
      ) : null}

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <FormMessage tone="warning">
        Stock adjustments are audit-visible corrections. Use inward,
        production, or dispatch flows for normal movement.
      </FormMessage>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || items.length === 0}>
          {isSubmitting ? "Saving" : "Save Adjustment"}
        </Button>
      </div>
    </form>
  );
}
