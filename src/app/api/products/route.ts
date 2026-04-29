import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createProduct } from "@/modules/product/product.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const product = await createProduct(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create product.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
