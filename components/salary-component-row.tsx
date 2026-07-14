"use client";

import { GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalaryComponent, ComponentCategory } from "@/lib/salary-engine";

const CATEGORY_VARIANT: Record<ComponentCategory, "default" | "land" | "sea" | "neutral" | "warn"> = {
  "Basic Salary": "default",
  Allowance: "sea",
  Benefit: "sea",
  "Employer Contribution": "neutral",
  Retiral: "neutral",
  "Variable Pay": "default",
  Bonus: "neutral",
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
  const handleMonthly = (v: string) => {
    const monthly = v === "" ? null : Number(v);
    onChange({
      monthly,
      annual: monthly != null ? Math.round(monthly * 12) : null,
    });
  };
  const handleAnnual = (v: string) => {
    const annual = v === "" ? null : Number(v);
    onChange({
      annual,
      monthly: annual != null ? Math.round((annual / 12) * 100) / 100 : null,
    });
  };

  return (
    <div className="group grid grid-cols-12 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/15">
      <div className="col-span-12 flex items-center gap-2 sm:col-span-3">
        <div className="flex flex-col text-muted-foreground/50">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="disabled:opacity-20">
            <ChevronUp className="h-3 w-3" />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="disabled:opacity-20">
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block" />
        <Input
          value={component.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Component name"
          className="font-medium"
        />
      </div>

      <div className="col-span-6 sm:col-span-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Monthly ₹"
          value={component.monthly ?? ""}
          onChange={(e) => handleMonthly(e.target.value)}
        />
      </div>
      <div className="col-span-6 sm:col-span-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Annual ₹"
          value={component.annual ?? ""}
          onChange={(e) => handleAnnual(e.target.value)}
        />
      </div>

      <div className="col-span-9 sm:col-span-3">
        <Input
          value={component.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Description (optional)"
          className="text-muted-foreground"
        />
      </div>

      <div className="col-span-2 flex justify-end sm:col-span-1">
        {component.category && (
          <Badge variant={CATEGORY_VARIANT[component.category]} className="hidden xl:inline-flex">
            {component.category}
          </Badge>
        )}
      </div>

      <div className="col-span-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
