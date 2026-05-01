import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalText,
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalText,
  isActive: z.boolean(),
});

export const unitTypeSchema = z.enum(["COUNT", "ROLL", "AREA", "WEIGHT", "LENGTH"]);

export const createUnitSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  unitType: unitTypeSchema,
  conversionFactor: z.coerce.number().positive().max(999999).optional().or(z.literal("")),
  description: optionalText,
  isActive: z.boolean().default(true),
});

export const updateUnitSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  unitType: unitTypeSchema,
  conversionFactor: z.coerce.number().positive().max(999999).optional().or(z.literal("")),
  description: optionalText,
  isActive: z.boolean(),
});

export const locationTypeSchema = z.enum(["STOCK_HOLDING", "REPORTING_ONLY"]);

export const createLocationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  locationType: locationTypeSchema,
  description: optionalText,
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  locationType: locationTypeSchema,
  description: optionalText,
  isActive: z.boolean(),
});
