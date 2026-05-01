import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pb-5">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
