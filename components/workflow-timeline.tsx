"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowStage {
  label: string;
  status: "done" | "current" | "upcoming";
}

export function WorkflowTimeline({ stages }: { stages: WorkflowStage[] }) {
  return (
    <div className="flex items-center overflow-x-auto rounded-lg border border-border bg-white/[0.02] px-4 py-3">
      {stages.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                s.status === "done" && "bg-land text-[#0B1220]",
                s.status === "current" && "bg-sky text-[#00161F]",
                s.status === "upcoming" && "bg-muted text-muted-foreground ring-1 ring-border"
              )}
            >
              {s.status === "done" ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden whitespace-nowrap text-[12.5px] font-medium sm:inline",
                s.status === "current" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
          {i < stages.length - 1 && <div className="mx-3 h-px flex-1 bg-border" />}
        </div>
      ))}
    </div>
  );
}
