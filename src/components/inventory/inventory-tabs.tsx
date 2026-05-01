import Link from "next/link";
import { InventoryType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import {
  type InventoryTab,
  type InventoryTypeSummary,
} from "@/modules/inventory/inventory.types";

const tabs = [
  {
    label: "Raw Material",
    value: InventoryType.RAW_MATERIAL,
  },
  {
    label: "Semi-Finished",
    value: InventoryType.SEMI_FINISHED,
  },
  {
    label: "Finished Goods",
    value: InventoryType.FINISHED_GOODS,
  },
];

type InventoryTabsProps = {
  active: InventoryTab;
  summaries: InventoryTypeSummary[];
};

export function InventoryTabs({ active, summaries }: InventoryTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {tabs.map((tab) => {
        const summary = summaries.find((item) => item.type === tab.value);

        return (
        <Link
          className={cn(
            "rounded-xl border bg-card px-4 py-4 text-left transition-colors hover:border-slate-300 hover:bg-background",
            active === tab.value &&
              "border-slate-900 bg-slate-900 text-white hover:border-slate-900 hover:bg-slate-900"
          )}
          href={`/inventory?type=${tab.value}`}
          key={tab.value}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold text-foreground",
                  active === tab.value && "text-white"
                )}
              >
                {tab.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs text-muted-foreground",
                  active === tab.value && "text-slate-300"
                )}
              >
                {summary?.variantCount ?? 0} variants across{" "}
                {summary?.locationCount ?? 0} locations
              </p>
            </div>
            <span
              className={cn(
                "rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground",
                active === tab.value &&
                  "border-slate-700 bg-slate-800 text-white"
              )}
            >
              {summary?.itemCount ?? 0} items
            </span>
          </div>
        </Link>
        );
      })}
    </div>
  );
}
