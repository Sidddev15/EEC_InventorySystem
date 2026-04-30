import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormMessageProps = {
  children: ReactNode;
  tone?: "error" | "warning" | "info";
};

const toneClasses = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function FormMessage({ children, tone = "info" }: FormMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium leading-5",
        toneClasses[tone]
      )}
    >
      {children}
    </div>
  );
}
