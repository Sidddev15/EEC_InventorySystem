export type SettingsOverview = {
  categoriesCount: number;
  unitsCount: number;
  locationsCount: number;
  stockLocationsCount: number;
  activeCategoriesCount: number;
  activeUnitsCount: number;
  activeLocationsCount: number;
};

export type SettingsCategoryItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  productsCount: number;
};

export type SettingsUnitItem = {
  id: string;
  code: string;
  name: string;
  unitType: "COUNT" | "ROLL" | "AREA" | "WEIGHT" | "LENGTH";
  conversionFactor: string | null;
  description: string | null;
  isActive: boolean;
  variantsCount: number;
};

export type SettingsLocationItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isStockHolding: boolean;
  inventoryItemsCount: number;
};

export type SettingsLocationType = "STOCK_HOLDING" | "REPORTING_ONLY";

export type SettingsHubSection = {
  title: string;
  description: string;
  href: string;
  total: number;
  active: number;
};
