import { z } from "zod";

export const productionReferenceSchema = z.object({
  referenceNo: z.string().trim().min(1).optional(),
});
