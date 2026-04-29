import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createVariant } from "@/modules/product/variant.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const variant = await createVariant(body);

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create variant.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
