import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { type AuthenticatedUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AppTopbarProps = {
  user: AuthenticatedUser;
};

export function AppTopbar({ user }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <div className="hidden min-w-0 flex-1 sm:block">
          <form className="relative max-w-md" action="/products">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="bg-background pl-9"
              name="q"
              placeholder="Search products, variants, stock"
              type="search"
            />
          </form>
        </div>

        <Link
          className={cn(buttonVariants({ size: "lg" }), "ml-auto sm:ml-0")}
          href="/factory"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Factory Action</span>
          <span className="sm:hidden">Action</span>
        </Link>

        <div className="hidden border-l pl-3 text-right sm:block">
          <p className="text-sm font-medium leading-5 text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
