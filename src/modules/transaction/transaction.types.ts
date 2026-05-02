import { type TransactionType } from "@/generated/prisma/client";

export type TransactionFilters = {
  search?: string;
  type?: "all" | TransactionType;
  productId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type TransactionLogItem = {
  id: string;
  rawType: TransactionType;
  dateTime: string;
  type: string;
  product: string;
  variant: string;
  quantity: string;
  signedQuantity: number;
  unit: string;
  source: string;
  destination: string;
  user: string;
  reference: string;
  remarks: string;
};

export type TransactionUserOption = {
  id: string;
  label: string;
};
