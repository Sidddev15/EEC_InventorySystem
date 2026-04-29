import { z } from "zod";

export const productBaseSchema = z.object({
  name: z.string().trim().min(1),
});
