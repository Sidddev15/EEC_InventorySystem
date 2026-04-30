"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ReorderInsightButtonProps = {
  inventoryItemId: string;
};

export function ReorderInsightButton({
  inventoryItemId,
}: ReorderInsightButtonProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchInsight() {
    setIsLoading(true);
    setInsight(null);

    const response = await fetch("/api/ai/reorder-insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inventoryItemId }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setInsight(data.message ?? "Unable to create reorder insight.");
      return;
    }

    const data = (await response.json()) as { suggestion: string };
    setInsight(data.suggestion);
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        type="button"
        variant="outline"
        onClick={fetchInsight}
        disabled={isLoading}
      >
        {isLoading ? "Checking" : "AI insight"}
      </Button>
      {insight ? (
        <p className="max-w-xs whitespace-normal text-xs text-muted-foreground">
          {insight}
        </p>
      ) : null}
    </div>
  );
}
