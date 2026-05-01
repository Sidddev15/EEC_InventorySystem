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
      <Table>
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
            <TableHead>Reference</TableHead>
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
                    <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{transaction.product}</p>
                    <p className="text-xs text-muted-foreground">{transaction.variant}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{transaction.variant}</TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {transaction.quantity}
                </TableCell>
                <TableCell>{transaction.unit}</TableCell>
                <TableCell className="text-muted-foreground">{transaction.source}</TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.destination}
                </TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {transaction.reference}
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal text-sm leading-5 text-muted-foreground">
                  {transaction.remarks || "No remarks"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="p-0"
                colSpan={11}
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
