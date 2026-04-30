import { NextResponse } from "next/server";
import { csvResponse, requireReportUser } from "../_utils";
import { consumptionSummaryCsv } from "@/modules/reporting/report.service";

export async function GET() {
  const user = await requireReportUser();
  if (!user) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return csvResponse(await consumptionSummaryCsv(), "consumption-summary.csv");
}
