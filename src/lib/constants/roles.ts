export const USER_ROLES = ["ADMIN", "FACTORY", "CORPORATE"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  FACTORY: "Factory",
  CORPORATE: "Corporate",
};
