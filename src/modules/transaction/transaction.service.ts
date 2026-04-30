import { TransactionType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { type TransactionFilters, type TransactionLogItem } from "./transaction.types";

const userLabels: Record<string, string> = {
  admin: "Admin User",
  factory: "Factory User",
  corporate: "Corporate User",
};

export const transactionTypeOptions = Object.values(TransactionType);

function parseDate(value?: string, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatQuantity(value: { toString(): string }) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 3,
  }).format(Number(value.toString()));
}

function movementSource(type: TransactionType, location: string) {
  if (
    type === TransactionType.OUTWARD ||
    type === TransactionType.PRODUCTION_CONSUMPTION
  ) {
    return location;
  }

  if (type === TransactionType.ADJUSTMENT) {
    return "Adjustment";
  }

  return "External";
}

function movementDestination(type: TransactionType, location: string) {
  if (
    type === TransactionType.INWARD ||
    type === TransactionType.PRODUCTION_OUTPUT
  ) {
    return location;
  }

  if (type === TransactionType.ADJUSTMENT) {
    return "Adjusted Stock";
  }

  return "External";
}

export async function listTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionLogItem[]> {
  const search = filters.search?.trim();
  const type = filters.type && filters.type !== "all" ? filters.type : undefined;
  const dateFrom = parseDate(filters.dateFrom);
  const dateTo = parseDate(filters.dateTo, true);

  const transactions = await db.inventoryTransaction.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(filters.productId ? { variant: { productId: filters.productId } } : {}),
      ...(filters.userId ? { createdByUserId: filters.userId } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { transactionNo: { contains: search, mode: "insensitive" } },
              { referenceNo: { contains: search, mode: "insensitive" } },
              { notes: { contains: search, mode: "insensitive" } },
              { variant: { name: { contains: search, mode: "insensitive" } } },
              {
                variant: {
                  product: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      createdAt: true,
      type: true,
      quantity: true,
      referenceNo: true,
      notes: true,
      transactionNo: true,
      createdByUserId: true,
      unit: {
        select: {
          code: true,
        },
      },
      location: {
        select: {
          name: true,
        },
      },
      productionEntry: {
        select: {
          productionNo: true,
        },
      },
      variant: {
        select: {
          name: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    dateTime: formatDateTime(transaction.createdAt),
    type: transaction.type.replaceAll("_", " "),
    product: transaction.variant.product.name,
    variant: transaction.variant.name,
    quantity: formatQuantity(transaction.quantity),
    unit: transaction.unit.code,
    source: movementSource(transaction.type, transaction.location.name),
    destination: movementDestination(transaction.type, transaction.location.name),
    user: transaction.createdByUserId
      ? userLabels[transaction.createdByUserId] ?? transaction.createdByUserId
      : "System",
    reference:
      transaction.referenceNo ??
      transaction.productionEntry?.productionNo ??
      transaction.transactionNo,
    remarks: transaction.notes ?? "",
  }));
}
