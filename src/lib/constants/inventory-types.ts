export const INVENTORY_TYPES = [
  "raw_material",
  "semi_finished",
  "finished_goods",
] as const;

export type InventoryType = (typeof INVENTORY_TYPES)[number];
