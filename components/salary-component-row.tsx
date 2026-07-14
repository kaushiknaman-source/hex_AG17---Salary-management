"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalaryComponent, ComponentCategory, heuristicClassify, heuristicTaxability } from "@/lib/salary-engine";
import { cn } from "@/lib/utils";

const CATEGORY_VARIANT: Record<ComponentCategory, "default" | "land" | "sea" | "neutral" | "warn"> = {
  "Basic Salary": "default",
  Allowance: "sea",
  Benefit: "land",
  "Employer Contribution": "warn",
  Retiral: "neutral",
  "Variable Pay": "default",
  Bonus: "warn",
  Reimbursement: "sea",
};

export function SalaryComponentRow({
  component,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  component: SalaryComponent;
  index: number;
  total: number;
  onChange: (patch: Partial<SalaryComponent>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleMonthly = (v: string) => {
    const monthly = v === "" ? null : Number(v);
    onChange({ monthly, annual: monthly != null ? Math.round(monthly * 12) : null });
  };
  const handleAnnual = (v: string) => {
    const annual = v === "" ? null : Number(v);
    onChange({ annual, monthly: annual != null ? Math.round((annual / 12) * 100) / 100 : null });
  };

  // Live local suggestion (instant, no round trip) shown until the AI
  // classification step overwrites it with a real Claude-derived category.
  const liveCategory = component.category ?? (component.name.trim() ? heuristicClassify(component.name) : undefined);
  const liveTaxability = component.taxability ?? heuristicTaxability(liveCategory);
  const confidence = component.confidence;

  return (
    <div className="border-b border-border last:border-0">
      <div className="grid grid-cols-12 items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/30">
        <div className="col-span-12 flex items-center gap-1.5 sm:col-span-3">
          <div className="flex shrink-0 flex-col text-muted-foreground/40">
            <button onClick={() => onMove(-1)} disabled={index === 0} className="disabled:opacity-20">
              <ChevronUp className="h-3 w-3" />
            </button>
            <button onClick={() => onMove(1)} disabled={index === total - 1} className="disabled:opacity-20">
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <GripVertical className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/30 sm:block" />
          <Input
            value={component.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Component name"
            className="h-8 border-0 bg-transparent px-1.5 font-medium shadow-none focus-visible:bg-white/[0.04] focus-visible:border-input"
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Monthly ₹"
            value={component.monthly ?? ""}
            onChange={(e) => handleMonthly(e.target.value)}
            className="h-8 text-right tabular-nums"
          />
        </div>
        <div className="col-span-6 sm:col-span-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Annual ₹"
            value={component.annual ?? ""}
            onChange={(e) => handleAnnual(e.target.value)}
            className="h-8 text-right tabular-nums"
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          {liveCategory && (
            <Badge variant={CATEGORY_VARIANT[liveCategory]} className="w-full justify-center normal-case">
              {liveCategory}
            </Badge>
          )}
        </div>

        <div className="col-span-6 sm:col-span-2">
          <span className="block text-center text-[11px] text-muted-foreground">{liveTaxability}</span>
          {confidence != null && (
            <span className="block text-center text-[10px] font-medium text-sky">{confidence}% confidence</span>
          )}
        </div>

        <div className="col-span-12 flex items-center justify-end gap-1 sm:col-span-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Edit details"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-muted-foreground hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Description (optional)
          </label>
          <Textarea
            value={component.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Add context that helps AI classification, e.g. 'paid quarterly, performance-linked'"
            className="min-h-[60px] bg-white/[0.03] text-sm"
          />
        </div>
      )}
    </div>
  );
}
