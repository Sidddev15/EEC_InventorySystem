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
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="border-b border-sidebar-border px-5 py-4">
          <p className="text-sm font-semibold tracking-normal text-white">
            EEC Inventory
          </p>
          <p className="mt-1 text-xs text-slate-300">Factory stock control</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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
                  "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-sidebar-accent hover:text-white",
                  isActive && "bg-sidebar-accent text-white"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border bg-sidebar px-2 py-2 text-sidebar-foreground shadow-lg lg:hidden">
        <div className="flex gap-1 overflow-x-auto pb-1">
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
                  "flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-300",
                  isActive && "bg-sidebar-accent text-white"
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
