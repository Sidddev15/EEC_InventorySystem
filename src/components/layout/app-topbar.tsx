import { Plus, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { type AuthenticatedUser } from "@/lib/auth";

type AppTopbarProps = {
  user: AuthenticatedUser;
};

export function AppTopbar({ user }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-card">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex h-9 max-w-md items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground">
            <Search className="size-4" aria-hidden="true" />
            <span className="truncate">Search products, variants, stock</span>
          </div>
        </div>

        <Button size="lg">
          <Plus className="size-4" aria-hidden="true" />
          Factory Action
        </Button>

        <div className="hidden border-l pl-3 text-right sm:block">
          <p className="text-sm font-medium leading-5">{user.name}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
