import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchProductsAndVariants } from "@/modules/product/product.service";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const results = await searchProductsAndVariants(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { message: "Unable to search products and variants." },
      { status: 400 }
    );
  }
}
