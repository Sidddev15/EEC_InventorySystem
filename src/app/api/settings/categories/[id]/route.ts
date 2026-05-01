import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateCategory } from "@/modules/settings/settings.service";

type CategoryRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: CategoryRouteContext) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const { id } = await context.params;
    const category = await updateCategory(id, body);

    return NextResponse.json(category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update category.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
