import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  trend?: {
    label: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: ReactNode;
  className?: string;
};

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  icon,
  className,
}: KpiCardProps) {
  const TrendIcon = trend?.direction === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className={cn("min-h-32 md:min-h-36", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon ? (
          <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground md:size-9">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="text-xl font-bold tracking-normal text-foreground md:text-2xl">
            {value}
          </div>
          {unit ? (
            <span className="pb-1 text-xs font-medium uppercase text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
          {subtitle ? <span>{subtitle}</span> : null}
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trend.direction === "up" && "text-green-700",
                trend.direction === "down" && "text-red-700"
              )}
            >
              {trend.direction === "neutral" ? null : (
                <TrendIcon className="size-3.5" aria-hidden="true" />
              )}
              {trend.label}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
