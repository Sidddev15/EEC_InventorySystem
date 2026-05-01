import Link from "next/link";
import { Download, Funnel, RotateCcw, Search } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerField } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type ProductOption } from "@/modules/product/product.types";
import { transactionTypeOptions } from "@/modules/transaction/transaction.service";
import {
  type TransactionFilters as TransactionFilterValues,
  type TransactionUserOption,
} from "@/modules/transaction/transaction.types";

type TransactionFiltersProps = {
  filters: TransactionFilterValues;
  products: ProductOption[];
  users: TransactionUserOption[];
};

export function TransactionFilters({
  filters,
  products,
  users,
}: TransactionFiltersProps) {
  const exportParams = new URLSearchParams();

  if (filters.search) exportParams.set("search", filters.search);
  if (filters.type && filters.type !== "all") exportParams.set("type", filters.type);
  if (filters.productId) exportParams.set("productId", filters.productId);
  if (filters.userId) exportParams.set("userId", filters.userId);
  if (filters.dateFrom) exportParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) exportParams.set("dateTo", filters.dateTo);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">Filter transaction log</p>
          <p className="text-sm text-muted-foreground">
            Narrow by movement type, product, date, or user before exporting.
          </p>
        </div>
        <form
          action="/transactions"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_200px_140px_140px_200px] 2xl:grid-cols-[minmax(240px,1.2fr)_170px_210px_140px_140px_210px_auto]"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                defaultValue={filters.search}
                name="search"
                placeholder="Reference, product, variant, remarks"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Type
            </label>
            <SelectField
              defaultValue={filters.type ?? "all"}
              name="type"
              options={[
                { value: "all", label: "All types" },
                ...transactionTypeOptions.map((type) => ({
                  value: type,
                  label: type.replaceAll("_", " "),
                })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product
            </label>
            <SelectField
              defaultValue={filters.productId}
              name="productId"
              options={[
                { value: "", label: "All products" },
                ...products.map((product) => ({
                  value: product.id,
                  label: product.name,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <DatePickerField
              defaultValue={filters.dateFrom}
              name="dateFrom"
              placeholder="From date"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              To
            </label>
            <DatePickerField
              defaultValue={filters.dateTo}
              name="dateTo"
              placeholder="To date"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User
            </label>
            <SelectField
              defaultValue={filters.userId}
              name="userId"
              options={[
                { value: "", label: "All users" },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.label,
                })),
              ]}
            />
          </div>

          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-full 2xl:col-span-1 2xl:justify-end">
            <Button
              aria-label="Apply filters"
              className="self-end"
              size="icon-sm"
              title="Apply filters"
              type="submit"
            >
              <Funnel className="size-4" aria-hidden="true" />
            </Button>
            <Link
              aria-label="Export transactions"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "self-end"
              )}
              href={`/api/reports/transactions?${exportParams.toString()}`}
              title="Export transactions"
            >
              <Download className="size-4" aria-hidden="true" />
            </Link>
            <Link
              aria-label="Reset filters"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "self-end"
              )}
              href="/transactions"
              title="Reset filters"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
