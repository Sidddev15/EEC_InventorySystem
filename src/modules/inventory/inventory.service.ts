import { InventoryType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  type InventoryItemOption,
  type InventoryOverview,
  type InventoryListItem,
  type InventoryStatusBreakdown,
  type InventoryStockStatus,
  type InventoryTab,
  type InventoryTypeSummary,
} from "./inventory.types";

const inventoryTypeValues = Object.values(InventoryType);
const inventoryTypeLabels: Record<InventoryType, string> = {
  [InventoryType.RAW_MATERIAL]: "Raw Material",
  [InventoryType.SEMI_FINISHED]: "Semi-Finished",
  [InventoryType.FINISHED_GOODS]: "Finished Goods",
};

export function normalizeInventoryTab(value?: string): InventoryTab {
  if (value && inventoryTypeValues.includes(value as InventoryType)) {
    return value as InventoryType;
  }

  return InventoryType.RAW_MATERIAL;
}

export async function listInventoryItemOptions(args?: {
  inventoryType?: InventoryTab;
}): Promise<InventoryItemOption[]> {
  const items = await db.inventoryItem.findMany({
    where: {
      ...(args?.inventoryType
        ? {
            variant: {
              inventoryType: args.inventoryType,
            },
          }
        : {}),
      location: {
        isStockHolding: true,
      },
    },
    orderBy: [
      { variant: { product: { name: "asc" } } },
      { variant: { name: "asc" } },
      { location: { name: "asc" } },
    ],
    select: {
      id: true,
      quantity: true,
      location: {
        select: {
          name: true,
        },
      },
      variant: {
        select: {
          name: true,
          id: true,
          inventoryType: true,
          unit: {
            select: {
              code: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    variantId: item.variant.id,
    label: `${item.variant.product.name} - ${item.variant.name}`,
    unit: item.variant.unit.code,
    inventoryType: item.variant.inventoryType,
    location: item.location.name,
    currentStock: decimalToNumber(item.quantity),
  }));
}

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value.toString()) : 0;
}

function formatDecimal(value: Prisma.Decimal | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 3,
  }).format(decimalToNumber(value));
}

function getStockStatus(args: {
  quantity: Prisma.Decimal;
  minStockLevel?: Prisma.Decimal | null;
  reorderLevel?: Prisma.Decimal | null;
}): InventoryStockStatus {
  const quantity = decimalToNumber(args.quantity);
  const minStock = decimalToNumber(args.minStockLevel);
  const reorder = decimalToNumber(args.reorderLevel);

  if (minStock > 0 && quantity <= minStock) {
    return "low";
  }

  if (reorder > 0 && quantity <= reorder) {
    return "reorder";
  }

  return "normal";
}

export async function listInventoryByType(
  inventoryType: InventoryTab
): Promise<InventoryListItem[]> {
  const items = await db.inventoryItem.findMany({
    where: {
      variant: {
        inventoryType,
      },
      location: {
        isStockHolding: true,
      },
    },
    orderBy: [
      { variant: { product: { category: { name: "asc" } } } },
      { variant: { product: { name: "asc" } } },
      { variant: { name: "asc" } },
      { location: { name: "asc" } },
    ],
    select: {
      id: true,
      quantity: true,
      location: {
        select: {
          name: true,
        },
      },
      variant: {
        select: {
          name: true,
          minStockLevel: true,
          reorderLevel: true,
          unit: {
            select: {
              code: true,
            },
          },
          product: {
            select: {
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    itemName: item.variant.product.name,
    category: item.variant.product.category.name,
    variant: item.variant.name,
    currentStock: formatDecimal(item.quantity),
    numericStock: decimalToNumber(item.quantity),
    unit: item.variant.unit.code,
    location: item.location.name,
    reorderLevel: item.variant.reorderLevel
      ? formatDecimal(item.variant.reorderLevel)
      : "Not set",
    status: getStockStatus({
      quantity: item.quantity,
      minStockLevel: item.variant.minStockLevel,
      reorderLevel: item.variant.reorderLevel,
    }),
  }));
}

export async function getInventoryOverview(
  activeType: InventoryTab
): Promise<InventoryOverview> {
  const groupedItems = await db.inventoryItem.findMany({
    where: {
      location: {
        isStockHolding: true,
      },
    },
    select: {
      locationId: true,
      variantId: true,
      variant: {
        select: {
          inventoryType: true,
        },
      },
    },
  });

  const summaryMap = new Map<InventoryType, InventoryTypeSummary>();

  for (const type of inventoryTypeValues) {
    summaryMap.set(type, {
      type,
      label: inventoryTypeLabels[type],
      itemCount: 0,
      variantCount: 0,
      locationCount: 0,
    });
  }

  const variantSets = new Map<InventoryType, Set<string>>();
  const locationSets = new Map<InventoryType, Set<string>>();

  for (const type of inventoryTypeValues) {
    variantSets.set(type, new Set<string>());
    locationSets.set(type, new Set<string>());
  }

  for (const item of groupedItems) {
    const type = item.variant.inventoryType;
    const summary = summaryMap.get(type);

    if (!summary) {
      continue;
    }

    summary.itemCount += 1;
    variantSets.get(type)?.add(item.variantId);
    locationSets.get(type)?.add(item.locationId);
  }

  const summaries = inventoryTypeValues.map((type) => {
    const summary = summaryMap.get(type);

    if (!summary) {
      return {
        type,
        label: inventoryTypeLabels[type],
        itemCount: 0,
        variantCount: 0,
        locationCount: 0,
      };
    }

    return {
      ...summary,
      variantCount: variantSets.get(type)?.size ?? 0,
      locationCount: locationSets.get(type)?.size ?? 0,
    };
  });

  const activeSummary =
    summaries.find((summary) => summary.type === activeType) ?? summaries[0];

  return {
    totalItems: summaries.reduce((total, summary) => total + summary.itemCount, 0),
    totalVariants: summaries.reduce(
      (total, summary) => total + summary.variantCount,
      0
    ),
    totalLocations: new Set(groupedItems.map((item) => item.locationId)).size,
    activeSummary,
    summaries,
  };
}

export function summarizeInventoryStatuses(
  items: InventoryListItem[]
): InventoryStatusBreakdown {
  return items.reduce<InventoryStatusBreakdown>(
    (totals, item) => {
      totals[item.status] += 1;
      return totals;
    },
    {
      low: 0,
      reorder: 0,
      normal: 0,
    }
  );
}
