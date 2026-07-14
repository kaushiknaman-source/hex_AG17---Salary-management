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
  formatINR,
  pctDiff,
  COMPANIES,
} from "@/lib/salary-engine";
import { exportComparisonPDF } from "@/lib/export-pdf";
import { exportComparisonExcel } from "@/lib/export-excel";

export default function ResultsPage() {
  const { employee, components, targetCTC, selectedCompany, grade } = useSalaryStore();
  const [insights, setInsights] = useState("");
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
    lines.push("");
    lines.push(`Compliance: ${complianceChecks.filter((c) => c.status === "passed").length}/${complianceChecks.length} checks passed.`);
    return lines.join("\n");
  }, [structure, employee, offerSignals, complianceChecks]);

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportComparisonExcel({ employeeName: employee.name, current: components, structures: [structure] })}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button size="sm" onClick={() => exportComparisonPDF({ employeeName: employee.name, targetCTC, structures: [structure], insights })}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAiPanelOpen((v) => !v)}>
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </Button>
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
