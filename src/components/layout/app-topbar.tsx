"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { LoaderCircle, Search, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { type AuthenticatedUser } from "@/lib/auth";
import { type ProductSearchResult } from "@/modules/product/product.types";

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

function SearchResultModal({
  open,
  query,
  results,
  isLoading,
  canOpenProductMaster,
  onClose,
}: {
  open: boolean;
  query: string;
  results: ProductSearchResult[];
  isLoading: boolean;
  canOpenProductMaster: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 bg-slate-950/35 px-4 py-6" onClick={onClose}>
      <div
        aria-describedby="global-search-description"
        aria-labelledby="global-search-title"
        aria-modal="true"
        className="mx-auto mt-20 w-full max-w-3xl rounded-xl border bg-card shadow-sm"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground" id="global-search-title">
              Search products and variants
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-muted-foreground"
              id="global-search-description"
            >
              Results for <span className="font-medium text-slate-900">{query}</span>
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Loading results
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => {
                const href = `/products/${result.productId}`;
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {result.productName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {result.category}
                        </p>
                      </div>
                      <span
                        className={
                          result.matchType === "variant"
                            ? "rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700"
                            : "rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                        }
                      >
                        {result.matchType === "variant" ? "Variant match" : "Product match"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {result.variantName ?? "Parent product match"}
                    </p>
                  </>
                );

                if (!canOpenProductMaster) {
                  return (
                    <div
                      className="rounded-xl border border-slate-200 bg-white p-4"
                      key={`${result.matchType}-${result.variantId ?? result.productId}`}
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                    href={href}
                    key={`${result.matchType}-${result.variantId ?? result.productId}`}
                    onClick={onClose}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              No product found
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function GlobalSearch({
  user,
}: {
  user: AuthenticatedUser;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const canOpenProductMaster = user.role === "ADMIN";

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setResults([]);
          return;
        }

        const data = (await response.json()) as { results?: ProductSearchResult[] };
        setResults(data.results ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="bg-background pl-9"
          placeholder="Search products and variants"
          type="search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);

            if (nextQuery.trim()) {
              setOpen(true);
            } else {
              setOpen(false);
              setResults([]);
              setIsLoading(false);
            }
          }}
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
        />
      </div>

      <SearchResultModal
        canOpenProductMaster={canOpenProductMaster}
        isLoading={isLoading}
        open={open}
        query={query.trim()}
        results={results}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export function AppTopbar({ user }: AppTopbarProps) {
  const pathname = usePathname();
  const title = useMemo(() => resolveTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6">
        <div className="hidden min-w-0 sm:block">
          <div className="max-w-sm">
            <GlobalSearch user={user} />
          </div>
        </div>

        <div className="min-w-0 text-center">
          <p className="truncate text-xl font-semibold text-slate-900">{title}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="border-t px-4 py-3 sm:hidden">
        <GlobalSearch user={user} />
      </div>
    </header>
  );
}
