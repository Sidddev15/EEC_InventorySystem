export const TRANSACTION_TYPES = [
  "inward",
  "outward",
  "adjustment",
  "production_consumption",
  "production_output",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
