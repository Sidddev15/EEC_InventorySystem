import { z } from "zod";

export const aiSuggestionRequestSchema = z.object({
  type: z.enum([
    "PRODUCT_CREATION",
    "VARIANT_NAMING",
    "UNIT_SUGGESTION",
    "MISSING_FIELD_SUGGESTION",
    "REORDER_INSIGHT",
  ]),
  prompt: z.string().trim().min(1).max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
  fallback: z.string().trim().min(1).max(2000),
});

export const productDuplicateCheckSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.string().trim().optional(),
});

export const variantNameSuggestionSchema = z.object({
  productId: z.string().trim().min(1),
  thickness: z.string().trim().max(50).optional().or(z.literal("")),
  gsm: z.string().trim().max(20).optional().or(z.literal("")),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  inventoryType: z.string().trim().max(80).optional(),
});

export const unitSuggestionSchema = z.object({
  variantName: z.string().trim().max(140).optional().or(z.literal("")),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  inventoryType: z.string().trim().max(80).optional(),
});

export const missingFieldSuggestionSchema = z.object({
  variantName: z.string().trim().max(140).optional().or(z.literal("")),
  thickness: z.string().trim().max(50).optional().or(z.literal("")),
  gsm: z.string().trim().max(20).optional().or(z.literal("")),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  unitCode: z.string().trim().max(40).optional().or(z.literal("")),
  inventoryType: z.string().trim().max(80).optional(),
});

export const reorderInsightSchema = z.object({
  inventoryItemId: z.string().trim().min(1),
});
