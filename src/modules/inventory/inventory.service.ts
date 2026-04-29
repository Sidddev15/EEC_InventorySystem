import { InventoryType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  type InventoryItemOption,
  type InventoryListItem,
  type InventoryStockStatus,
  type InventoryTab,
} from "./inventory.types";

const inventoryTypeValues = Object.values(InventoryType);

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
