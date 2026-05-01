import { AlertTriangle, BellRing, CircleCheckBig } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { type InventoryStatusBreakdown } from "@/modules/inventory/inventory.types";

type InventoryStatusSummaryProps = {
  counts: InventoryStatusBreakdown;
};

const cards = [
  {
    key: "low",
    label: "Low stock",
    icon: AlertTriangle,
    toneClass: "border-red-200 bg-red-50 text-red-900",
    valueClass: "text-red-700",
  },
  {
    key: "reorder",
    label: "Reorder soon",
    icon: BellRing,
    toneClass: "border-amber-200 bg-amber-50 text-amber-900",
    valueClass: "text-amber-700",
  },
  {
    key: "normal",
    label: "Normal stock",
    icon: CircleCheckBig,
    toneClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    valueClass: "text-emerald-700",
  },
] as const;

export function InventoryStatusSummary({
  counts,
}: InventoryStatusSummaryProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = counts[card.key];

        return (
          <div
            className={`rounded-xl border p-4 ${card.toneClass}`}
            key={card.key}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">{card.label}</p>
                </div>
                <p className={`mt-2 text-2xl font-bold ${card.valueClass}`}>{value}</p>
              </div>
              <StatusBadge status={card.key} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
