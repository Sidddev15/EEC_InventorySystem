import { AuditAction, StockMovementType, TransactionType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { stockInwardSchema } from "@/lib/validations/inventory.schema";

async function nextTransactionNo(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export async function addStockInward(input: unknown, userId?: string) {
  const data = stockInwardSchema.parse(input);

  return db.$transaction(async (tx) => {
    const inventoryItem = await tx.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
      select: {
        id: true,
        quantity: true,
        variantId: true,
        locationId: true,
        variant: {
          select: {
            unitId: true,
          },
        },
      },
    });

    if (!inventoryItem) {
      throw new Error("Inventory item not found.");
    }

    const quantityBefore = inventoryItem.quantity;
    const quantityChange = data.quantity;
    const quantityAfter = quantityBefore.plus(quantityChange);

    const transaction = await tx.inventoryTransaction.create({
      data: {
        transactionNo: await nextTransactionNo("INW"),
        type: TransactionType.INWARD,
        variantId: inventoryItem.variantId,
        locationId: inventoryItem.locationId,
        unitId: inventoryItem.variant.unitId,
        quantity: quantityChange,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        createdByUserId: userId,
      },
      select: { id: true, transactionNo: true },
    });

    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantity: quantityAfter,
      },
    });

    await tx.stockLedger.create({
      data: {
        inventoryItemId: inventoryItem.id,
        variantId: inventoryItem.variantId,
        locationId: inventoryItem.locationId,
        movementType: StockMovementType.INWARD,
        quantityChange,
        quantityBefore,
        quantityAfter,
        inventoryTransactionId: transaction.id,
        notes: data.notes || null,
        createdByUserId: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entityType: "InventoryTransaction",
        entityId: transaction.id,
        after: {
          type: TransactionType.INWARD,
          inventoryItemId: inventoryItem.id,
          quantityBefore: quantityBefore.toString(),
          quantityChange: String(quantityChange),
          quantityAfter: quantityAfter.toString(),
        },
        inventoryTransactionId: transaction.id,
        createdByUserId: userId,
      },
    });

    return transaction;
  });
}
