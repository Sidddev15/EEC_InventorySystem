import { type InventoryType } from "@/generated/prisma/client";

export type InventoryTab = InventoryType;

export type InventoryStockStatus = "low" | "reorder" | "normal";

export type InventoryListItem = {
  id: string;
  itemName: string;
  category: string;
  variant: string;
  currentStock: string;
  numericStock: number;
  unit: string;
  location: string;
  reorderLevel: string;
  status: InventoryStockStatus;
};

export type InventoryItemOption = {
  id: string;
  variantId: string;
  label: string;
  unit: string;
  inventoryType: string;
  location: string;
  currentStock: number;
};

export type InventoryTypeSummary = {
  type: InventoryTab;
  label: string;
  itemCount: number;
  variantCount: number;
  locationCount: number;
};

export type InventoryOverview = {
  totalItems: number;
  totalVariants: number;
  totalLocations: number;
  activeSummary: InventoryTypeSummary;
  summaries: InventoryTypeSummary[];
};
