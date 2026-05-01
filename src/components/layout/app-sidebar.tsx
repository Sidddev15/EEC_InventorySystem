"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Factory,
  Grid2X2,
  LayoutDashboard,
  Package,
  Settings,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { ROLE_ALLOWED_PATHS } from "@/lib/authz";
import { type UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

const sidebarItems: Array<{
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Factory",
    href: "/factory",
    icon: Grid2X2,
  },
  {
    title: "Products",
    href: "/products",
    icon: Tags,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Production",
    href: "/production",
    icon: Factory,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ClipboardList,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: Package,
  },
  {
    title: "Master Data",
    href: "/settings/categories",
    icon: SlidersHorizontal,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    exact: true,
  },
];

const mobileNavItems = ["/dashboard", "/products", "/inventory", "/production", "/transactions"];

type AppSidebarProps = {
  role: UserRole;
};

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const allowedPaths = ROLE_ALLOWED_PATHS[role];
  const visibleItems = sidebarItems.filter((item) =>
    allowedPaths.some(
      (path) => item.href === path || item.href.startsWith(`${path}/`)
    )
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="border-b border-sidebar-border px-5 py-6">
          <p className="text-base font-semibold tracking-normal text-white">
            EEC Inventory System
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Industrial filter stock control
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white",
                  isActive && "border-blue-500/40 bg-primary text-white shadow-sm"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 py-2 text-slate-700 shadow-sm md:hidden">
        <div className="flex items-center justify-around gap-1">
          {visibleItems
            .filter((item) => mobileNavItems.includes(item.href))
            .map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-500",
                  isActive && "bg-blue-50 text-blue-700"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
