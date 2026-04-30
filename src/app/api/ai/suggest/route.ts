import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestAiSuggestion } from "@/modules/ai/ai.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Parameters<typeof requestAiSuggestion>[0];
    const result = await requestAiSuggestion({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create AI suggestion.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
