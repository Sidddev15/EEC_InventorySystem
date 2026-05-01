"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Share2 } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { type AuthenticatedUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AppTopbarProps = {
  user: AuthenticatedUser;
};

const titleMap = [
  { prefix: "/factory", title: "Factory Panel" },
  { prefix: "/dashboard", title: "Dashboard" },
  { prefix: "/products", title: "Products" },
  { prefix: "/inventory", title: "Inventory" },
  { prefix: "/production", title: "Production" },
  { prefix: "/transactions", title: "Transactions" },
  { prefix: "/reports", title: "Reports" },
  { prefix: "/settings", title: "Settings" },
];

function resolveTitle(pathname: string) {
  return (
    titleMap.find((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`))
      ?.title ?? "EEC Inventory System"
  );
}

export function AppTopbar({ user }: AppTopbarProps) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
            href="/products"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">Search</span>
          </Link>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        <div className="min-w-0 text-center">
          <p className="truncate text-xl font-semibold text-slate-900">{title}</p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
            type="button"
            onClick={async () => {
              if (typeof navigator === "undefined") {
                return;
              }

              if (navigator.share) {
                await navigator.share({
                  title,
                  url: window.location.href,
                });
                return;
              }

              await navigator.clipboard.writeText(window.location.href);
            }}
          >
            <Share2 className="size-4" aria-hidden="true" />
            <span className="sr-only">Share page</span>
          </button>
          <button
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
            type="button"
          >
            <Bell className="size-4" aria-hidden="true" />
            <span className="sr-only">Notifications</span>
          </button>
          <Link className={cn(buttonVariants({ size: "default" }))} href="/factory">
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Factory</span>
            <span className="sm:hidden">Open</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
