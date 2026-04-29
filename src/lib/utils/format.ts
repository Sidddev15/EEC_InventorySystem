export function formatQuantity(value: number, unit: string) {
  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 3,
  }).format(value)} ${unit}`;
}
