"use client";
import { formatINR } from "@/lib/salary-engine";

export interface BenchmarkEntry {
  label: string;
  value: number;
  color: string;
  note?: string;
}

export function BenchmarkPanel({ entries }: { entries: BenchmarkEntry[] }) {
  const max = Math.max(...entries.map((e) => e.value), 1);
  return (
    <div className="space-y-4">
      {entries.map((e, i) => (
        <div key={i}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium text-foreground">{e.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{formatINR(e.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(3, (e.value / max) * 100)}%`, backgroundColor: e.color }}
            />
          </div>
          {e.note && <p className="mt-1 text-[11px] text-muted-foreground">{e.note}</p>}
        </div>
      ))}
    </div>
  );
}
