"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  name: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseIsoDate(value?: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value?: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

export function DatePickerField({
  name,
  id,
  defaultValue,
  value,
  onValueChange,
  placeholder = "Select date",
  className,
}: DatePickerFieldProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const [open, setOpen] = React.useState(false);
  const selectedValue = isControlled ? value ?? "" : internalValue;
  const selectedDate = parseIsoDate(selectedValue);
  const [visibleMonth, setVisibleMonth] = React.useState(
    () => selectedDate ?? new Date()
  );

  function setNextValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  function handleSelect(date: Date) {
    setNextValue(formatIsoDate(date));
    setOpen(false);
  }

  function handleClear() {
    setNextValue("");
    setOpen(false);
  }

  const days = React.useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const displayValue = formatDisplayDate(selectedValue);
  const today = new Date();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <input name={name} type="hidden" value={selectedValue} />
      <Popover.Trigger
        aria-label={placeholder}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-input bg-card px-3 text-left text-sm text-slate-900 shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-[popup-open]:border-blue-300 data-[popup-open]:bg-blue-50",
          className
        )}
        id={id}
        type="button"
      >
        <span className={cn("truncate", !displayValue && "text-slate-400")}>
          {displayValue || placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="start" className="z-50" sideOffset={6}>
          <Popover.Popup className="w-[296px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg" initialFocus={false}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                type="button"
                onClick={() =>
                  setVisibleMonth(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <p className="text-sm font-semibold text-slate-900">
                {monthLabel(visibleMonth)}
              </p>
              <button
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                type="button"
                onClick={() =>
                  setVisibleMonth(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {weekdayLabels.map((label) => (
                <div
                  className="flex h-8 items-center justify-center text-xs font-medium text-slate-500"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date) => {
                const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                const isToday = isSameDay(date, today);

                return (
                  <button
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                      outsideMonth
                        ? "text-slate-300"
                        : "text-slate-700 hover:bg-slate-100",
                      isToday && !isSelected && "border border-blue-200 bg-blue-50 text-blue-700",
                      isSelected && "bg-blue-600 font-medium text-white hover:bg-blue-600"
                    )}
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleSelect(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <button
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                type="button"
                onClick={handleClear}
              >
                <X className="size-4" aria-hidden="true" />
                Clear
              </button>
              <button
                className="rounded-lg px-2 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
                type="button"
                onClick={() => {
                  setVisibleMonth(today);
                  handleSelect(today);
                }}
              >
                Today
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
