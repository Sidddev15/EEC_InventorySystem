"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ProductCategoryOption } from "@/modules/product/product.types";

type ProductFormProps = {
  categories: ProductCategoryOption[];
};

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);

  async function checkDuplicateName() {
    setAiSuggestion(null);
    setIsCheckingName(true);

    const response = await fetch("/api/ai/product-duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        categoryId,
      }),
    });

    setIsCheckingName(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setAiSuggestion(data.message ?? "Unable to check product name.");
      return;
    }

    const data = (await response.json()) as { suggestion: string };
    setAiSuggestion(data.suggestion);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        categoryId: formData.get("categoryId"),
        description: formData.get("description"),
        isActive: formData.get("isActive") === "on",
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to create product.");
      return;
    }

    router.replace("/products");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Paint Booth Filter"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            id="categoryId"
            name="categoryId"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          id="description"
          name="description"
          placeholder="Optional internal description"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          className="size-4 rounded border-input"
          name="isActive"
          type="checkbox"
          defaultChecked
        />
        Active
      </label>

      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Check for similar product names before creating master data.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={!name || isCheckingName}
            onClick={checkDuplicateName}
          >
            {isCheckingName ? "Checking" : "Check duplicate"}
          </Button>
        </div>
        {aiSuggestion ? (
          <p className="mt-3 text-sm font-medium text-foreground">{aiSuggestion}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || categories.length === 0}>
          {isSubmitting ? "Creating" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
