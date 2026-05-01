"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SettingsLocationItem,
  type SettingsLocationType,
} from "@/modules/settings/settings.types";
import { SettingsModal } from "./settings-modal";

type LocationsManagerProps = {
  initialItems: SettingsLocationItem[];
};

type LocationDraft = {
  id?: string;
  name: string;
  description: string;
  locationType: SettingsLocationType;
  isActive: boolean;
};

const emptyDraft: LocationDraft = {
  name: "",
  description: "",
  locationType: "STOCK_HOLDING",
  isActive: true,
};

function locationTypeLabel(value: SettingsLocationType) {
  return value === "STOCK_HOLDING" ? "Stock Holding" : "Reporting Only";
}

export function LocationsManager({ initialItems }: LocationsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<LocationDraft>(emptyDraft);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(query) ||
      (item.description ?? "").toLowerCase().includes(query) ||
      locationTypeLabel(item.isStockHolding ? "STOCK_HOLDING" : "REPORTING_ONLY")
        .toLowerCase()
        .includes(query)
    );
  });

  function openCreate() {
    setDraft(emptyDraft);
    setError(null);
    setIsOpen(true);
  }

  function openEdit(item: SettingsLocationItem) {
    setDraft({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      locationType: item.isStockHolding ? "STOCK_HOLDING" : "REPORTING_ONLY",
      isActive: item.isActive,
    });
    setError(null);
    setIsOpen(true);
  }

  function closeModal() {
    setDraft(emptyDraft);
    setError(null);
    setIsOpen(false);
  }

  async function saveLocation() {
    setError(null);
    setIsSubmitting(true);

    const isEdit = Boolean(draft.id);
    const response = await fetch(
      isEdit ? `/api/settings/locations/${draft.id}` : "/api/settings/locations",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          locationType: draft.locationType,
          isActive: draft.isActive,
        }),
      }
    );

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to save location.");
      return;
    }

    const saved = (await response.json()) as SettingsLocationItem;
    setItems((current) => {
      const next = isEdit
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];

      return next.sort(
        (left, right) =>
          Number(right.isStockHolding) - Number(left.isStockHolding) ||
          Number(right.isActive) - Number(left.isActive) ||
          left.name.localeCompare(right.name)
      );
    });
    closeModal();
    router.refresh();
  }

  async function toggleStatus(item: SettingsLocationItem) {
    setError(null);
    const response = await fetch(`/api/settings/locations/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        description: item.description ?? "",
        locationType: item.isStockHolding ? "STOCK_HOLDING" : "REPORTING_ONLY",
        isActive: !item.isActive,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to update location status.");
      return;
    }

    const saved = (await response.json()) as SettingsLocationItem;
    setItems((current) =>
      current.map((candidate) => (candidate.id === saved.id ? saved : candidate))
    );
    router.refresh();
  }

  return (
    <>
      <DataTableShell
        title="Location Master"
        description="Stock-holding locations create inventory rows for every active variant. Reporting-only locations should not hold stock."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                placeholder="Search locations"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add Location
            </Button>
          </div>
        }
      >
        {error ? <div className="border-b p-4"><FormMessage tone="error">{error}</FormMessage></div> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Inventory Rows</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.description || "Not set"}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={location.isStockHolding ? "normal" : "info"}
                    >
                      {locationTypeLabel(
                        location.isStockHolding ? "STOCK_HOLDING" : "REPORTING_ONLY"
                      )}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {location.inventoryItemsCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={location.isActive ? "normal" : "info"}>
                      {location.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(location)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant={location.isActive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleStatus(location)}
                      >
                        {location.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-0" colSpan={6}>
                  <EmptyState
                    title="No locations found"
                    description="Adjust the search or add a new location."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <SettingsModal
        title={draft.id ? "Edit Location" : "Add Location"}
        description="Create or update operational and reporting locations used by inventory and production."
        open={isOpen}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="location-name">
                Name
              </label>
              <Input
                id="location-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="location-type">
                Type
              </label>
              <select
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                id="location-type"
                value={draft.locationType}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    locationType: event.target.value as SettingsLocationType,
                  }))
                }
              >
                <option value="STOCK_HOLDING">Stock Holding</option>
                <option value="REPORTING_ONLY">Reporting Only</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="location-description">
              Description
            </label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              id="location-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              checked={draft.isActive}
              className="size-4 rounded border-input"
              type="checkbox"
              onChange={(event) =>
                setDraft((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Active
          </label>
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={saveLocation}>
              {isSubmitting ? "Saving" : draft.id ? "Save Location" : "Create Location"}
            </Button>
          </div>
        </div>
      </SettingsModal>
    </>
  );
}
