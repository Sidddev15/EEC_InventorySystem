import { z } from "zod";

export const aiSuggestionRequestSchema = z.object({
  type: z.enum([
    "PRODUCT_CREATION",
    "VARIANT_NAMING",
    "UNIT_SUGGESTION",
    "REORDER_INSIGHT",
  ]),
  prompt: z.string().trim().min(1).max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
  fallback: z.string().trim().min(1).max(2000),
});
