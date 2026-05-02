import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createManagedUser } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const created = await createManagedUser(body);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create user.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
