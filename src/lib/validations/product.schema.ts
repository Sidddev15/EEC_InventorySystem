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
