"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type SettingsUnitItem } from "@/modules/settings/settings.types";
import { SettingsModal } from "./settings-modal";

type UnitsManagerProps = {
  initialItems: SettingsUnitItem[];
};

type UnitDraft = {
  id?: string;
  code: string;
  name: string;
  unitType: SettingsUnitItem["unitType"];
  conversionFactor: string;
  description: string;
  isActive: boolean;
};

const unitTypeOptions: Array<{ value: SettingsUnitItem["unitType"]; label: string }> = [
  { value: "COUNT", label: "Count" },
  { value: "ROLL", label: "Roll" },
  { value: "AREA", label: "Area" },
  { value: "WEIGHT", label: "Weight" },
  { value: "LENGTH", label: "Length" },
];

const emptyDraft: UnitDraft = {
  code: "",
  name: "",
  unitType: "COUNT",
  conversionFactor: "",
  description: "",
  isActive: true,
};

function unitTypeLabel(value: SettingsUnitItem["unitType"]) {
  return unitTypeOptions.find((item) => item.value === value)?.label ?? value;
}

export function UnitsManager({ initialItems }: UnitsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<UnitDraft>(emptyDraft);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.code.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      unitTypeLabel(item.unitType).toLowerCase().includes(query)
    );
  });

  function openCreate() {
    setDraft(emptyDraft);
    setError(null);
    setIsOpen(true);
  }

  function openEdit(item: SettingsUnitItem) {
    setDraft({
      id: item.id,
      code: item.code,
      name: item.name,
      unitType: item.unitType,
      conversionFactor: item.conversionFactor ?? "",
      description: item.description ?? "",
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

  async function saveUnit() {
    setError(null);
    setIsSubmitting(true);

    const isEdit = Boolean(draft.id);
    const response = await fetch(
      isEdit ? `/api/settings/units/${draft.id}` : "/api/settings/units",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: draft.code,
          name: draft.name,
          unitType: draft.unitType,
          conversionFactor: draft.conversionFactor,
          description: draft.description,
          isActive: draft.isActive,
        }),
      }
    );

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to save unit.");
      return;
    }

    const saved = (await response.json()) as SettingsUnitItem;
    setItems((current) => {
      const next = isEdit
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];

      return next.sort((left, right) =>
        Number(right.isActive) - Number(left.isActive) || left.code.localeCompare(right.code)
      );
    });
    closeModal();
    router.refresh();
  }

  async function toggleStatus(item: SettingsUnitItem) {
    setError(null);
    const response = await fetch(`/api/settings/units/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: item.code,
        name: item.name,
        unitType: item.unitType,
        conversionFactor: item.conversionFactor ?? "",
        description: item.description ?? "",
        isActive: !item.isActive,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to update unit status.");
      return;
    }

    const saved = (await response.json()) as SettingsUnitItem;
    setItems((current) =>
      current.map((candidate) => (candidate.id === saved.id ? saved : candidate))
    );
    router.refresh();
  }

  return (
    <>
      <DataTableShell
        title="Unit Master"
        description="Variant unit choice affects inward, production, and reporting. Keep unit definitions clean."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                placeholder="Search units"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add Unit
            </Button>
          </div>
        }
      >
        {error ? <div className="border-b p-4"><FormMessage tone="error">{error}</FormMessage></div> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Conversion</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{unitTypeLabel(unit.unitType)}</TableCell>
                  <TableCell>{unit.conversionFactor ?? "Not set"}</TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {unit.variantsCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={unit.isActive ? "normal" : "info"}>
                      {unit.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(unit)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant={unit.isActive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleStatus(unit)}
                      >
                        {unit.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-0" colSpan={7}>
                  <EmptyState
                    title="No units found"
                    description="Adjust the search or add a new operational unit."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <SettingsModal
        title={draft.id ? "Edit Unit" : "Add Unit"}
        description="Create or update the operational unit used by product variants and reports."
        open={isOpen}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="unit-code">
                Code
              </label>
              <Input
                id="unit-code"
                value={draft.code}
                onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="unit-name">
                Name
              </label>
              <Input
                id="unit-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="unit-type">
                Type
              </label>
              <SelectField
                id="unit-type"
                options={unitTypeOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={draft.unitType}
                onValueChange={(nextValue) =>
                  setDraft((current) => ({
                    ...current,
                    unitType: nextValue as SettingsUnitItem["unitType"],
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="unit-conversion">
                Conversion
              </label>
              <Input
                id="unit-conversion"
                inputMode="decimal"
                placeholder="Optional base conversion"
                value={draft.conversionFactor}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    conversionFactor: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="unit-description">
              Description
            </label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              id="unit-description"
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
            <Button type="button" disabled={isSubmitting} onClick={saveUnit}>
              {isSubmitting ? "Saving" : draft.id ? "Save Unit" : "Create Unit"}
            </Button>
          </div>
        </div>
      </SettingsModal>
    </>
  );
}
