import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SettingsHubCardProps = {
  title: string;
  description: string;
  href: string;
  total: number;
  active: number;
  icon: LucideIcon;
};

export function SettingsHubCard({
  title,
  description,
  href,
  total,
  active,
  icon: Icon,
}: SettingsHubCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
              <Icon className="size-5 text-foreground" aria-hidden="true" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Total</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{total}</p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Active</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{active}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
