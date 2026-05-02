"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Layers3, MapPinned, Package2, X } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { type InventoryListItem, type InventoryOverview } from "@/modules/inventory/inventory.types";
import { cn } from "@/lib/utils";

type InventoryOverviewCardsProps = {
  items: InventoryListItem[];
  overview: InventoryOverview;
};

type InventoryModalKey = "rows" | "variants" | "locations" | "coverage" | null;

type InventoryMetricModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
};

function InventoryMetricModal({
  open,
  title,
  description,
  onClose,
  children,
}: InventoryMetricModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      onClick={onClose}
    >
      <div
        aria-describedby="inventory-kpi-description"
        aria-labelledby="inventory-kpi-title"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900" id="inventory-kpi-title">
              {title}
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-slate-500"
              id="inventory-kpi-description"
            >
              {description}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex justify-end border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MetricCardButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="w-full text-left transition-transform hover:-translate-y-0.5"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function InventoryOverviewCards({
  items,
  overview,
}: InventoryOverviewCardsProps) {
  const [openModal, setOpenModal] = useState<InventoryModalKey>(null);

  const variantGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        variant: string;
        itemName: string;
        category: string;
        unit: string;
        rows: number;
        stock: number;
        locations: Set<string>;
      }
    >();

    for (const item of items) {
      const existing = map.get(item.variant) ?? {
        variant: item.variant,
        itemName: item.itemName,
        category: item.category,
        unit: item.unit,
        rows: 0,
        stock: 0,
        locations: new Set<string>(),
      };

      existing.rows += 1;
      existing.stock += item.numericStock;
      existing.locations.add(item.location);
      map.set(item.variant, existing);
    }

    return Array.from(map.values()).sort((a, b) => a.variant.localeCompare(b.variant));
  }, [items]);

  const locationGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        location: string;
        rows: number;
        variants: Set<string>;
        stock: number;
      }
    >();

    for (const item of items) {
      const existing = map.get(item.location) ?? {
        location: item.location,
        rows: 0,
        variants: new Set<string>(),
        stock: 0,
      };

      existing.rows += 1;
      existing.variants.add(item.variant);
      existing.stock += item.numericStock;
      map.set(item.location, existing);
    }

    return Array.from(map.values()).sort((a, b) => a.location.localeCompare(b.location));
  }, [items]);

  const modalContent = (() => {
    switch (openModal) {
      case "rows":
        return {
          title: "Visible Stock Rows",
          description: `These are the ${overview.activeSummary.itemCount} inventory rows currently visible in the ${overview.activeSummary.label} tab.`,
          body: (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  className="grid gap-3 rounded-xl border border-border bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_140px]"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.itemName}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.variant}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-1 text-sm text-slate-900">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stock</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.currentStock} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reorder Level</p>
                    <p className="mt-1 text-sm text-slate-900">{item.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        };
      case "variants":
        return {
          title: "Active Variants",
          description: `This count is based on distinct variant names represented by the visible ${overview.activeSummary.itemCount} stock rows in the ${overview.activeSummary.label} tab.`,
          body: (
            <div className="space-y-3">
              {variantGroups.map((group) => (
                <div
                  className="grid gap-3 rounded-xl border border-border bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_160px_160px_140px]"
                  key={group.variant}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{group.variant}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {group.itemName} · {group.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visible Rows</p>
                    <p className="mt-1 text-sm text-slate-900">{group.rows}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Locations</p>
                    <p className="mt-1 text-sm text-slate-900">{group.locations.size}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stock</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(group.stock)}{" "}
                      {group.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ),
        };
      case "locations":
        return {
          title: "Stock Locations",
          description: `These are the stock-holding locations that currently have visible quantity rows in the ${overview.activeSummary.label} tab.`,
          body: (
            <div className="space-y-3">
              {locationGroups.map((group) => (
                <div
                  className="grid gap-3 rounded-xl border border-border bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1fr)_160px_160px_180px]"
                  key={group.location}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{group.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visible Rows</p>
                    <p className="mt-1 text-sm text-slate-900">{group.rows}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Distinct Variants</p>
                    <p className="mt-1 text-sm text-slate-900">{group.variants.size}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Combined Stock</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(group.stock)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ),
        };
      case "coverage":
        return {
          title: "Network Coverage",
          description: "This card shows the inventory network footprint across all inventory types, not just the selected tab.",
          body: (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-slate-50/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Stock Rows</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{overview.totalItems}</p>
                </div>
                <div className="rounded-xl border border-border bg-slate-50/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tracked Variants</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{overview.totalVariants}</p>
                </div>
                <div className="rounded-xl border border-border bg-slate-50/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stock Locations</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{overview.totalLocations}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Coverage by inventory type</p>
                </div>
                <div className="divide-y">
                  {overview.summaries.map((summary) => (
                    <div
                      className={cn(
                        "grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_140px_140px_140px]",
                        summary.type === overview.activeSummary.type && "bg-blue-50/60"
                      )}
                      key={summary.type}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{summary.label}</p>
                        {summary.type === overview.activeSummary.type ? (
                          <p className="mt-1 text-xs font-medium text-blue-700">Currently selected tab</p>
                        ) : null}
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rows</p>
                        <p className="mt-1 text-sm text-slate-900">{summary.itemCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Variants</p>
                        <p className="mt-1 text-sm text-slate-900">{summary.variantCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Locations</p>
                        <p className="mt-1 text-sm text-slate-900">{summary.locationCount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };
      default:
        return null;
    }
  })();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardButton onClick={() => setOpenModal("rows")}>
          <KpiCard
            title="Visible Stock Rows"
            value={overview.activeSummary.itemCount.toString()}
            subtitle={`${overview.activeSummary.label} items currently visible`}
            icon={<Package2 className="size-4" aria-hidden="true" />}
          />
        </MetricCardButton>
        <MetricCardButton onClick={() => setOpenModal("variants")}>
          <KpiCard
            title="Active Variants"
            value={overview.activeSummary.variantCount.toString()}
            subtitle="Distinct variants in the selected inventory tab"
            icon={<Layers3 className="size-4" aria-hidden="true" />}
          />
        </MetricCardButton>
        <MetricCardButton onClick={() => setOpenModal("locations")}>
          <KpiCard
            title="Stock Locations"
            value={overview.activeSummary.locationCount.toString()}
            subtitle="Stock-holding locations with quantity for this tab"
            icon={<MapPinned className="size-4" aria-hidden="true" />}
          />
        </MetricCardButton>
        <MetricCardButton onClick={() => setOpenModal("coverage")}>
          <KpiCard
            title="Network Coverage"
            value={overview.totalLocations.toString()}
            subtitle={`${overview.totalItems} stock rows across ${overview.totalVariants} tracked variants`}
            icon={<Package2 className="size-4" aria-hidden="true" />}
          />
        </MetricCardButton>
      </div>

      {modalContent ? (
        <InventoryMetricModal
          open
          title={modalContent.title}
          description={modalContent.description}
          onClose={() => setOpenModal(null)}
        >
          {modalContent.body}
        </InventoryMetricModal>
      ) : null}
    </>
  );
}
