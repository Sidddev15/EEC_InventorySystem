import { db } from "@/lib/db";
import {
  type SettingsCategoryItem,
  type SettingsHubSection,
  type SettingsLocationItem,
  type SettingsOverview,
  type SettingsUnitItem,
} from "./settings.types";

export async function getSettingsOverview(): Promise<SettingsOverview> {
  const [
    categoriesCount,
    unitsCount,
    locationsCount,
    stockLocationsCount,
    activeCategoriesCount,
    activeUnitsCount,
    activeLocationsCount,
  ] = await Promise.all([
    db.category.count(),
    db.unit.count(),
    db.location.count(),
    db.location.count({ where: { isStockHolding: true } }),
    db.category.count({ where: { isActive: true } }),
    db.unit.count({ where: { isActive: true } }),
    db.location.count({ where: { isActive: true } }),
  ]);

  return {
    categoriesCount,
    unitsCount,
    locationsCount,
    stockLocationsCount,
    activeCategoriesCount,
    activeUnitsCount,
    activeLocationsCount,
  };
}

export async function listSettingsCategories(): Promise<SettingsCategoryItem[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
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

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    productsCount: category._count.products,
  }));
}

export async function listSettingsUnits(): Promise<SettingsUnitItem[]> {
  const units = await db.unit.findMany({
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return units.map((unit) => ({
    id: unit.id,
    code: unit.code,
    name: unit.name,
    description: unit.description,
    isActive: unit.isActive,
    variantsCount: unit._count.variants,
  }));
}

export async function listSettingsLocations(): Promise<SettingsLocationItem[]> {
  const locations = await db.location.findMany({
    orderBy: [{ isStockHolding: "desc" }, { name: "asc" }],
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

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    description: location.description,
    isActive: location.isActive,
    isStockHolding: location.isStockHolding,
    inventoryItemsCount: location._count.inventoryItems,
  }));
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
      title: "Locations",
      description: "Stock-holding and reporting locations used by inventory and production.",
      href: "/settings/locations",
      total: overview.locationsCount,
      active: overview.activeLocationsCount,
    },
  ];
}
