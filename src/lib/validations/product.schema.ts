import { z } from "zod";

export const productBaseSchema = z.object({
  name: z.string().trim().min(1),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.string().trim().min(1),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createVariantSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(140),
  thickness: z.string().trim().max(50).optional().or(z.literal("")),
  gsm: z.coerce.number().int().positive().optional().or(z.literal("")),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  unitId: z.string().trim().min(1),
  inventoryType: z.enum(["RAW_MATERIAL", "SEMI_FINISHED", "FINISHED_GOODS"]),
  isActive: z.boolean().default(true),
});
