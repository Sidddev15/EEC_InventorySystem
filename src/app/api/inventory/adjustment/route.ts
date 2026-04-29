import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { adjustStock } from "@/modules/inventory/stock.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as unknown;
    const transaction = await adjustStock(body, user.id);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to adjust stock.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
