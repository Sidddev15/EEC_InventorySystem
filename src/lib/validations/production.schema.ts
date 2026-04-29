import { z } from "zod";

export const productionReferenceSchema = z.object({
  referenceNo: z.string().trim().min(1).optional(),
});

export const productionEntrySchema = z.object({
  outputInventoryItemId: z.string().trim().min(1),
  outputQuantity: z.coerce.number().positive(),
  referenceNo: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  consumptions: z
    .array(
      z.object({
        inventoryItemId: z.string().trim().min(1),
        quantity: z.coerce.number().positive(),
      })
    )
    .min(1),
});
