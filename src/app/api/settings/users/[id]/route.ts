import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateManagedUser } from "@/modules/auth/auth.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as unknown;
    const updated = await updateManagedUser(id, body, user.id);

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update user.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
