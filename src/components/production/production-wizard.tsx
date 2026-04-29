"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, PackageCheck, Warehouse } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type InventoryItemOption } from "@/modules/inventory/inventory.types";

type ProductionWizardProps = {
  outputItems: InventoryItemOption[];
  consumptionItems: InventoryItemOption[];
};

type ConsumptionLine = {
  key: string;
  inventoryItemId: string;
  quantity: string;
};

const steps = [
  "Select Product Variant",
  "Enter Production Quantity",
  "Add Consumed Materials",
  "Confirm Production",
];

function formatQuantity(value: number, unit: string) {
  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 3,
  }).format(value)} ${unit}`;
}

export function ProductionWizard({
  outputItems,
  consumptionItems,
}: ProductionWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [outputItemId, setOutputItemId] = useState("");
  const [productionQuantity, setProductionQuantity] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consumptions, setConsumptions] = useState<ConsumptionLine[]>([
    { key: crypto.randomUUID(), inventoryItemId: "", quantity: "" },
  ]);

  const outputItem = outputItems.find((item) => item.id === outputItemId);
  const producedQuantity = Number(productionQuantity) || 0;

  const previewRows = useMemo(() => {
    const rawRows = consumptions
      .map((line) => {
        const item = consumptionItems.find(
          (candidate) => candidate.id === line.inventoryItemId
        );
        const consumedQuantity = Number(line.quantity) || 0;

        if (!item) {
          return null;
        }

        return {
          key: line.key,
          item: item.label,
          location: item.location,
          before: formatQuantity(item.currentStock, item.unit),
          change: `-${formatQuantity(consumedQuantity, item.unit)}`,
          after: formatQuantity(item.currentStock - consumedQuantity, item.unit),
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    const outputRow = outputItem
      ? [
          {
            key: "output",
            item: outputItem.label,
            location: outputItem.location,
            before: formatQuantity(outputItem.currentStock, outputItem.unit),
            change: `+${formatQuantity(producedQuantity, outputItem.unit)}`,
            after: formatQuantity(
              outputItem.currentStock + producedQuantity,
              outputItem.unit
            ),
          },
        ]
      : [];

    return [...rawRows, ...outputRow];
  }, [consumptionItems, consumptions, outputItem, producedQuantity]);

  function addConsumptionLine() {
    setConsumptions((current) => [
      ...current,
      { key: crypto.randomUUID(), inventoryItemId: "", quantity: "" },
    ]);
  }

  function updateConsumptionLine(
    key: string,
    field: "inventoryItemId" | "quantity",
    value: string
  ) {
    setConsumptions((current) =>
      current.map((line) =>
        line.key === key ? { ...line, [field]: value } : line
      )
    );
  }

  function removeConsumptionLine(key: string) {
    setConsumptions((current) =>
      current.length === 1 ? current : current.filter((line) => line.key !== key)
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/production", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outputInventoryItemId: outputItemId,
        outputQuantity: productionQuantity,
        referenceNo,
        notes,
        consumptions: consumptions.map((line) => ({
          inventoryItemId: line.inventoryItemId,
          quantity: line.quantity,
        })),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to log production.");
      return;
    }

    router.replace("/inventory?type=FINISHED_GOODS");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <ol className="grid gap-2 lg:grid-cols-4">
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

      <div className={stepIndex === 0 ? "space-y-1.5" : "hidden"}>
        <label className="text-sm font-medium" htmlFor="outputItemId">
          Product Variant to Produce
        </label>
        <select
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          id="outputItemId"
          name="outputItemId"
          required
          value={outputItemId}
          onChange={(event) => setOutputItemId(event.target.value)}
        >
          <option value="">Select finished or semi-finished variant</option>
          {outputItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} / {item.location} / {item.unit}
            </option>
          ))}
        </select>
      </div>

      <div className={stepIndex === 1 ? "space-y-1.5" : "hidden"}>
        <label className="text-sm font-medium" htmlFor="productionQuantity">
          Production Quantity
        </label>
        <Input
          id="productionQuantity"
          name="productionQuantity"
          inputMode="decimal"
          required
          value={productionQuantity}
          onChange={(event) => setProductionQuantity(event.target.value)}
          placeholder="Quantity produced"
        />
      </div>

      <div className={stepIndex === 2 ? "space-y-3" : "hidden"}>
        {consumptions.map((line, index) => (
          <div className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_160px_auto]" key={line.key}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor={`material-${line.key}`}>
                Consumed Material {index + 1}
              </label>
              <select
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                id={`material-${line.key}`}
                required
                value={line.inventoryItemId}
                onChange={(event) =>
                  updateConsumptionLine(line.key, "inventoryItemId", event.target.value)
                }
              >
                <option value="">Select raw material</option>
                {consumptionItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} / {item.location} / {item.unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor={`qty-${line.key}`}>
                Quantity
              </label>
              <Input
                id={`qty-${line.key}`}
                inputMode="decimal"
                required
                value={line.quantity}
                onChange={(event) =>
                  updateConsumptionLine(line.key, "quantity", event.target.value)
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={() => removeConsumptionLine(line.key)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addConsumptionLine}>
          Add Material
        </Button>
      </div>

      <div className={stepIndex === 3 ? "space-y-4" : "hidden"}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="referenceNo">
              Reference Number
            </label>
            <Input
              id="referenceNo"
              value={referenceNo}
              onChange={(event) => setReferenceNo(event.target.value)}
              placeholder="Optional batch or job number"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional production note"
            />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Output Before"
            value={
              outputItem
                ? formatQuantity(outputItem.currentStock, outputItem.unit)
                : "Select output"
            }
            subtitle="Finished stock"
            icon={<PackageCheck className="size-4" aria-hidden="true" />}
          />
          <KpiCard
            title="Production Quantity"
            value={
              outputItem
                ? formatQuantity(producedQuantity, outputItem.unit)
                : "Enter quantity"
            }
            subtitle="Will be added"
            icon={<Factory className="size-4" aria-hidden="true" />}
          />
          <KpiCard
            title="Output After"
            value={
              outputItem
                ? formatQuantity(
                    outputItem.currentStock + producedQuantity,
                    outputItem.unit
                  )
                : "Preview"
            }
            subtitle="Expected stock after production"
            icon={<Warehouse className="size-4" aria-hidden="true" />}
          />
        </section>

        <DataTableShell
          title="Before and After Stock Preview"
          description="Raw material decreases and finished stock increases only after confirmation."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.length > 0 ? (
                previewRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.item}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.before}</TableCell>
                    <TableCell>{row.change}</TableCell>
                    <TableCell>{row.after}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    Complete the previous steps to preview stock conversion.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DataTableShell>
      </div>

      <div className="flex justify-end gap-3">
        {error ? (
          <p className="mr-auto self-center text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
        >
          Back
        </Button>
        {stepIndex < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() =>
              setStepIndex((current) => Math.min(current + 1, steps.length - 1))
            }
          >
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting" : "Confirm Production"}
          </Button>
        )}
      </div>
    </form>
  );
}
