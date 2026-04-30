import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { suggestUnit } from "@/modules/ai/ai.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    return NextResponse.json(await suggestUnit(body, user.id));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to suggest unit.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
