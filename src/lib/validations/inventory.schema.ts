import { z } from "zod";

export const quantitySchema = z.number().positive();

export const stockInwardSchema = z.object({
  inventoryItemId: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  referenceNo: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type StockInwardInput = z.infer<typeof stockInwardSchema>;
