"use client";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, pctDiff } from "@/lib/salary-engine";
import { cn } from "@/lib/utils";

export function MetricComparisonCard({
  label,
  icon: Icon,
  current,
  proposed,
  cadence = "per year",
}: {
  label: string;
  icon: LucideIcon;
  current: number;
  proposed: number;
  cadence?: string;
}) {
  const diff = proposed - current;
  const pct = pctDiff(current, proposed);
  const improved = diff >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div>
            <p className="text-lg font-semibold text-muted-foreground line-through decoration-border">
              {formatINR(current)}
            </p>
            <p className="text-[11px] text-muted-foreground">Current, {cadence}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-bold">{formatINR(proposed)}</p>
            <p className="text-[11px] text-muted-foreground">Proposed, {cadence}</p>
          </div>
        </div>
        {current > 0 && (
          <p
            className={cn(
              "mt-3 text-xs font-semibold",
              improved ? "text-land" : "text-danger"
            )}
          >
            {improved ? "+" : ""}
            {formatINR(diff)} ({pct >= 0 ? "+" : ""}
            {(pct * 100).toFixed(1)}%)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
