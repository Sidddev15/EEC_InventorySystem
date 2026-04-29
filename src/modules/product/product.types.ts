export type ProductListFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

export type ProductListItem = {
  id: string;
  name: string;
  category: string;
  variantsCount: number;
  isActive: boolean;
};
