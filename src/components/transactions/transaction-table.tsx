import { DataTableShell } from "@/components/ui/data-table-shell";
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
                <TableCell>{transaction.dateTime}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell className="font-medium">{transaction.product}</TableCell>
                <TableCell>{transaction.variant}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{transaction.unit}</TableCell>
                <TableCell>{transaction.source}</TableCell>
                <TableCell>{transaction.destination}</TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell>{transaction.reference}</TableCell>
                <TableCell>{transaction.remarks}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={11}
              >
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
