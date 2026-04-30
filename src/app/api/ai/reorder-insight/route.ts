import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReorderInsight } from "@/modules/ai/ai.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    return NextResponse.json(await getReorderInsight(body, user.id));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create reorder insight.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
