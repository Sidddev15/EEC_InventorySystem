import { db } from "@/lib/db";
import { createProductSchema } from "@/lib/validations/product.schema";
import {
  type ProductCategoryOption,
  type ProductDetail,
  type ProductListFilters,
  type ProductListItem,
  type ProductOption,
  type ProductSearchResult,
} from "./product.types";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function allocateProductSlug(name: string) {
  const baseSlug = toSlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function listProducts(
  filters: ProductListFilters = {}
): Promise<ProductListItem[]> {
  const search = filters.search?.trim();
  const status = filters.status ?? "all";

  const products = await db.product.findMany({
    where: {
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "inactive" ? { isActive: false } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
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
      slug: true,
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
    slug: product.slug,
    category: product.category.name,
    variantsCount: product._count.variants,
    isActive: product.isActive,
  }));
}

export async function listProductCategories(): Promise<ProductCategoryOption[]> {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function listProductOptions(): Promise<ProductOption[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category.name,
  }));
}

export async function searchProductsAndVariants(
  query: string
): Promise<ProductSearchResult[]> {
  const search = query.trim();

  if (!search) {
    return [];
  }

  const [productMatches, variantMatches] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: true,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.productVariant.findMany({
      where: {
        isActive: true,
        name: {
          contains: search,
          mode: "insensitive",
        },
        product: {
          isActive: true,
        },
      },
      orderBy: [{ product: { category: { name: "asc" } } }, { name: "asc" }],
      take: 12,
      select: {
        id: true,
        name: true,
        product: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return [
    ...productMatches.map((product) => ({
      productId: product.id,
      productName: product.name,
      category: product.category.name,
      variantId: null,
      variantName: null,
      matchType: "product" as const,
    })),
    ...variantMatches.map((variant) => ({
      productId: variant.product.id,
      productName: variant.product.name,
      category: variant.product.category.name,
      variantId: variant.id,
      variantName: variant.name,
      matchType: "variant" as const,
    })),
  ].slice(0, 12);
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          thickness: true,
          gsm: true,
          material: true,
          size: true,
          inventoryType: true,
          isActive: true,
          unit: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category.name,
    description: product.description,
    isActive: product.isActive,
    variantsCount: product.variants.length,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      unit: variant.unit.code,
      inventoryType: variant.inventoryType,
      thickness: variant.thickness,
      gsm: variant.gsm,
      material: variant.material,
      size: variant.size,
      isActive: variant.isActive,
    })),
  };
}

export async function createProduct(input: unknown) {
  const data = createProductSchema.parse(input);

  const duplicate = await db.product.findFirst({
    where: {
      categoryId: data.categoryId,
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A product with this name already exists in the selected category.");
  }

  const slug = await allocateProductSlug(data.name);

  return db.product.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description || null,
      isActive: data.isActive,
    },
    select: {
      id: true,
      slug: true,
    },
  });
}
