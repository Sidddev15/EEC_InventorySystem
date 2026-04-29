import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createProductionEntry } from "@/modules/production/production.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "FACTORY")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const production = await createProductionEntry(body, user.id);

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to log production.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
