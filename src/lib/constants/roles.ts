export const USER_ROLES = ["admin", "manager", "operator"] as const;

export type UserRole = (typeof USER_ROLES)[number];
