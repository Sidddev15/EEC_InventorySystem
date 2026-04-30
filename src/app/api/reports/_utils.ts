import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireReportUser() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "CORPORATE")) {
    return null;
  }

  return user;
}

export function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
