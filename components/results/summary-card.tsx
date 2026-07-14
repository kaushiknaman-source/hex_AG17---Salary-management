"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProposedStructure, formatINR, pctDiff } from "@/lib/salary-engine";

export function SummaryCard({
  structure,
  currentTotalCTC,
}: {
  structure: ProposedStructure;
  currentTotalCTC: number;
}) {
  const diff = pctDiff(currentTotalCTC, structure.totalCTC);
  const rows: [string, number][] = [
    ["Basic", structure.basic],
    ["HRA", structure.hra],
    ["Conveyance Allowance", structure.conveyanceAllowance],
    ["Special / Flexi Allowance", structure.specialAllowance],
    ["Base Pay (Fixed Monthly)", structure.basePay],
    ["Employer PF", structure.employerPF],
    ["Gratuity", structure.gratuity],
    ["Total Retiral", structure.totalRetiral],
    ...(structure.mealAllowance ? ([["Meal Allowance", structure.mealAllowance]] as [string, number][]) : []),
    ...(structure.flexiAttire ? ([["Flexi Attire Benefit", structure.flexiAttire]] as [string, number][]) : []),
    ["Fixed CTC", structure.fixedCTCCheck],
    ["Annual Target Incentive", structure.annualIncentive],
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-sky/[0.04] p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{structure.companyName}</p>
          <Badge variant={diff >= 0 ? "land" : "danger"}>
            {diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {(diff * 100).toFixed(1)}%
          </Badge>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{formatINR(structure.totalCTC)}</p>
        <p className="text-xs text-muted-foreground">Total CTC per year</p>
      </div>
      <CardContent className="space-y-2 p-5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-border pb-1.5 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{formatINR(value)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
