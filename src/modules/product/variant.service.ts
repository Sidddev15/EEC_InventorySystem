import { db } from "@/lib/db";
import { createVariantSchema } from "@/lib/validations/product.schema";
import { type UnitOption } from "./product.types";

export async function listUnitOptions(): Promise<UnitOption[]> {
  return db.unit.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
}

export async function createVariant(input: unknown) {
  const data = createVariantSchema.parse(input);

  const duplicate = await db.productVariant.findFirst({
    where: {
      productId: data.productId,
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A variant with this name already exists for the selected product.");
  }

  const stockLocations = await db.location.findMany({
    where: {
      isActive: true,
      isStockHolding: true,
    },
    select: { id: true },
  });

  return db.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: {
        productId: data.productId,
        unitId: data.unitId,
        name: data.name,
        thickness: data.thickness || null,
        gsm: typeof data.gsm === "number" ? data.gsm : null,
        material: data.material || null,
        size: data.size || null,
        inventoryType: data.inventoryType,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (stockLocations.length > 0) {
      await tx.inventoryItem.createMany({
        data: stockLocations.map((location) => ({
          variantId: variant.id,
          locationId: location.id,
        })),
        skipDuplicates: true,
      });
    }

    return variant;
  });
}
