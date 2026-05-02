"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function SelectField({
  name,
  id,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Select option",
  required,
  disabled,
  className,
}: SelectFieldProps) {
  const [query, setQuery] = React.useState("");

  const selectedLabel = React.useMemo(() => {
    const selectedValue = value ?? defaultValue ?? "";

    return options.find((option) => option.value === selectedValue)?.label;
  }, [defaultValue, options, value]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option, index) => {
      if (index === 0 && !option.value) {
        return true;
      }

      return option.label.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, options]);

  return (
    <SelectPrimitive.Root
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      name={name}
      required={required}
      value={value}
      onValueChange={(nextValue) => {
        setQuery("");
        onValueChange?.((nextValue ?? "") as string);
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-input bg-card px-3 text-left text-sm text-slate-900 shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-[popup-open]:border-blue-300 data-[popup-open]:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedLabel ?? placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="shrink-0 text-slate-500">
          <ChevronDown className="size-4" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          align="start"
          alignItemWithTrigger={false}
          className="z-50"
          sideOffset={6}
        >
          <SelectPrimitive.Popup className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="min-w-[var(--anchor-width)] border-b border-slate-200 p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-3 focus:ring-blue-100"
                  placeholder="Search options"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </div>
            </div>

            <SelectPrimitive.List className="max-h-72 min-w-[var(--anchor-width)] overflow-auto p-1">
              {filteredOptions.map((option) => (
                <SelectPrimitive.Item
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-100 data-[selected]:bg-blue-50 data-[selected]:text-blue-700",
                    option.disabled && "cursor-not-allowed opacity-50"
                  )}
                  disabled={option.disabled}
                  key={option.value}
                  value={option.value}
                >
                  <SelectPrimitive.ItemIndicator
                    className="flex size-4 items-center justify-center text-blue-600"
                    keepMounted
                  >
                    <Check className="size-4" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-500">No matching options</div>
              ) : null}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
