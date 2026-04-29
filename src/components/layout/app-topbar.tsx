import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppTopbar() {
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
      </div>
    </header>
  );
}
