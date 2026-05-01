import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateLocation } from "@/modules/settings/settings.service";

type LocationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: LocationRouteContext) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const { id } = await context.params;
    const location = await updateLocation(id, body);

    return NextResponse.json(location);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update location.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
