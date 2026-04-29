import Link from "next/link";
import { InventoryType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { type InventoryTab } from "@/modules/inventory/inventory.types";

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
};

export function InventoryTabs({ active }: InventoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 shadow-sm">
      {tabs.map((tab) => (
        <Link
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            active === tab.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
          href={`/inventory?type=${tab.value}`}
          key={tab.value}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
