"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SettingsModalProps = {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function SettingsModal({
  title,
  description,
  open,
  onClose,
  children,
}: SettingsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div
        aria-describedby="settings-modal-description"
        aria-labelledby="settings-modal-title"
        aria-modal="true"
        className="w-full max-w-2xl rounded-xl border bg-card shadow-sm"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground" id="settings-modal-title">
              {title}
            </h2>
            <p
              className="mt-1 text-sm leading-5 text-muted-foreground"
              id="settings-modal-description"
            >
              {description}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
