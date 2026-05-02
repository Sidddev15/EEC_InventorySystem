export type ProductListFilters = {
  search?: string;
  categoryId?: string;
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

export type ProductSearchResult = {
  productId: string;
  productName: string;
  category: string;
  variantId: string | null;
  variantName: string | null;
  matchType: "product" | "variant";
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
  variantsCount: number;
  variants: Array<{
    id: string;
    name: string;
    unit: string;
    inventoryType: string;
    thickness: string | null;
    gsm: number | null;
    material: string | null;
    size: string | null;
    isActive: boolean;
  }>;
};
