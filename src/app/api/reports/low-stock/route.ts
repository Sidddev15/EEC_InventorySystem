import { NextResponse } from "next/server";
import { csvResponse, requireReportUser } from "../_utils";
import { lowStockCsv } from "@/modules/reporting/report.service";

export async function GET() {
  const user = await requireReportUser();
  if (!user) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return csvResponse(await lowStockCsv(), "low-stock.csv");
}
