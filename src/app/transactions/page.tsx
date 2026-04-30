import { PageHeader } from "@/components/layout/page-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { requireUser } from "@/lib/auth";
import { listProductOptions } from "@/modules/product/product.service";
import { listTransactions } from "@/modules/transaction/transaction.service";
import { type TransactionFilters as TransactionFilterValues } from "@/modules/transaction/transaction.types";

type TransactionsPageProps = {
  searchParams: Promise<{
    search?: string;
    type?: TransactionFilterValues["type"];
    productId?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  await requireUser();
  const params = await searchParams;
  const filters: TransactionFilterValues = {
    search: params.search,
    type: params.type ?? "all",
    productId: params.productId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    userId: params.userId,
  };
  const [transactions, products] = await Promise.all([
    listTransactions(filters),
    listProductOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Audit inventory movement by product, type, date, and user."
      />

      <TransactionFilters filters={filters} products={products} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
