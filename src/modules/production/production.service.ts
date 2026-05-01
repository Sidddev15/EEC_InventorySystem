import {
  AuditAction,
  StockMovementType,
  TransactionType,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { productionEntrySchema } from "@/lib/validations/production.schema";

async function nextProductionNo() {
  return `PROD-${Date.now()}`;
}

function nextTransactionNo(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function createProductionEntry(input: unknown, userId?: string) {
  const data = productionEntrySchema.parse(input);
  const duplicateConsumptionIds = data.consumptions.reduce<string[]>(
    (duplicates, line, index, lines) => {
      const firstIndex = lines.findIndex(
        (candidate) => candidate.inventoryItemId === line.inventoryItemId
      );

      if (firstIndex !== index && !duplicates.includes(line.inventoryItemId)) {
        duplicates.push(line.inventoryItemId);
      }

      return duplicates;
    },
    []
  );

  if (duplicateConsumptionIds.length > 0) {
    throw new Error(
      "Each consumed material can be added only once per production entry."
    );
  }

  return db.$transaction(async (tx) => {
    const outputItem = await tx.inventoryItem.findUnique({
      where: { id: data.outputInventoryItemId },
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

    if (!outputItem) {
      throw new Error("Output inventory item not found.");
    }

    const consumptionItems = await tx.inventoryItem.findMany({
      where: {
        id: {
          in: data.consumptions.map((line) => line.inventoryItemId),
        },
      },
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
    const consumptionById = new Map(
      consumptionItems.map((item) => [item.id, item])
    );

    for (const line of data.consumptions) {
      const item = consumptionById.get(line.inventoryItemId);

      if (!item) {
        throw new Error("Consumed inventory item not found.");
      }

      if (item.quantity.minus(line.quantity).isNegative()) {
        throw new Error("Production cannot consume more stock than available.");
      }
    }

    const productionEntry = await tx.productionEntry.create({
      data: {
        productionNo: await nextProductionNo(),
        outputVariantId: outputItem.variantId,
        outputLocationId: outputItem.locationId,
        outputUnitId: outputItem.variant.unitId,
        outputQuantity: data.outputQuantity,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        createdByUserId: userId,
      },
      select: {
        id: true,
        productionNo: true,
      },
    });

    for (const line of data.consumptions) {
      const item = consumptionById.get(line.inventoryItemId);

      if (!item) {
        throw new Error("Consumed inventory item not found.");
      }

      const quantityBefore = item.quantity;
      const quantityAfter = quantityBefore.minus(line.quantity);
      const quantityChange = -line.quantity;

      await tx.productionConsumption.create({
        data: {
          productionEntryId: productionEntry.id,
          variantId: item.variantId,
          locationId: item.locationId,
          unitId: item.variant.unitId,
          quantity: line.quantity,
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          transactionNo: nextTransactionNo("PCN"),
          type: TransactionType.PRODUCTION_CONSUMPTION,
          variantId: item.variantId,
          locationId: item.locationId,
          unitId: item.variant.unitId,
          quantity: quantityChange,
          referenceNo: data.referenceNo || productionEntry.productionNo,
          notes: data.notes || "Production consumption",
          productionEntryId: productionEntry.id,
          createdByUserId: userId,
        },
        select: { id: true },
      });

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { quantity: quantityAfter },
      });

      await tx.stockLedger.create({
        data: {
          inventoryItemId: item.id,
          variantId: item.variantId,
          locationId: item.locationId,
          movementType: StockMovementType.PRODUCTION_CONSUMPTION,
          quantityChange,
          quantityBefore,
          quantityAfter,
          inventoryTransactionId: transaction.id,
          productionEntryId: productionEntry.id,
          notes: data.notes || null,
          createdByUserId: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.UPDATE,
          entityType: "InventoryItem",
          entityId: item.id,
          before: {
            quantity: quantityBefore.toString(),
          },
          after: {
            quantity: quantityAfter.toString(),
            movementType: StockMovementType.PRODUCTION_CONSUMPTION,
            quantityChange: String(quantityChange),
            referenceNo: data.referenceNo || productionEntry.productionNo,
          },
          inventoryTransactionId: transaction.id,
          productionEntryId: productionEntry.id,
          createdByUserId: userId,
        },
      });
    }

    const outputBefore = outputItem.quantity;
    const outputAfter = outputBefore.plus(data.outputQuantity);

    const outputTransaction = await tx.inventoryTransaction.create({
      data: {
        transactionNo: nextTransactionNo("POU"),
        type: TransactionType.PRODUCTION_OUTPUT,
        variantId: outputItem.variantId,
        locationId: outputItem.locationId,
        unitId: outputItem.variant.unitId,
        quantity: data.outputQuantity,
        referenceNo: data.referenceNo || productionEntry.productionNo,
        notes: data.notes || "Production output",
        productionEntryId: productionEntry.id,
        createdByUserId: userId,
      },
      select: { id: true },
    });

    await tx.inventoryItem.update({
      where: { id: outputItem.id },
      data: { quantity: outputAfter },
    });

    await tx.stockLedger.create({
      data: {
        inventoryItemId: outputItem.id,
        variantId: outputItem.variantId,
        locationId: outputItem.locationId,
        movementType: StockMovementType.PRODUCTION_OUTPUT,
        quantityChange: data.outputQuantity,
        quantityBefore: outputBefore,
        quantityAfter: outputAfter,
        inventoryTransactionId: outputTransaction.id,
        productionEntryId: productionEntry.id,
        notes: data.notes || null,
        createdByUserId: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entityType: "InventoryItem",
        entityId: outputItem.id,
        before: {
          quantity: outputBefore.toString(),
        },
        after: {
          quantity: outputAfter.toString(),
          movementType: StockMovementType.PRODUCTION_OUTPUT,
          quantityChange: String(data.outputQuantity),
          referenceNo: data.referenceNo || productionEntry.productionNo,
        },
        inventoryTransactionId: outputTransaction.id,
        productionEntryId: productionEntry.id,
        createdByUserId: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entityType: "ProductionEntry",
        entityId: productionEntry.id,
        after: {
          outputInventoryItemId: outputItem.id,
          outputQuantity: String(data.outputQuantity),
          consumptions: data.consumptions,
        },
        productionEntryId: productionEntry.id,
        createdByUserId: userId,
      },
    });

    return productionEntry;
  });
}
