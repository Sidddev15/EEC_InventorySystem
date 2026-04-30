import type { ComponentProps } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonProps = ComponentProps<typeof Button> & {
  icon?: LucideIcon;
  label: string;
  description?: string;
  href?: string;
};

export function ActionButton({
  icon: Icon,
  label,
  description,
  href,
  className,
  variant,
  ...props
}: ActionButtonProps) {
  const content = (
    <>
      {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">{label}</span>
        {description ? (
          <span className="block text-xs font-normal leading-5 opacity-80">
            {description}
          </span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        className={cn(
          buttonVariants({ variant }),
          "h-auto min-h-14 justify-start gap-3 px-4 py-3 text-left",
          className
        )}
        href={href}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      className={cn(
        "h-auto min-h-14 justify-start gap-3 px-4 py-3 text-left",
        className
      )}
      variant={variant}
      {...props}
    >
      {content}
    </Button>
  );
}
