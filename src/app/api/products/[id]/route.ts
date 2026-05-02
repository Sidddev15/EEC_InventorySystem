import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProductDetail } from "@/modules/product/product.service";

type ProductDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: ProductDetailRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}
