"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  Sparkles,
  ArrowLeft,
  Loader2,
  Target,
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  IdCard,
  Gauge,
  ShieldAlert,
  ScrollText,
  Save,
  CheckCircle2,
  History as HistoryIcon,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/results/summary-card";
import { StackedComparisonChart, CompositionBar } from "@/components/results/stacked-comparison-chart";
import { WaterfallChart, WaterfallStep } from "@/components/results/waterfall-chart";
import { MetricComparisonCard } from "@/components/results/metric-comparison-card";
import { ComponentBreakdownTable } from "@/components/results/component-breakdown-table";
import { CompositionDonut } from "@/components/results/composition-donut";
import { CompliancePanel } from "@/components/results/compliance-panel";
import { BenchmarkPanel } from "@/components/results/benchmark-panel";
import { OfferSummary } from "@/components/results/offer-summary";
import { AiSidePanel } from "@/components/ai-side-panel";
import { useSalaryStore } from "@/lib/store";
import {
  computeProposedStructure,
  computeCurrentSummary,
  buildDetailedRows,
  computeComplianceChecks,
  computeOfferSignals,
  computeCompensationTotals,
  retentionBondSchedule,
  COMPENSATION_TYPE_LABELS,
  formatINR,
  pctDiff,
  COMPANIES,
} from "@/lib/salary-engine";
import { exportComparisonPDF } from "@/lib/export-pdf";
import { exportComparisonExcel } from "@/lib/export-excel";

function analysisLabel(designation: string, experienceYears: number | null) {
  const role = designation.trim() || "Unspecified Role";
  const exp = experienceYears != null ? `${experienceYears} yrs exp` : "Exp n/a";
  return `${role} — ${exp}`;
}

export default function ResultsPage() {
  const { employee, components, compensationItems, targetCTC, selectedCompany, grade, saveAnalysis } = useSalaryStore();
  const [insights, setInsights] = useState("");
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const currentSummary = useMemo(() => computeCurrentSummary(components), [components]);

  const structure = useMemo(
    () => (targetCTC ? computeProposedStructure(selectedCompany, targetCTC, grade || undefined) : null),
    [selectedCompany, targetCTC, grade]
  );

  const detailedRows = useMemo(
    () => (structure ? buildDetailedRows(components, selectedCompany, structure) : []),
    [components, selectedCompany, structure]
  );

  const complianceChecks = useMemo(
    () => (structure ? computeComplianceChecks(structure, selectedCompany) : []),
    [structure, selectedCompany]
  );

  const offerSignals = useMemo(
    () => (structure ? computeOfferSignals(employee.currentCTC, structure.totalCTC) : null),
    [structure, employee.currentCTC]
  );

  const compTotals = useMemo(() => computeCompensationTotals(compensationItems), [compensationItems]);
  const totalCTCInclSpecial = structure ? structure.totalCTC + compTotals.totalInCTC : 0;

  const chartData: CompositionBar[] = useMemo(() => {
    if (!structure) return [];
    return [
      {
        label: "Current",
        basic: currentSummary.basic,
        hra: currentSummary.hraAndConveyance,
        specialAllowance: currentSummary.specialAllowance,
        retirals: currentSummary.employerContribution,
        variablePay: currentSummary.variablePay,
        other: currentSummary.otherBenefits,
      },
      {
        label: COMPANIES[structure.companyId].name.replace("Hexagon ", ""),
        basic: structure.basic,
        hra: structure.hra + structure.conveyanceAllowance,
        specialAllowance: structure.specialAllowance,
        retirals: structure.totalRetiral,
        variablePay: structure.annualIncentive,
        other: structure.mealAllowance + structure.flexiAttire,
      },
    ];
  }, [currentSummary, structure]);

  const donutData = useMemo(() => {
    if (!structure) return [];
    return [
      { name: "Basic", value: structure.basic, color: "#01ADFF" },
      { name: "Allowances", value: structure.hra + structure.conveyanceAllowance + structure.specialAllowance, color: "#04D0E6" },
      { name: "Employer Contribution", value: structure.totalRetiral, color: "#83C410" },
      { name: "Variable Pay", value: structure.annualIncentive, color: "#DFF73F" },
      { name: "Other Benefits", value: structure.mealAllowance + structure.flexiAttire, color: "#106B73" },
    ].filter((d) => d.value > 0);
  }, [structure]);

  const waterfallSteps: WaterfallStep[] = useMemo(() => {
    if (!structure) return [];
    return [
      { label: "Current CTC", delta: currentSummary.totalAnnual, isTotal: true },
      { label: "Basic", delta: structure.basic - currentSummary.basic },
      { label: "HRA + Conveyance", delta: structure.hra + structure.conveyanceAllowance - currentSummary.hraAndConveyance },
      { label: "Special Allowance", delta: structure.specialAllowance - currentSummary.specialAllowance },
      { label: "Retirals", delta: structure.totalRetiral - currentSummary.employerContribution },
      { label: "Variable Pay", delta: structure.annualIncentive - currentSummary.variablePay },
      { label: "Meal / Other", delta: structure.mealAllowance + structure.flexiAttire - currentSummary.otherBenefits },
      { label: "Proposed CTC", delta: structure.totalCTC, isTotal: true },
    ];
  }, [currentSummary, structure]);

  const offerSummaryText = useMemo(() => {
    if (!structure) return "";
    const lines: string[] = [];
    lines.push(`OFFER SUMMARY — ${structure.companyName}`);
    lines.push("");
    if (employee.name) lines.push(`Candidate: ${employee.name}${employee.designation ? `, ${employee.designation}` : ""}`);
    if (employee.businessUnit) lines.push(`Business Unit: ${employee.businessUnit}`);
    if (employee.location) lines.push(`Location: ${employee.location}`);
    if (employee.grade) lines.push(`Hiring Grade: ${employee.grade}`);
    if (employee.currentEmployer) lines.push(`Current Employer: ${employee.currentEmployer}`);
    if (employee.currentCTC) lines.push(`Current Annual CTC: ${formatINR(employee.currentCTC)}`);
    lines.push("");
    lines.push(`Proposed Fixed CTC: ${formatINR(structure.fixedCTCCheck)}`);
    lines.push(`Proposed Target Variable Pay: ${formatINR(structure.annualIncentive)}`);
    lines.push(`Recommended Total CTC: ${formatINR(structure.totalCTC)}`);
    if (offerSignals?.increasePct != null) {
      lines.push(`Increase vs Current: ${offerSignals.increasePct >= 0 ? "+" : ""}${(offerSignals.increasePct * 100).toFixed(1)}%`);
      lines.push(`Offer Competitiveness: ${offerSignals.competitiveness}`);
      lines.push(`Retention Risk: ${offerSignals.retentionRisk}`);
    }
    lines.push("");
    lines.push(`Basic: ${formatINR(structure.basic)}  |  HRA: ${formatINR(structure.hra)}  |  Special/Flexi Allowance: ${formatINR(structure.specialAllowance)}`);
    lines.push(`Employer PF: ${formatINR(structure.employerPF)}  |  Gratuity: ${formatINR(structure.gratuity)}`);
    if (structure.mealAllowance) lines.push(`Meal Allowance: ${formatINR(structure.mealAllowance)}`);
    if (structure.flexiAttire) lines.push(`Flexi Attire Benefit (Grade ${structure.grade}): ${formatINR(structure.flexiAttire)}`);
    if (compensationItems.length) {
      lines.push("");
      lines.push("Special Compensation:");
      compensationItems.filter((c) => c.name.trim()).forEach((c) => {
        const isBond = c.type === "retention-bond";
        const value = isBond ? (c.annualAmount ?? 0) : (c.amount ?? 0);
        const suffix = isBond ? `/yr for ${c.commitmentYears ?? 0} yrs, clawback on early exit` : "";
        lines.push(`  ${c.name} (${COMPENSATION_TYPE_LABELS[c.type]}): ${formatINR(value)}${suffix} — ${c.includeInCTC ? "included in CTC" : "outside CTC"}`);
      });
      if (compTotals.totalInCTC > 0) {
        lines.push(`  Total CTC incl. special compensation: ${formatINR(totalCTCInclSpecial)}`);
      }
    }
    lines.push("");
    lines.push(`Compliance: ${complianceChecks.filter((c) => c.status === "passed").length}/${complianceChecks.length} checks passed.`);
    return lines.join("\n");
  }, [structure, employee, offerSignals, complianceChecks, compensationItems, compTotals, totalCTCInclSpecial]);

  const handleSaveAnalysis = () => {
    if (!structure || !targetCTC) return;
    const id = `analysis-${Date.now()}`;
    saveAnalysis({
      id,
      timestamp: Date.now(),
      label: analysisLabel(employee.designation, employee.experienceYears),
      employeeName: employee.name,
      designation: employee.designation,
      experienceYears: employee.experienceYears,
      businessUnit: employee.businessUnit,
      location: employee.location,
      targetCTC,
      company: selectedCompany,
      totalCTC: totalCTCInclSpecial,
      snapshot: {
        employee,
        components,
        compensationItems,
        targetCTC,
        selectedCompany,
        grade,
      },
    });
    setSavedRecordId(id);
  };

  useEffect(() => {
    if (!structure) return;
    const run = async () => {
      setLoadingInsights(true);
      setInsights("");
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee,
            current: currentSummary,
            proposals: [{ ...structure, offerSignals }],
            targetCTC,
            mappings: { [selectedCompany]: detailedRows },
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
  }, [targetCTC, selectedCompany, grade]);

  if (!targetCTC || !selectedCompany || !structure) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">No analysis yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">Run the salary structuring flow first to see comparison results here.</p>
        <Link href="/salary"><Button>Start Salary Analysis</Button></Link>
      </main>
    );
  }

  const diffVsEmployer = employee.currentCTC ? structure.totalCTC - employee.currentCTC : null;
  const chatContext = { employee, currentSummary, targetCTC, structure, detailedRows, offerSignals, complianceChecks };

  const benchmarkEntries = [
    ...(employee.currentCTC ? [{ label: "Current Employer" + (employee.currentEmployer ? ` (${employee.currentEmployer})` : ""), value: employee.currentCTC, color: "#B9B9BD" }] : []),
    { label: `Hexagon Policy — ${structure.companyName} (Recommended)`, value: structure.totalCTC, color: "#01ADFF" },
    ...(employee.departmentBudgetCap ? [{ label: "Department Budget Cap", value: employee.departmentBudgetCap, color: "#FFC505", note: structure.totalCTC > employee.departmentBudgetCap ? "Recommended offer exceeds the budget cap on file." : "Within the budget cap on file." }] : []),
  ];

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur lg:px-8">
        <Link href="/salary" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-sky">
          <ArrowLeft className="h-3 w-3" /> Back to structuring
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href="/history">
            <Button variant="outline" size="sm">
              <HistoryIcon className="h-3.5 w-3.5" /> History
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => exportComparisonExcel({ employeeName: employee.name, current: components, structures: [structure] })}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button size="sm" onClick={() => exportComparisonPDF({ employeeName: employee.name, targetCTC, structures: [structure], insights })}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAiPanelOpen((v) => !v)}>
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </Button>
          {savedRecordId ? (
            <Button variant="secondary" size="sm" disabled>
              <CheckCircle2 className="h-3.5 w-3.5 text-land" /> Saved
            </Button>
          ) : (
            <Button size="sm" onClick={handleSaveAnalysis}>
              <Save className="h-3.5 w-3.5" /> Save to History
            </Button>
          )}
        </div>
      </header>

      <div className={`mx-auto max-w-6xl px-6 py-6 lg:px-8 ${aiPanelOpen ? "lg:pr-[400px]" : ""}`}>
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {employee.name ? `${employee.name}'s` : "Employee"} Compensation Recommendation
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {employee.employeeId && <Badge variant="neutral"><IdCard className="h-3 w-3" /> {employee.employeeId}</Badge>}
            {employee.designation && <Badge variant="neutral">{employee.designation}</Badge>}
            {employee.businessUnit && <Badge variant="neutral">{employee.businessUnit}</Badge>}
            {employee.location && <Badge variant="neutral">{employee.location}</Badge>}
            {employee.grade && <Badge variant="neutral">Grade {employee.grade}</Badge>}
            {employee.currentEmployer && <Badge variant="neutral">From {employee.currentEmployer}</Badge>}
            <Badge variant="default">Benchmarked against {structure.companyName}</Badge>
          </div>
        </div>

        {/* Save to history */}
        <Card className={`mb-5 ${savedRecordId ? "border-land/30 bg-land/[0.04]" : "border-sky/20 bg-sky/[0.03]"}`}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2.5">
              {savedRecordId ? <CheckCircle2 className="h-4 w-4 text-land" /> : <Save className="h-4 w-4 text-sky" />}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {savedRecordId ? "Saved to Analysis History" : "This comparison hasn't been saved yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Will be filed as <span className="font-medium text-foreground">{analysisLabel(employee.designation, employee.experienceYears)}</span>
                  {" "}— searchable anytime from the History page.
                </p>
              </div>
            </div>
            {savedRecordId ? (
              <Link href="/history">
                <Button variant="outline" size="sm">
                  <HistoryIcon className="h-3.5 w-3.5" /> View in History
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={handleSaveAnalysis}>
                <Save className="h-3.5 w-3.5" /> Save to History
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Top summary */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryStat icon={Wallet} label="Current Employer CTC" value={employee.currentCTC ? formatINR(employee.currentCTC) : "Not provided"} />
          <SummaryStat icon={Target} label="Target Fixed CTC" value={formatINR(structure.fixedCTCCheck)} />
          <SummaryStat icon={Banknote} label="Target Variable" value={formatINR(structure.annualIncentive)} />
          <SummaryStat icon={ShieldAlert} label="Recommended Total CTC" value={formatINR(structure.totalCTC)} highlight />
          <SummaryStat
            icon={diffVsEmployer != null && diffVsEmployer >= 0 ? TrendingUp : TrendingDown}
            label="Difference vs Current Employer"
            value={diffVsEmployer != null ? `${diffVsEmployer >= 0 ? "+" : ""}${formatINR(diffVsEmployer, { compact: true })}` : "—"}
            sub={offerSignals?.increasePct != null ? `${offerSignals.increasePct >= 0 ? "+" : ""}${(offerSignals.increasePct * 100).toFixed(1)}%` : undefined}
            positive={diffVsEmployer != null ? diffVsEmployer >= 0 : undefined}
          />
          <SummaryStat icon={Gauge} label="Offer Competitiveness" value={offerSignals?.competitiveness ?? "Unknown"} />
          <SummaryStat icon={ShieldAlert} label="Retention Risk" value={offerSignals?.retentionRisk ?? "Unknown"} positive={offerSignals?.retentionRisk === "Low"} />
          <SummaryStat icon={Banknote} label="Current Structure Total" value={formatINR(currentSummary.totalAnnual)} sub="From itemized components" />
        </div>

        {/* Visual analytics */}
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold">Compensation Breakdown — Current vs Proposed</h2>
              <p className="mb-1 text-xs text-muted-foreground">Annual figures, {structure.companyName}</p>
              <StackedComparisonChart data={chartData} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold">Component Distribution</h2>
              <p className="mb-1 text-xs text-muted-foreground">Proposed structure mix</p>
              <CompositionDonut data={donutData} />
            </CardContent>
          </Card>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold">CTC Bridge — Current to Proposed</h2>
              <p className="mb-1 text-xs text-muted-foreground">Waterfall of the change in Total CTC</p>
              <WaterfallChart steps={waterfallSteps} />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-5">
            <MetricComparisonCard label="Employer Contribution (Annual)" icon={Banknote} current={currentSummary.employerContribution} proposed={structure.totalRetiral} />
            <MetricComparisonCard label="Estimated Take-Home" icon={Wallet} current={currentSummary.takeHomeMonthly} proposed={structure.basePay / 12} cadence="per month" />
          </div>
        </div>

        {/* AI Recommendation panel */}
        <Card className="mb-5 border-sky/20 bg-sky/[0.03]">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky" />
              <h2 className="text-sm font-semibold">AI Recommendation</h2>
            </div>
            {loadingInsights && !insights && (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating recommendation…
              </div>
            )}
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{insights}</p>
          </CardContent>
        </Card>

        {/* Special Compensation */}
        {compensationItems.length > 0 && (
          <Card className="mb-5">
            <CardContent className="p-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Special Compensation</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="sea">In CTC: {formatINR(compTotals.totalInCTC)}</Badge>
                  <Badge variant="neutral">Outside CTC: {formatINR(compTotals.totalOutsideCTC)}</Badge>
                </div>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {compTotals.totalInCTC > 0
                  ? `Total CTC including special compensation: ${formatINR(totalCTCInclSpecial)}`
                  : "None of these items are currently added to the headline CTC."}
              </p>
              <div className="divide-y divide-border">
                {compensationItems.filter((c) => c.name.trim()).map((c) => {
                  const isBond = c.type === "retention-bond";
                  const schedule = isBond ? retentionBondSchedule(c) : [];
                  const value = isBond ? c.annualAmount ?? 0 : c.amount ?? 0;
                  return (
                    <div key={c.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{COMPENSATION_TYPE_LABELS[c.type]}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatINR(value)}{isBond ? " / yr" : ""}
                          </span>
                          <Badge variant={c.includeInCTC ? "sea" : "neutral"}>
                            {c.includeInCTC ? "In CTC" : "Outside CTC"}
                          </Badge>
                        </div>
                      </div>
                      {isBond && schedule.length > 0 && (
                        <div className="mt-2 overflow-x-auto rounded-md border border-warn/30 bg-warn/[0.05] p-2.5">
                          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-warn">
                            <ShieldAlert className="h-3 w-3" /> {c.commitmentYears}-year commitment · recoverable pro-rata on early exit
                          </p>
                          <table className="w-full text-xs">
                            <tbody>
                              <tr className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
                                {schedule.map((row) => (
                                  <td key={row.year} className="py-1 pr-3 font-semibold">Year {row.year}</td>
                                ))}
                              </tr>
                              <tr>
                                {schedule.map((row) => (
                                  <td key={row.year} className="py-1 pr-3 tabular-nums text-warn">
                                    {row.recoverableIfExitAfterThisYear > 0 ? `Recover ${formatINR(row.recoverableIfExitAfterThisYear, { compact: true })}` : "Fully vested"}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                      {c.notes && <p className="mt-1.5 text-xs text-muted-foreground">{c.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance + Benchmark */}
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-1 text-sm font-semibold">Compliance Indicators</h2>
              <CompliancePanel checks={complianceChecks} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Benchmark</h2>
              <BenchmarkPanel entries={benchmarkEntries} />
              {benchmarkEntries.length === 1 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Add the candidate&rsquo;s current CTC and, optionally, a department budget cap on the Employee Information step to see them benchmarked here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proposed structure + breakdown table */}
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <SummaryCard structure={structure} currentTotalCTC={currentSummary.totalAnnual} />
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Component Breakdown</h2>
              <ComponentBreakdownTable rows={detailedRows} />
            </CardContent>
          </Card>
        </div>

        {/* Offer summary */}
        <Card className="mb-10">
          <CardContent className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Offer Summary</h2>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">Ready to copy into the offer approval workflow.</p>
            <OfferSummary text={offerSummaryText} />
          </CardContent>
        </Card>
      </div>

      <AiSidePanel context={chatContext} open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
    </main>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
  positive,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-sky/30 bg-sky/[0.04]" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <p className="text-[10.5px] font-semibold uppercase tracking-wide">{label}</p>
        </div>
        <p className="mt-1.5 text-lg font-bold tracking-tight">{value}</p>
        {sub && (
          <p className={`mt-0.5 text-xs font-semibold ${positive === undefined ? "text-muted-foreground" : positive ? "text-land" : "text-danger"}`}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
