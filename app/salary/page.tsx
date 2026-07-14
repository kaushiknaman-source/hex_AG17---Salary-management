"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, ArrowLeft, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SalaryComponentRow } from "@/components/salary-component-row";
import { useSalaryStore } from "@/lib/store";
import {
  COMPANIES,
  CompanyId,
  Grade,
  GRADES,
  SalaryComponent,
  totalAnnual,
  totalMonthly,
  splitFixedVariable,
  formatINR,
} from "@/lib/salary-engine";
import { Wallet, CalendarDays, PieChart as PieChartIcon, Gift } from "lucide-react";

const STEPS = ["Current Structure", "AI Classification", "Target & Companies"];

export default function SalaryPage() {
  const router = useRouter();
  const {
    employee,
    setEmployee,
    components,
    setComponents,
    updateComponent,
    addComponent,
    removeComponent,
    reorderComponents,
    targetCTC,
    setTargetCTC,
    selectedCompanies,
    setSelectedCompanies,
    grade,
    setGrade,
    pushHistory,
  } = useSalaryStore();

  const [step, setStep] = useState(0);
  const [classifying, setClassifying] = useState(false);
  const [classified, setClassified] = useState(false);

  const total = totalAnnual(components);
  const monthlyTotal = totalMonthly(components);
  const { fixedAnnual, variableAnnual, fixedPct, variablePct } = splitFixedVariable(components);

  const runClassification = async () => {
    setClassifying(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          components: components
            .filter((c) => (c.annual ?? 0) > 0 || c.name.trim())
            .map((c) => ({ id: c.id, name: c.name, description: c.description })),
        }),
      });
      const data = await res.json();
      const map = new Map<string, string>(
        (data.classifications || []).map((c: any) => [c.id, c.category])
      );
      setComponents(
        components.map((c) =>
          map.has(c.id) ? { ...c, category: map.get(c.id) as any } : c
        )
      );
      setClassified(true);
    } catch (e) {
      console.error(e);
    } finally {
      setClassifying(false);
    }
  };

  const goToStep = async (next: number) => {
    if (step === 0 && next === 1) {
      setStep(1);
      if (!classified) await runClassification();
      return;
    }
    setStep(next);
  };

  const handleAddComponent = () => {
    addComponent({
      id: `custom-${Date.now()}`,
      name: "",
      monthly: null,
      annual: null,
      description: "",
      isCustom: true,
    });
  };

  const handleGenerate = () => {
    pushHistory({
      id: `analysis-${Date.now()}`,
      timestamp: Date.now(),
      employeeName: employee.name,
      targetCTC: targetCTC || 0,
      companies: selectedCompanies,
    });
    router.push("/results");
  };

  const selectCompany = (id: CompanyId) => {
    setSelectedCompanies([id]);
  };

  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky">
            Salary Structuring
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">
            Build the candidate&rsquo;s offer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The candidate&rsquo;s current CTC is required — that&rsquo;s what an HR-standard
            offer gets built from. Everything else, including a component-level breakup, is
            optional.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-sky text-[#00161F]"
                    : i === step
                    ? "bg-sky text-[#00161F]"
                    : "bg-white/5 text-muted-foreground ring-1 ring-white/10"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-sky/25">
                <CardContent className="p-6">
                  <h2 className="font-semibold">Candidate&rsquo;s current CTC</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Required. This is the number every HR decision downstream is anchored to — the
                    offer, the hike, and whether it clears policy.
                  </p>
                  <div className="mt-4 max-w-xs">
                    <Label>Current CTC (₹ / annum)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="mt-1.5 text-lg font-semibold"
                      value={employee.currentCTC ?? ""}
                      onChange={(e) =>
                        setEmployee({
                          currentCTC: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="As disclosed by the candidate"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Employee name">
                    <Input
                      value={employee.name}
                      onChange={(e) => setEmployee({ name: e.target.value })}
                      placeholder="Optional"
                    />
                  </Field>
                  <Field label="Employee ID">
                    <Input
                      value={employee.employeeId}
                      onChange={(e) => setEmployee({ employeeId: e.target.value })}
                      placeholder="Optional"
                    />
                  </Field>
                  <Field label="Designation">
                    <Input
                      value={employee.designation}
                      onChange={(e) => setEmployee({ designation: e.target.value })}
                      placeholder="Optional"
                    />
                  </Field>
                  <Field label="Grade">
                    <Select
                      value={employee.grade}
                      onChange={(e) => {
                        setEmployee({ grade: e.target.value as Grade });
                        setGrade(e.target.value as Grade);
                      }}
                    >
                      <option value="">Unspecified</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Current company">
                    <Input
                      value={employee.currentCompany}
                      onChange={(e) => setEmployee({ currentCompany: e.target.value })}
                      placeholder="Optional"
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">Current CTC breakup (optional)</h2>
                      <p className="text-xs text-muted-foreground">
                        Only if the candidate has shared it. Delete, rename, or reorder anything —
                        add unlimited custom components.
                      </p>
                    </div>
                    <Badge variant="default">Total (annual): {formatINR(total)}</Badge>
                  </div>

                  <div className="space-y-2">
                    {components.map((c, i) => (
                      <SalaryComponentRow
                        key={c.id}
                        component={c}
                        index={i}
                        total={components.length}
                        onChange={(patch) => updateComponent(c.id, patch)}
                        onRemove={() => removeComponent(c.id)}
                        onMove={(dir) => {
                          const to = i + dir;
                          if (to >= 0 && to < components.length) reorderComponents(i, to);
                        }}
                      />
                    ))}
                  </div>

                  <Button variant="outline" className="mt-4" onClick={handleAddComponent}>
                    <Plus className="h-4 w-4" /> Add Salary Component
                  </Button>
                </CardContent>
              </Card>

              {/* Quick-glance CTC summary — standard HR readout */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <SummaryStat icon={CalendarDays} label="Total Annual" value={formatINR(total, { compact: true })} />
                <SummaryStat icon={Wallet} label="Total Monthly" value={formatINR(monthlyTotal, { compact: true })} />
                <SummaryStat
                  icon={PieChartIcon}
                  label="Fixed Pay"
                  value={formatINR(fixedAnnual, { compact: true })}
                  sub={`${(fixedPct * 100).toFixed(1)}% of CTC`}
                />
                <SummaryStat
                  icon={Gift}
                  label="Variable Pay"
                  value={formatINR(variableAnnual, { compact: true })}
                  sub={`${(variablePct * 100).toFixed(1)}% of CTC`}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                {!employee.currentCTC && (
                  <p className="text-xs text-muted-foreground">
                    Enter the candidate&rsquo;s current CTC to continue
                  </p>
                )}
                <Button size="lg" onClick={() => goToStep(1)} disabled={!employee.currentCTC}>
                  Analyse with AI <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky" />
                    <h2 className="font-semibold">AI Salary Classification</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Claude has reviewed each component and filed it under the standard
                    compensation taxonomy.
                  </p>

                  {classifying ? (
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-sky" />
                      <p className="text-sm">Classifying components…</p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-2">
                      {components
                        .filter((c) => c.name.trim())
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatINR(c.annual ?? 0)} / year
                              </p>
                            </div>
                            <Badge variant="default">{c.category || "Uncategorised"}</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)} disabled={classifying}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold">Offered Fixed CTC</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Candidate&rsquo;s current CTC is {formatINR(employee.currentCTC ?? 0)}. Pick a
                    standard hike band or enter the offered figure directly.
                  </p>
                  <div className="mt-4 max-w-xs">
                    <Label>Target Fixed CTC (₹ / annum)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="mt-1.5 text-lg font-semibold"
                      placeholder="e.g. 3000000"
                      value={targetCTC ?? ""}
                      onChange={(e) =>
                        setTargetCTC(e.target.value === "" ? null : Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[15, 20, 25, 30].map((hikePct) => {
                      const suggested = employee.currentCTC
                        ? Math.round((employee.currentCTC * (1 + hikePct / 100)) / 1000) * 1000
                        : null;
                      const active = suggested != null && targetCTC === suggested;
                      return (
                        <button
                          key={hikePct}
                          onClick={() => suggested != null && setTargetCTC(suggested)}
                          disabled={suggested == null}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-30 ${
                            active
                              ? "border-sky/50 bg-sky/[0.1] text-sky"
                              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-sky/40 hover:text-sky"
                          }`}
                        >
                          +{hikePct}% &middot; {suggested != null ? formatINR(suggested, { compact: true }) : "—"}
                        </button>
                      );
                    })}
                  </div>
                  {employee.currentCTC && targetCTC ? (
                    <p className="mt-4 text-sm">
                      <span className="text-muted-foreground">Hike over current CTC of </span>
                      <span className="font-medium">{formatINR(employee.currentCTC)}</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="font-semibold text-sky">
                        {(((targetCTC - employee.currentCTC) / employee.currentCTC) * 100).toFixed(1)}%
                      </span>
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold">Benchmark against</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose exactly one company to generate the proposed structure against.
                  </p>
                  <div
                    role="radiogroup"
                    aria-label="Benchmark company"
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
                  >
                    {Object.values(COMPANIES).map((c) => {
                      const active = selectedCompanies[0] === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => selectCompany(c.id)}
                          className={`relative rounded-xl border p-4 text-left transition-all ${
                            active
                              ? "border-sky/50 bg-sky/[0.08] ring-1 ring-sky/30"
                              : "border-white/10 bg-white/[0.02] hover:border-white/25"
                          }`}
                        >
                          <span
                            className={`absolute right-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border ${
                              active ? "border-sky bg-sky" : "border-white/20"
                            }`}
                          >
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-[#00161F]" />}
                          </span>
                          <p className="pr-6 text-sm font-semibold">{c.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {c.gratuityStatedRate}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!targetCTC || selectedCompanies.length === 0}
                >
                  Generate Offer Structure <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-lg font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
