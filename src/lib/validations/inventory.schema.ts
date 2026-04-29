import { z } from "zod";

export const quantitySchema = z.number().positive();
