"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReorderInsightButtonProps = {
  inventoryItemId: string;
};

type ReorderInsightModalProps = {
  open: boolean;
  isLoading: boolean;
  message: string | null;
  onClose: () => void;
};

function ReorderInsightModal({
  open,
  isLoading,
  message,
  onClose,
}: ReorderInsightModalProps) {
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        aria-describedby="reorder-insight-description"
        aria-labelledby="reorder-insight-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl border bg-white shadow-sm"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900" id="reorder-insight-title">
              AI reorder insight
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-slate-500"
              id="reorder-insight-description"
            >
              Review the stock recommendation before taking action.
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="px-5 py-4">
          {isLoading ? (
            <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-slate-600">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Generating reorder insight
            </div>
          ) : (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
                <p className="text-sm leading-6 text-blue-900">
                  {message ?? "Unable to create reorder insight."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t px-5 py-4">
          <Button type="button" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ReorderInsightButton({
  inventoryItemId,
}: ReorderInsightButtonProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchInsight() {
    setOpen(true);
    setIsLoading(true);
    setInsight(null);

    try {
      const response = await fetch("/api/ai/reorder-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventoryItemId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setInsight(data.message ?? "Unable to create reorder insight.");
        return;
      }

      const data = (await response.json()) as { suggestion: string };
      setInsight(data.suggestion);
    } catch {
      setInsight("Unable to create reorder insight.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        className="w-full sm:w-auto"
        size="sm"
        type="button"
        variant="outline"
        onClick={fetchInsight}
        disabled={isLoading}
      >
        {isLoading ? "Checking" : "AI insight"}
      </Button>
      <ReorderInsightModal
        isLoading={isLoading}
        message={insight}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
