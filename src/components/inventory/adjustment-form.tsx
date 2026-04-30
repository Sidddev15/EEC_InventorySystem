"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { type InventoryItemOption } from "@/modules/inventory/inventory.types";

type AdjustmentFormProps = {
  items: InventoryItemOption[];
};

export function AdjustmentForm({ items }: AdjustmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="inventoryItemId">
          Item
        </label>
        <select
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          id="inventoryItemId"
          name="inventoryItemId"
          required
        >
          <option value="">Select item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} / {item.location} / {item.unit}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="adjustmentType">
            Adjustment Type
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="adjustmentType"
            name="adjustmentType"
            required
          >
            <option value="INCREASE">Increase</option>
            <option value="DECREASE">Decrease</option>
          </select>
        </div>
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
