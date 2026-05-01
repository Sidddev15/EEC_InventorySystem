import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createUnit } from "@/modules/settings/settings.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const unit = await createUnit(body);

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create unit.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
