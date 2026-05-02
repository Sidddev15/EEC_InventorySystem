"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BellRing, CircleCheckBig, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  type InventoryListItem,
  type InventoryStatusBreakdown,
  type InventoryStockStatus,
} from "@/modules/inventory/inventory.types";

type InventoryStatusSummaryProps = {
  counts: InventoryStatusBreakdown;
  items: InventoryListItem[];
};

const cards = [
  {
    key: "low",
    label: "Low stock",
    icon: AlertTriangle,
    toneClass: "border-red-200 bg-red-50 text-red-900",
    valueClass: "text-red-700",
    description: "These rows are already below the configured reorder level.",
  },
  {
    key: "reorder",
    label: "Reorder soon",
    icon: BellRing,
    toneClass: "border-amber-200 bg-amber-50 text-amber-900",
    valueClass: "text-amber-700",
    description: "These rows are close to the reorder point and need review.",
  },
  {
    key: "normal",
    label: "Normal stock",
    icon: CircleCheckBig,
    toneClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    valueClass: "text-emerald-700",
    description: "These rows are currently above the reorder threshold.",
  },
] as const;

type StatusModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
};

function StatusModal({
  open,
  title,
  description,
  onClose,
  children,
}: StatusModalProps) {
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
        aria-describedby="inventory-status-description"
        aria-labelledby="inventory-status-title"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900" id="inventory-status-title">
              {title}
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-slate-500"
              id="inventory-status-description"
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

function StatusCardButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
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

export function InventoryStatusSummary({
  counts,
  items,
}: InventoryStatusSummaryProps) {
  const [openStatus, setOpenStatus] = useState<InventoryStockStatus | null>(null);

  const rowsByStatus = useMemo(() => {
    return {
      low: items.filter((item) => item.status === "low"),
      reorder: items.filter((item) => item.status === "reorder"),
      normal: items.filter((item) => item.status === "normal"),
    };
  }, [items]);

  const displayCounts = useMemo(
    () => ({
      low: counts.low,
      reorder: counts.low + counts.reorder,
      normal: counts.normal,
    }),
    [counts]
  );

  const modalContent = openStatus
    ? {
        title:
          openStatus === "low"
            ? "Low Stock Rows"
            : openStatus === "reorder"
              ? "Reorder Soon Rows"
              : "Normal Stock Rows",
        description:
          openStatus === "low"
            ? "These inventory rows are already below reorder level and need immediate replenishment."
            : openStatus === "reorder"
              ? "These inventory rows need replenishment attention. This list includes both warning-band rows and rows that are already low."
              : "These inventory rows are currently healthy and above reorder threshold.",
        rows:
          openStatus === "reorder"
            ? [...rowsByStatus.low, ...rowsByStatus.reorder]
            : rowsByStatus[openStatus],
      }
    : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = displayCounts[card.key];

          return (
            <StatusCardButton key={card.key} onClick={() => setOpenStatus(card.key)}>
              <div className={`rounded-xl border p-4 ${card.toneClass}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" aria-hidden="true" />
                      <p className="text-sm font-semibold">{card.label}</p>
                    </div>
                    <p className={`mt-2 text-2xl font-bold ${card.valueClass}`}>{value}</p>
                    <p className="mt-2 text-sm/5 text-current/80">{card.description}</p>
                  </div>
                  <StatusBadge status={card.key} />
                </div>
              </div>
            </StatusCardButton>
          );
        })}
      </div>

      {modalContent ? (
        <StatusModal
          open
          title={modalContent.title}
          description={modalContent.description}
          onClose={() => setOpenStatus(null)}
        >
          {modalContent.rows.length > 0 ? (
            <div className="space-y-3">
              {modalContent.rows.map((item) => (
                <div
                  className="grid gap-3 rounded-xl border border-border bg-slate-50/60 px-4 py-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_140px_140px_140px]"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.itemName}</p>
                    <p className="mt-1 truncate text-sm text-slate-600">{item.variant}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-1 text-sm text-slate-900">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Stock</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.currentStock} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reorder Level</p>
                    <p className="mt-1 text-sm text-slate-900">{item.reorderLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-900">No rows in this status right now.</p>
              <p className="mt-1 text-sm text-slate-500">
                The selected inventory tab currently has no matching stock records.
              </p>
            </div>
          )}
        </StatusModal>
      ) : null}
    </>
  );
}
