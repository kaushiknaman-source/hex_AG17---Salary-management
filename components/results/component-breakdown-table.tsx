"use client";
import { Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { DetailedRow, formatINR, pctDiff } from "@/lib/salary-engine";
import { cn } from "@/lib/utils";

export function ComponentBreakdownTable({ rows }: { rows: DetailedRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2.5 pr-4 font-semibold">Component</th>
            <th className="py-2.5 pr-4 font-semibold text-right">Current (₹/yr)</th>
            <th className="py-2.5 pr-4 font-semibold text-right">Proposed (₹/yr)</th>
            <th className="py-2.5 pr-4 font-semibold text-right">Difference</th>
            <th className="py-2.5 font-semibold">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const diff = r.proposed - r.current;
            const pct = pctDiff(r.current, r.proposed);
            const trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
            return (
              <tr key={i} className="border-b border-border/70 last:border-0 hover:bg-muted/30">
                <td className="py-3 pr-4 font-medium">
                  {r.label}
                  {r.isNew && (
                    <span className="ml-2 rounded-full bg-sky/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky">
                      New
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                  {r.current > 0 ? formatINR(r.current) : "—"}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums font-semibold">
                  {formatINR(r.proposed)}
                </td>
                <td className="py-3 pr-4">
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 text-right tabular-nums font-medium",
                      trend === "up" && "text-land",
                      trend === "down" && "text-danger",
                      trend === "flat" && "text-muted-foreground"
                    )}
                  >
                    {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
                    {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
                    {trend === "flat" && <Minus className="h-3.5 w-3.5" />}
                    {diff !== 0 ? formatINR(Math.abs(diff)) : "No change"}
                    {r.current > 0 && diff !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({pct >= 0 ? "+" : ""}
                        {(pct * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 max-w-xs">
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60" />
                    <span>{r.reason}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
