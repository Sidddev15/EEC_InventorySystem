import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  createCategorySchema,
  createLocationSchema,
  createUnitSchema,
  updateCategorySchema,
  updateLocationSchema,
  updateUnitSchema,
} from "@/lib/validations/settings.schema";
import {
  type SettingsCategoryItem,
  type SettingsHubSection,
  type SettingsLocationItem,
  type SettingsLocationType,
  type SettingsOverview,
  type SettingsUnitItem,
} from "./settings.types";

function decimalToString(value: Prisma.Decimal | null | undefined) {
  return value ? value.toString() : null;
}

function normalizeDescription(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizeLocationType(isStockHolding: boolean): SettingsLocationType {
  return isStockHolding ? "STOCK_HOLDING" : "REPORTING_ONLY";
}

function toUnitRecord(unit: {
  id: string;
  code: string;
  name: string;
  unitType: SettingsUnitItem["unitType"];
  conversionFactor: Prisma.Decimal | null;
  description: string | null;
  isActive: boolean;
  _count: { variants: number };
}): SettingsUnitItem {
  return {
    id: unit.id,
    code: unit.code,
    name: unit.name,
    unitType: unit.unitType,
    conversionFactor: decimalToString(unit.conversionFactor),
    description: unit.description,
    isActive: unit.isActive,
    variantsCount: unit._count.variants,
  };
}

function toCategoryRecord(category: {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { products: number };
}): SettingsCategoryItem {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    productsCount: category._count.products,
  };
}

function toLocationRecord(location: {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isStockHolding: boolean;
  _count: { inventoryItems: number };
}): SettingsLocationItem {
  return {
    id: location.id,
    name: location.name,
    description: location.description,
    isActive: location.isActive,
    isStockHolding: location.isStockHolding,
    inventoryItemsCount: location._count.inventoryItems,
  };
}

export async function getSettingsOverview(): Promise<SettingsOverview> {
  const [
    categoriesCount,
    unitsCount,
    locationsCount,
    stockLocationsCount,
    usersCount,
    activeUsersCount,
    activeCategoriesCount,
    activeUnitsCount,
    activeLocationsCount,
  ] = await Promise.all([
    db.category.count(),
    db.unit.count(),
    db.location.count(),
    db.location.count({ where: { isStockHolding: true } }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.category.count({ where: { isActive: true } }),
    db.unit.count({ where: { isActive: true } }),
    db.location.count({ where: { isActive: true } }),
  ]);

  return {
    categoriesCount,
    unitsCount,
    locationsCount,
    stockLocationsCount,
    usersCount,
    activeUsersCount,
    activeCategoriesCount,
    activeUnitsCount,
    activeLocationsCount,
  };
}

export async function listCategories(): Promise<SettingsCategoryItem[]> {
  const categories = await db.category.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories.map(toCategoryRecord);
}

export async function createCategory(input: unknown) {
  const data = createCategorySchema.parse(input);

  const duplicate = await db.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A category with this name already exists.");
  }

  const category = await db.category.create({
    data: {
      name: data.name,
      description: normalizeDescription(data.description),
      isActive: data.isActive,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return toCategoryRecord(category);
}

export async function updateCategory(id: string, input: unknown) {
  const data = updateCategorySchema.parse(input);

  const duplicate = await db.category.findFirst({
    where: {
      id: {
        not: id,
      },
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A category with this name already exists.");
  }

  const category = await db.category.update({
    where: { id },
    data: {
      name: data.name,
      description: normalizeDescription(data.description),
      isActive: data.isActive,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return toCategoryRecord(category);
}

export async function listUnits(): Promise<SettingsUnitItem[]> {
  const units = await db.unit.findMany({
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      unitType: true,
      conversionFactor: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return units.map(toUnitRecord);
}

export async function createUnit(input: unknown) {
  const data = createUnitSchema.parse(input);

  const duplicate = await db.unit.findFirst({
    where: {
      code: {
        equals: data.code,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A unit with this code already exists.");
  }

  const unit = await db.unit.create({
    data: {
      code: data.code,
      name: data.name,
      unitType: data.unitType,
      conversionFactor:
        data.conversionFactor === "" || data.conversionFactor === undefined
          ? null
          : new Prisma.Decimal(data.conversionFactor),
      description: normalizeDescription(data.description),
      isActive: data.isActive,
    },
    select: {
      id: true,
      code: true,
      name: true,
      unitType: true,
      conversionFactor: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return toUnitRecord(unit);
}

export async function updateUnit(id: string, input: unknown) {
  const data = updateUnitSchema.parse(input);

  const duplicate = await db.unit.findFirst({
    where: {
      id: {
        not: id,
      },
      code: {
        equals: data.code,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A unit with this code already exists.");
  }

  const unit = await db.unit.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      unitType: data.unitType,
      conversionFactor:
        data.conversionFactor === "" || data.conversionFactor === undefined
          ? null
          : new Prisma.Decimal(data.conversionFactor),
      description: normalizeDescription(data.description),
      isActive: data.isActive,
    },
    select: {
      id: true,
      code: true,
      name: true,
      unitType: true,
      conversionFactor: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return toUnitRecord(unit);
}

export async function listLocations(): Promise<SettingsLocationItem[]> {
  const locations = await db.location.findMany({
    orderBy: [{ isStockHolding: "desc" }, { isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      isStockHolding: true,
      _count: {
        select: {
          inventoryItems: true,
        },
      },
    },
  });

  return locations.map(toLocationRecord);
}

export async function createLocation(input: unknown) {
  const data = createLocationSchema.parse(input);

  const duplicate = await db.location.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A location with this name already exists.");
  }

  const location = await db.location.create({
    data: {
      name: data.name,
      description: normalizeDescription(data.description),
      isStockHolding: data.locationType === "STOCK_HOLDING",
      isActive: data.isActive,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      isStockHolding: true,
      _count: {
        select: {
          inventoryItems: true,
        },
      },
    },
  });

  return toLocationRecord(location);
}

export async function updateLocation(id: string, input: unknown) {
  const data = updateLocationSchema.parse(input);

  const duplicate = await db.location.findFirst({
    where: {
      id: {
        not: id,
      },
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A location with this name already exists.");
  }

  const location = await db.location.update({
    where: { id },
    data: {
      name: data.name,
      description: normalizeDescription(data.description),
      isStockHolding: data.locationType === "STOCK_HOLDING",
      isActive: data.isActive,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      isStockHolding: true,
      _count: {
        select: {
          inventoryItems: true,
        },
      },
    },
  });

  return toLocationRecord(location);
}

export async function listSettingsCategories() {
  return listCategories();
}

export async function listSettingsUnits() {
  return listUnits();
}

export async function listSettingsLocations() {
  return listLocations();
}

export function buildSettingsSections(overview: SettingsOverview): SettingsHubSection[] {
  return [
    {
      title: "Categories",
      description: "Industrial product groupings used by parent products and reports.",
      href: "/settings/categories",
      total: overview.categoriesCount,
      active: overview.activeCategoriesCount,
    },
    {
      title: "Units",
      description: "Operational stock measurement units used by product variants.",
      href: "/settings/units",
      total: overview.unitsCount,
      active: overview.activeUnitsCount,
    },
    {
      title: "Users",
      description: "Employee login accounts with operational role access and active status control.",
      href: "/settings/users",
      total: overview.usersCount,
      active: overview.activeUsersCount,
    },
    {
      title: "Locations",
      description: "Stock-holding and reporting locations used by inventory and production.",
      href: "/settings/locations",
      total: overview.locationsCount,
      active: overview.activeLocationsCount,
    },
  ];
}

export function getLocationTypeLabel(isStockHolding: boolean): SettingsLocationType {
  return normalizeLocationType(isStockHolding);
}
