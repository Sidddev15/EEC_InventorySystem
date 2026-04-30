import { NextRequest, NextResponse } from "next/server";
import { csvResponse, requireReportUser } from "../_utils";
import { transactionHistoryCsv } from "@/modules/reporting/report.service";
import { type TransactionFilters } from "@/modules/transaction/transaction.types";

export async function GET(request: NextRequest) {
  const user = await requireReportUser();
  if (!user) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const filters: TransactionFilters = {
    search: params.get("search") ?? undefined,
    type: (params.get("type") as TransactionFilters["type"]) ?? "all",
    productId: params.get("productId") ?? undefined,
    userId: params.get("userId") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
  };

  return csvResponse(await transactionHistoryCsv(filters), "transaction-history.csv");
}
