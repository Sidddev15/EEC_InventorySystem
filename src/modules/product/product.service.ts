import { db } from "@/lib/db";
import { type ProductListFilters, type ProductListItem } from "./product.types";

export async function listProducts(
  filters: ProductListFilters = {}
): Promise<ProductListItem[]> {
  const search = filters.search?.trim();
  const status = filters.status ?? "all";

  const products = await db.product.findMany({
    where: {
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "inactive" ? { isActive: false } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                variants: {
                  some: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isActive: true,
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category.name,
    variantsCount: product._count.variants,
    isActive: product.isActive,
  }));
}
