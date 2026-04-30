import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-md text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
