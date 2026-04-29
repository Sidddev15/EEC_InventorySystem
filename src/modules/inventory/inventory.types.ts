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
