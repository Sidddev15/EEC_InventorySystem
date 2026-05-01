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
import { type SettingsCategoryItem } from "@/modules/settings/settings.types";
import { SettingsModal } from "./settings-modal";

type CategoriesManagerProps = {
  initialItems: SettingsCategoryItem[];
};

type CategoryDraft = {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
};

const emptyDraft: CategoryDraft = {
  name: "",
  description: "",
  isActive: true,
};

export function CategoriesManager({ initialItems }: CategoriesManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
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
      (item.description ?? "").toLowerCase().includes(query)
    );
  });

  function openCreate() {
    setDraft(emptyDraft);
    setError(null);
    setIsOpen(true);
  }

  function openEdit(item: SettingsCategoryItem) {
    setDraft({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      isActive: item.isActive,
    });
    setError(null);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setDraft(emptyDraft);
    setError(null);
  }

  async function saveCategory() {
    setError(null);
    setIsSubmitting(true);

    const isEdit = Boolean(draft.id);
    const response = await fetch(
      isEdit ? `/api/settings/categories/${draft.id}` : "/api/settings/categories",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          isActive: draft.isActive,
        }),
      }
    );

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to save category.");
      return;
    }

    const saved = (await response.json()) as SettingsCategoryItem;

    setItems((current) => {
      const next = isEdit
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];

      return next.sort((left, right) =>
        Number(right.isActive) - Number(left.isActive) || left.name.localeCompare(right.name)
      );
    });

    closeModal();
    router.refresh();
  }

  async function toggleStatus(item: SettingsCategoryItem) {
    setError(null);

    const response = await fetch(`/api/settings/categories/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        description: item.description ?? "",
        isActive: !item.isActive,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to update category status.");
      return;
    }

    const saved = (await response.json()) as SettingsCategoryItem;
    setItems((current) =>
      current.map((candidate) => (candidate.id === saved.id ? saved : candidate))
    );
    router.refresh();
  }

  return (
    <>
      <DataTableShell
        title="Category Master"
        description="Keep category names stable. Product grouping should not drift after operational use starts."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                placeholder="Search categories"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add Category
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
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "Not set"}</TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {category.productsCount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={category.isActive ? "normal" : "info"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(category)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant={category.isActive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleStatus(category)}
                      >
                        {category.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-0" colSpan={5}>
                  <EmptyState
                    title="No categories found"
                    description="Adjust the search or add a new category."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <SettingsModal
        title={draft.id ? "Edit Category" : "Add Category"}
        description="Create or update product grouping used by parent products and reports."
        open={isOpen}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="category-name">
              Name
            </label>
            <Input
              id="category-name"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="category-description">
              Description
            </label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              id="category-description"
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
            <Button type="button" disabled={isSubmitting} onClick={saveCategory}>
              {isSubmitting ? "Saving" : draft.id ? "Save Category" : "Create Category"}
            </Button>
          </div>
        </div>
      </SettingsModal>
    </>
  );
}
