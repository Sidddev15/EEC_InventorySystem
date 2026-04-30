import Link from "next/link";
import { Download, Search } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ProductOption } from "@/modules/product/product.types";
import { transactionTypeOptions } from "@/modules/transaction/transaction.service";
import { type TransactionFilters as TransactionFilterValues } from "@/modules/transaction/transaction.types";

type TransactionFiltersProps = {
  filters: TransactionFilterValues;
  products: ProductOption[];
};

const users = [
  { id: "", label: "All users" },
  { id: "admin", label: "Admin User" },
  { id: "factory", label: "Factory User" },
  { id: "corporate", label: "Corporate User" },
];

export function TransactionFilters({
  filters,
  products,
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
      <CardContent className="p-4">
        <form
          action="/transactions"
          className="grid gap-3 lg:grid-cols-[1fr_180px_220px_150px_150px_180px_auto_auto]"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              defaultValue={filters.search}
              name="search"
              placeholder="Search reference, product, variant"
            />
          </div>

          <select
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            defaultValue={filters.type ?? "all"}
            name="type"
          >
            <option value="all">All types</option>
            {transactionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            defaultValue={filters.productId}
            name="productId"
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <Input defaultValue={filters.dateFrom} name="dateFrom" type="date" />
          <Input defaultValue={filters.dateTo} name="dateTo" type="date" />

          <select
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            defaultValue={filters.userId}
            name="userId"
          >
            {users.map((user) => (
              <option key={user.id || "all"} value={user.id}>
                {user.label}
              </option>
            ))}
          </select>

          <Button type="submit">Filter</Button>
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            href={`/api/reports/transactions?${exportParams.toString()}`}
          >
            <Download className="size-4" aria-hidden="true" />
            Export
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
