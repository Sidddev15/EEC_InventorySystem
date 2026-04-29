import { db } from "@/lib/db";
import {
  createProductSchema,
} from "@/lib/validations/product.schema";
import {
  type ProductCategoryOption,
  type ProductListFilters,
  type ProductListItem,
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
