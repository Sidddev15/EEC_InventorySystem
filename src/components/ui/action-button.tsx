import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonProps = ComponentProps<typeof Button> & {
  icon?: LucideIcon;
  label: string;
  description?: string;
};

export function ActionButton({
  icon: Icon,
  label,
  description,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        "h-auto min-h-14 justify-start gap-3 px-4 py-3 text-left",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">{label}</span>
        {description ? (
          <span className="block text-xs font-normal leading-5 opacity-80">
            {description}
          </span>
        ) : null}
      </span>
    </Button>
  );
}
