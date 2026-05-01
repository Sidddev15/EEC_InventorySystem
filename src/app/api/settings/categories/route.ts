import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCategory } from "@/modules/settings/settings.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const category = await createCategory(body);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create category.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
