import { type UserRole } from "@/lib/constants/roles";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  FACTORY: "/dashboard",
  CORPORATE: "/dashboard",
};

export const ROLE_ALLOWED_PATHS: Record<UserRole, readonly string[]> = {
  ADMIN: [
    "/dashboard",
    "/products",
    "/api/products",
    "/api/variants",
    "/inventory",
    "/production",
    "/transactions",
    "/reports",
    "/settings",
  ],
  FACTORY: ["/dashboard", "/inventory", "/production", "/transactions"],
  CORPORATE: ["/dashboard", "/inventory", "/transactions", "/reports"],
};

export function canAccessPath(role: UserRole, pathname: string) {
  return ROLE_ALLOWED_PATHS[role].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
