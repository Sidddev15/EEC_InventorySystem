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
  const dateSuffix = new Intl.DateTimeFormat("en-CA").format(new Date());
  const finalFilename = filename.endsWith(".csv")
    ? filename.replace(/\.csv$/, `-${dateSuffix}.csv`)
    : `${filename}-${dateSuffix}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${finalFilename}"`,
    },
  });
}
