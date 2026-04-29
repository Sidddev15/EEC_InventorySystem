import { Badge } from "@/components/ui/badge";

type StockStatus = "low" | "reorder" | "normal" | "info";

type StatusBadgeProps = {
  status: StockStatus;
  children?: React.ReactNode;
};

const statusConfig: Record<
  StockStatus,
  {
    label: string;
    variant: "lowStock" | "reorderSoon" | "normal" | "secondary";
  }
> = {
  low: {
    label: "Low stock",
    variant: "lowStock",
  },
  reorder: {
    label: "Reorder soon",
    variant: "reorderSoon",
  },
  normal: {
    label: "Normal",
    variant: "normal",
  },
  info: {
    label: "Info",
    variant: "secondary",
  },
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{children ?? config.label}</Badge>;
}
