"use client";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { ComplianceCheck } from "@/lib/salary-engine";

export function CompliancePanel({ checks }: { checks: ComplianceCheck[] }) {
  const reviewCount = checks.filter((c) => c.status === "review").length;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Structural checks against this platform&rsquo;s modeled rules — not a substitute for Legal/Finance review.</p>
        {reviewCount === 0 ? (
          <span className="rounded-full bg-land/10 px-2.5 py-0.5 text-[11px] font-semibold text-land">All clear</span>
        ) : (
          <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-[11px] font-semibold text-warn">{reviewCount} to review</span>
        )}
      </div>
      <div className="divide-y divide-border">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5">
            {c.status === "passed" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-land" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.detail}</p>
            </div>
            <span
              className={`ml-auto shrink-0 whitespace-nowrap text-[11px] font-semibold ${
                c.status === "passed" ? "text-land" : "text-warn"
              }`}
            >
              {c.status === "passed" ? "Passed" : "Needs Review"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
