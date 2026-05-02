import { Badge } from "@/components/ui/badge";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type TransactionLogItem } from "@/modules/transaction/transaction.types";

type TransactionTableProps = {
  transactions: TransactionLogItem[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <DataTableShell
      title="Transaction Log"
      description="Every inventory movement recorded through transaction, production, ledger, and audit paths."
    >
      <Table className="min-w-[1220px]">
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Item/Product</TableHead>
            <TableHead>Variant/Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{transaction.dateTime}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {transaction.reference}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      transaction.rawType === "INWARD" &&
                        "border-emerald-200 bg-emerald-50 text-emerald-700",
                      transaction.rawType === "OUTWARD" &&
                        "border-amber-200 bg-amber-50 text-amber-700",
                      transaction.rawType === "ADJUSTMENT" &&
                        "border-slate-200 bg-slate-50 text-slate-700",
                      transaction.rawType === "PRODUCTION_OUTPUT" &&
                        "border-blue-200 bg-blue-50 text-blue-700",
                      transaction.rawType === "PRODUCTION_CONSUMPTION" &&
                        "border-violet-200 bg-violet-50 text-violet-700"
                    )}
                    variant="outline"
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{transaction.product}</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {transaction.reference}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-600">
                  {transaction.variant}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-semibold tabular-nums",
                    transaction.signedQuantity > 0 && "text-emerald-700",
                    transaction.signedQuantity < 0 && "text-rose-700"
                  )}
                >
                  {transaction.signedQuantity > 0 ? "+" : ""}
                  {transaction.quantity}
                </TableCell>
                <TableCell>{transaction.unit}</TableCell>
                <TableCell className="text-muted-foreground">{transaction.source}</TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.destination}
                </TableCell>
                <TableCell>
                  <div className="max-w-48">
                    <p className="truncate font-medium text-foreground">{transaction.user}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-72 whitespace-normal text-sm leading-5 text-muted-foreground">
                  {transaction.remarks || "No remarks"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="p-0"
                colSpan={10}
              >
                <EmptyState
                  title="No transactions found"
                  description="Inventory movements will appear here after inward, adjustment, production, or dispatch entries."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
