import { type UserRole } from "@/lib/constants/roles";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  FACTORY: "/factory",
  CORPORATE: "/dashboard",
};

export const ROLE_ALLOWED_PATHS: Record<UserRole, readonly string[]> = {
  ADMIN: [
    "/dashboard",
    "/factory",
    "/api/ai/reorder-insight",
    "/products",
    "/api/products",
    "/api/products/search",
    "/api/variants",
    "/api/ai",
    "/api/inventory",
    "/inventory",
    "/production",
    "/api/production",
    "/transactions",
    "/reports",
    "/api/reports",
    "/settings",
    "/api/settings",
  ],
  FACTORY: [
    "/dashboard",
    "/factory",
    "/api/products/search",
    "/inventory",
    "/api/inventory/inward",
    "/production",
    "/api/production",
    "/transactions",
  ],
  CORPORATE: [
    "/dashboard",
    "/api/products/search",
    "/inventory",
    "/transactions",
    "/reports",
    "/api/reports",
    "/api/ai/reorder-insight",
  ],
};

export function canAccessPath(role: UserRole, pathname: string) {
  return ROLE_ALLOWED_PATHS[role].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
