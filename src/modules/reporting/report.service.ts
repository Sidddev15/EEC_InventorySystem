import { db } from "@/lib/db";
import { listTransactions } from "@/modules/transaction/transaction.service";
import { type TransactionFilters } from "@/modules/transaction/transaction.types";

type CsvValue = string | number | null | undefined;

function escapeCsvValue(value: CsvValue) {
  const text = value == null ? "" : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function toCsv(headers: string[], rows: CsvValue[][]) {
  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}

function decimalText(value: { toString(): string } | null | undefined) {
  return value?.toString() ?? "";
}

export async function currentStockCsv() {
  const rows = await db.inventoryItem.findMany({
    where: { location: { isStockHolding: true } },
    orderBy: [
      { variant: { product: { category: { name: "asc" } } } },
      { variant: { product: { name: "asc" } } },
      { variant: { name: "asc" } },
      { location: { name: "asc" } },
    ],
    select: {
      quantity: true,
      location: { select: { name: true } },
      variant: {
        select: {
          name: true,
          inventoryType: true,
          reorderLevel: true,
          unit: { select: { code: true } },
          product: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return toCsv(
    ["Category", "Product", "Variant", "Inventory Type", "Quantity", "Unit", "Location", "Reorder Level"],
    rows.map((row) => [
      row.variant.product.category.name,
      row.variant.product.name,
      row.variant.name,
      row.variant.inventoryType,
      decimalText(row.quantity),
      row.variant.unit.code,
      row.location.name,
      decimalText(row.variant.reorderLevel),
    ])
  );
}

export async function lowStockCsv() {
  const rows = await db.inventoryItem.findMany({
    where: {
      location: { isStockHolding: true },
      variant: {
        OR: [{ minStockLevel: { not: null } }, { reorderLevel: { not: null } }],
      },
    },
    orderBy: [{ variant: { product: { name: "asc" } } }],
    select: {
      quantity: true,
      location: { select: { name: true } },
      variant: {
        select: {
          name: true,
          minStockLevel: true,
          reorderLevel: true,
          unit: { select: { code: true } },
          product: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  const filteredRows = rows.filter((row) => {
    const quantity = Number(row.quantity.toString());
    const min = row.variant.minStockLevel
      ? Number(row.variant.minStockLevel.toString())
      : 0;
    const reorder = row.variant.reorderLevel
      ? Number(row.variant.reorderLevel.toString())
      : 0;

    return (min > 0 && quantity <= min) || (reorder > 0 && quantity <= reorder);
  });

  return toCsv(
    ["Category", "Product", "Variant", "Quantity", "Unit", "Location", "Min Stock", "Reorder Level"],
    filteredRows.map((row) => [
      row.variant.product.category.name,
      row.variant.product.name,
      row.variant.name,
      decimalText(row.quantity),
      row.variant.unit.code,
      row.location.name,
      decimalText(row.variant.minStockLevel),
      decimalText(row.variant.reorderLevel),
    ])
  );
}

export async function transactionHistoryCsv(filters: TransactionFilters = {}) {
  const rows = await listTransactions(filters);

  return toCsv(
    ["Date & Time", "Type", "Product", "Variant", "Quantity", "Unit", "Source", "Destination", "User", "Reference", "Remarks"],
    rows.map((row) => [
      row.dateTime,
      row.type,
      row.product,
      row.variant,
      row.quantity,
      row.unit,
      row.source,
      row.destination,
      row.user,
      row.reference,
      row.remarks,
    ])
  );
}

export async function productionHistoryCsv() {
  const rows = await db.productionEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      productionNo: true,
      outputQuantity: true,
      referenceNo: true,
      notes: true,
      createdByUserId: true,
      createdAt: true,
      outputUnit: { select: { code: true } },
      outputLocation: { select: { name: true } },
      outputVariant: {
        select: {
          name: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  return toCsv(
    ["Date", "Production No", "Product", "Output Variant", "Output Quantity", "Unit", "Location", "User", "Reference", "Notes"],
    rows.map((row) => [
      row.createdAt.toISOString(),
      row.productionNo,
      row.outputVariant.product.name,
      row.outputVariant.name,
      decimalText(row.outputQuantity),
      row.outputUnit.code,
      row.outputLocation.name,
      row.createdByUserId,
      row.referenceNo,
      row.notes,
    ])
  );
}

export async function consumptionSummaryCsv() {
  const rows = await db.productionConsumption.groupBy({
    by: ["variantId", "unitId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
  });
  const variants = await db.productVariant.findMany({
    where: { id: { in: rows.map((row) => row.variantId) } },
    select: {
      id: true,
      name: true,
      product: { select: { name: true, category: { select: { name: true } } } },
    },
  });
  const units = await db.unit.findMany({
    where: { id: { in: rows.map((row) => row.unitId) } },
    select: { id: true, code: true },
  });
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));
  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  return toCsv(
    ["Category", "Product", "Material Variant", "Consumed Quantity", "Unit"],
    rows.map((row) => {
      const variant = variantById.get(row.variantId);
      const unit = unitById.get(row.unitId);

      return [
        variant?.product.category.name,
        variant?.product.name,
        variant?.name,
        decimalText(row._sum.quantity),
        unit?.code,
      ];
    })
  );
}
