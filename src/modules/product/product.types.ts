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
