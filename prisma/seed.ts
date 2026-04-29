import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, InventoryType } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  "Paint Booth Filters",
  "HEPA Filters",
  "Pre Filters",
  "Pocket Filters",
  "Filter Media",
  "Carbon Filters",
  "Dust Collector Filters",
  "AHU Filters",
];

const units = [
  { code: "NOS", name: "Numbers", description: "Piece-count stock unit" },
  { code: "Roll", name: "Roll", description: "Filter media rolls" },
  { code: "Sq Ft", name: "Square Feet", description: "Area measured in square feet" },
  { code: "Sq Meter", name: "Square Meter", description: "Area measured in square meters" },
  { code: "Kg", name: "Kilogram", description: "Weight-based raw material stock" },
  { code: "Meter", name: "Meter", description: "Linear media and gasket measurement" },
];

const locations = [
  {
    name: "Factory Store",
    description: "Primary raw material and bought-out item storage",
    isStockHolding: true,
  },
  {
    name: "Production Floor",
    description: "Material issued for active filter manufacturing",
    isStockHolding: true,
  },
  {
    name: "Finished Goods Store",
    description: "Packed filters ready for dispatch",
    isStockHolding: true,
  },
  {
    name: "Dispatch Area",
    description: "Outgoing material staging area",
    isStockHolding: true,
  },
  {
    name: "Corporate View",
    description: "Non-stock reporting location for management visibility",
    isStockHolding: false,
  },
];

const productSeeds = [
  {
    category: "Paint Booth Filters",
    name: "Paint Booth Filter",
    variants: [
      { name: "Floor Filter 50mm", unit: "Sq Meter", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "50", reorderLevel: "75" },
      { name: "Floor Filter 100mm", unit: "Sq Meter", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "35", reorderLevel: "60" },
      { name: "Ceiling Filter", unit: "Sq Meter", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "40", reorderLevel: "70" },
    ],
  },
  {
    category: "HEPA Filters",
    name: "HEPA Filter",
    variants: [
      { name: "HEPA Box Filter H13", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "10", reorderLevel: "20" },
      { name: "HEPA Terminal Filter H14", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "8", reorderLevel: "15" },
    ],
  },
  {
    category: "Pre Filters",
    name: "Pre Filter",
    variants: [
      { name: "Panel Pre Filter G4", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "50", reorderLevel: "100" },
      { name: "Pleated Pre Filter", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "40", reorderLevel: "80" },
    ],
  },
  {
    category: "Pocket Filters",
    name: "Pocket Filter",
    variants: [
      { name: "Pocket Filter F7", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "25", reorderLevel: "50" },
      { name: "Pocket Filter F9", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "20", reorderLevel: "40" },
    ],
  },
  {
    category: "Filter Media",
    name: "Filter Media",
    variants: [
      { name: "Synthetic Filter Media Roll", unit: "Roll", inventoryType: InventoryType.RAW_MATERIAL, minStockLevel: "5", reorderLevel: "10" },
      { name: "Glass Fiber Media", unit: "Sq Meter", inventoryType: InventoryType.RAW_MATERIAL, minStockLevel: "100", reorderLevel: "200" },
    ],
  },
  {
    category: "Carbon Filters",
    name: "Activated Carbon Filter",
    variants: [
      { name: "Carbon Filter Pad", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "30", reorderLevel: "60" },
      { name: "Activated Carbon Granules", unit: "Kg", inventoryType: InventoryType.RAW_MATERIAL, minStockLevel: "100", reorderLevel: "150" },
    ],
  },
  {
    category: "Dust Collector Filters",
    name: "Dust Collector Filter",
    variants: [
      { name: "Dust Collector Cartridge", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "15", reorderLevel: "30" },
      { name: "Dust Collector Bag", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "20", reorderLevel: "40" },
    ],
  },
  {
    category: "AHU Filters",
    name: "AHU Filter",
    variants: [
      { name: "AHU Fine Filter", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "25", reorderLevel: "50" },
      { name: "AHU Washable Filter", unit: "NOS", inventoryType: InventoryType.FINISHED_GOODS, minStockLevel: "25", reorderLevel: "50" },
    ],
  },
];

async function main() {
  const categoryByName = new Map<string, { id: string }>();
  const unitByCode = new Map<string, { id: string }>();
  const stockLocations: Array<{ id: string }> = [];

  for (const name of categories) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name },
      select: { id: true },
    });
    categoryByName.set(name, category);
  }

  for (const unitSeed of units) {
    const unit = await prisma.unit.upsert({
      where: { code: unitSeed.code },
      update: {
        name: unitSeed.name,
        description: unitSeed.description,
        isActive: true,
      },
      create: unitSeed,
      select: { id: true },
    });
    unitByCode.set(unitSeed.code, unit);
  }

  for (const locationSeed of locations) {
    const location = await prisma.location.upsert({
      where: { name: locationSeed.name },
      update: {
        description: locationSeed.description,
        isStockHolding: locationSeed.isStockHolding,
        isActive: true,
      },
      create: locationSeed,
      select: { id: true, isStockHolding: true },
    });

    if (location.isStockHolding) {
      stockLocations.push(location);
    }
  }

  for (const productSeed of productSeeds) {
    const category = categoryByName.get(productSeed.category);
    if (!category) {
      throw new Error(`Missing category: ${productSeed.category}`);
    }

    const product = await prisma.product.upsert({
      where: {
        categoryId_name: {
          categoryId: category.id,
          name: productSeed.name,
        },
      },
      update: { isActive: true },
      create: {
        categoryId: category.id,
        name: productSeed.name,
      },
      select: { id: true },
    });

    for (const variantSeed of productSeed.variants) {
      const unit = unitByCode.get(variantSeed.unit);
      if (!unit) {
        throw new Error(`Missing unit: ${variantSeed.unit}`);
      }

      const variant = await prisma.productVariant.upsert({
        where: {
          productId_name: {
            productId: product.id,
            name: variantSeed.name,
          },
        },
        update: {
          unitId: unit.id,
          inventoryType: variantSeed.inventoryType,
          minStockLevel: variantSeed.minStockLevel,
          reorderLevel: variantSeed.reorderLevel,
          isActive: true,
        },
        create: {
          productId: product.id,
          unitId: unit.id,
          name: variantSeed.name,
          inventoryType: variantSeed.inventoryType,
          minStockLevel: variantSeed.minStockLevel,
          reorderLevel: variantSeed.reorderLevel,
        },
        select: { id: true },
      });

      for (const location of stockLocations) {
        await prisma.inventoryItem.upsert({
          where: {
            variantId_locationId: {
              variantId: variant.id,
              locationId: location.id,
            },
          },
          update: {},
          create: {
            variantId: variant.id,
            locationId: location.id,
          },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
