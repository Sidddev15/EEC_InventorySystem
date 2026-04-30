import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkProductDuplicateName } from "@/modules/ai/ai.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const result = await checkProductDuplicateName(body, user.id);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to check duplicate name.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
