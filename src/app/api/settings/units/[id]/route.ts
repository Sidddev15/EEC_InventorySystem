import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUnit } from "@/modules/settings/settings.service";

type UnitRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: UnitRouteContext) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const { id } = await context.params;
    const unit = await updateUnit(id, body);

    return NextResponse.json(unit);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update unit.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
