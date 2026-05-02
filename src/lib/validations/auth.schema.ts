import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const managedUserRoleSchema = z.enum(["ADMIN", "FACTORY", "CORPORATE"]);

export const createManagedUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  role: managedUserRoleSchema,
  password: z.string().min(8).max(120),
  isActive: z.boolean().default(true),
});

export const updateManagedUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  role: managedUserRoleSchema,
  password: z.string().min(8).max(120).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateManagedUserInput = z.infer<typeof createManagedUserSchema>;
export type UpdateManagedUserInput = z.infer<typeof updateManagedUserSchema>;
