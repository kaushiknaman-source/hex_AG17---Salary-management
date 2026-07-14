"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  Sparkles,
  ArrowLeft,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SummaryCard } from "@/components/results/summary-card";
import { StackedComparisonChart, CompositionBar } from "@/components/results/stacked-comparison-chart";
import { WaterfallChart, WaterfallStep } from "@/components/results/waterfall-chart";
import { useSalaryStore } from "@/lib/store";
import {
  computeProposedStructure,
  mapComponentsToCompany,
  totalAnnual,
  formatINR,
  pctDiff,
  COMPANIES,
} from "@/lib/salary-engine";
import { exportComparisonPDF } from "@/lib/export-pdf";
import { exportComparisonExcel } from "@/lib/export-excel";

export default function ResultsPage() {
  const { employee, components, targetCTC, selectedCompanies, grade } = useSalaryStore();
  const [insights, setInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeCompany, setActiveCompany] = useState(selectedCompanies[0] || "geosystems");

  const currentTotal = useMemo(() => totalAnnual(components), [components]);

  const structures = useMemo(
    () =>
      selectedCompanies.map((id) =>
        computeProposedStructure(id, targetCTC || 0, grade || undefined)
      ),
    [selectedCompanies, targetCTC, grade]
  );

  const mappings = useMemo(
    () =>
      Object.fromEntries(
        selectedCompanies.map((id) => [id, mapComponentsToCompany(components, id)])
      ),
    [selectedCompanies, components]
  );

  const currentBySlice = useMemo(() => {
    const get = (id: string) => components.find((c) => c.id === id)?.annual ?? 0;
    const basic = get("basic");
    const hra = get("hra") + get("shift") + get("lta");
    const specialAllowance = get("special");
    const retirals = get("pf") + get("gratuity");
    const variablePay = get("incentive");
    const other = get("medical") + get("meal");
    return { basic, hra, specialAllowance, retirals, variablePay, other };
  }, [components]);

  const chartData: CompositionBar[] = useMemo(() => {
    const currentBar: CompositionBar = { label: "Current", ...currentBySlice };
    const proposedBars: CompositionBar[] = structures.map((s) => ({
      label: COMPANIES[s.companyId].name.replace("Hexagon ", ""),
      basic: s.basic,
      hra: s.hra + s.conveyanceAllowance,
      specialAllowance: s.specialAllowance,
      retirals: s.totalRetiral,
      variablePay: s.annualIncentive,
      other: s.mealAllowance + s.flexiAttire,
    }));
    return [currentBar, ...proposedBars];
  }, [currentBySlice, structures]);

  const activeStructure = structures.find((s) => s.companyId === activeCompany) || structures[0];

  const waterfallSteps: WaterfallStep[] = activeStructure
    ? [
        { label: "Current CTC", delta: currentTotal, isTotal: true },
        { label: "Basic", delta: activeStructure.basic - currentBySlice.basic },
        { label: "HRA + Conveyance", delta: activeStructure.hra + activeStructure.conveyanceAllowance - currentBySlice.hra },
        { label: "Special Allowance", delta: activeStructure.specialAllowance - currentBySlice.specialAllowance },
        { label: "Retirals", delta: activeStructure.totalRetiral - currentBySlice.retirals },
        { label: "Variable Pay", delta: activeStructure.annualIncentive - currentBySlice.variablePay },
        { label: "Meal / Other", delta: activeStructure.mealAllowance + activeStructure.flexiAttire - currentBySlice.other },
        { label: "Proposed CTC", delta: activeStructure.totalCTC, isTotal: true },
      ]
    : [];

  useEffect(() => {
    if (!targetCTC || structures.length === 0) return;
    const run = async () => {
      setLoadingInsights(true);
      setInsights("");
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee,
            current: currentBySlice,
            proposals: structures,
            targetCTC,
            mappings,
          }),
        });
        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setInsights(text);
        }
      } finally {
        setLoadingInsights(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCTC, JSON.stringify(selectedCompanies), grade]);

  if (!targetCTC || selectedCompanies.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">No analysis yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Run the salary structuring flow first to see comparison results here.
        </p>
        <Link href="/salary">
          <Button>Start Salary Analysis</Button>
        </Link>
      </main>
    );
  }


  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/salary" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-sky">
              <ArrowLeft className="h-3 w-3" /> Back to structuring
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
              {employee.name ? `${employee.name}'s` : "Comparison"} Salary Structure Results
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Target Fixed CTC {formatINR(targetCTC)} · benchmarked against {selectedCompanies.length}{" "}
              {selectedCompanies.length === 1 ? "framework" : "frameworks"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportComparisonExcel({ employeeName: employee.name, current: components, structures })
              }
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
            <Button
              onClick={() =>
                exportComparisonPDF({
                  employeeName: employee.name,
                  targetCTC,
                  structures,
                  insights,
                })
              }
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Employee / client details */}
        {(employee.name || employee.employeeId || employee.designation || employee.grade || employee.currentCompany) && (
          <Card className="mb-6">
            <CardContent className="flex flex-wrap gap-x-8 gap-y-3 p-5">
              <DetailField label="Employee" value={employee.name || "—"} />
              <DetailField label="Employee ID" value={employee.employeeId || "—"} />
              <DetailField label="Designation" value={employee.designation || "—"} />
              <DetailField label="Grade" value={employee.grade || "—"} />
              <DetailField label="Current company" value={employee.currentCompany || "—"} />
              <DetailField label="Current CTC (sum)" value={formatINR(currentTotal)} />
            </CardContent>
          </Card>
        )}

        {/* Composition comparison */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold">Salary Composition — Current vs Proposed</h2>
            <p className="mb-2 text-xs text-muted-foreground">Annual figures across every selected framework</p>
            <StackedComparisonChart data={chartData} />
          </CardContent>
        </Card>

        {/* Waterfall */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">CTC Bridge — Current to Proposed</h2>
                <p className="text-xs text-muted-foreground">How each component contributes to the change in Total CTC</p>
              </div>
              {selectedCompanies.length > 1 && (
                <Tabs value={activeCompany} onValueChange={(v) => setActiveCompany(v as any)}>
                  <TabsList>
                    {selectedCompanies.map((id) => (
                      <TabsTrigger key={id} value={id}>
                        {COMPANIES[id].name.replace("Hexagon ", "")}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
            <WaterfallChart steps={waterfallSteps} />
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {structures.map((s) => (
            <motion.div key={s.companyId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <SummaryCard structure={s} currentTotalCTC={currentTotal} />
            </motion.div>
          ))}
        </div>

        {/* Component mapping */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-sky" />
              <h2 className="font-semibold">Component Mapping — {COMPANIES[activeCompany].name}</h2>
            </div>
            <div className="space-y-2">
              {(mappings[activeCompany] || []).map((m, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{m.sourceName}</span>
                      <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sky">{m.mappedTo}</span>
                    </div>
                    <Badge variant={m.isDirectMatch ? "default" : "neutral"}>
                      {m.isDirectMatch ? "Direct Match" : "Consolidated"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{m.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="mb-24 border-sky/20">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky" />
              <h2 className="font-semibold">AI Executive Insights</h2>
            </div>
            {loadingInsights && !insights && (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating consultant-grade insights…
              </div>
            )}
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{insights}</p>
          </CardContent>
        </Card>
      </div>

    </main>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
