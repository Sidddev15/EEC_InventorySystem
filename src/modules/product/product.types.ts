export type ProductListFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  variantsCount: number;
  isActive: boolean;
};

export type ProductCategoryOption = {
  id: string;
  name: string;
};

export type ProductOption = {
  id: string;
  name: string;
  category: string;
};

export type UnitOption = {
  id: string;
  code: string;
  name: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isActive: boolean;
  variants: Array<{
    id: string;
    name: string;
    unit: string;
    inventoryType: string;
    isActive: boolean;
  }>;
};
