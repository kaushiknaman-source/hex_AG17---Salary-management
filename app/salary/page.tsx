"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SalaryComponentRow } from "@/components/salary-component-row";
import { CompensationItemRow } from "@/components/compensation-item-row";
import { WorkflowTimeline, WorkflowStage } from "@/components/workflow-timeline";
import { useSalaryStore } from "@/lib/store";
import { BUSINESS_UNITS } from "@/lib/store";
import {
  COMPANIES,
  Grade,
  GRADES,
  totalAnnual,
  formatINR,
  createCompensationItem,
  computeCompensationTotals,
} from "@/lib/salary-engine";

const STAGE_LABELS = [
  "Employee Information",
  "Current Compensation",
  "AI Classification",
  "Framework Comparison",
  "Special Compensation",
  "Export",
];

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
    selectedCompany,
    setSelectedCompany,
    setGrade,
    compensationItems,
    addCompensationItem,
    updateCompensationItem,
    removeCompensationItem,
  } = useSalaryStore();

  const [step, setStep] = useState(0);
  const [classifying, setClassifying] = useState(false);
  const [classified, setClassified] = useState(false);

  const total = totalAnnual(components);
  const compTotals = computeCompensationTotals(compensationItems);
  const employeeInfoComplete = !!employee.currentCTC && employee.currentCTC > 0;

  const stages: WorkflowStage[] = STAGE_LABELS.map((label, i) => ({
    label,
    status: i < step ? "done" : i === step ? "current" : "upcoming",
  }));

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
      const map = new Map<string, { category: string; confidence: number }>(
        (data.classifications || []).map((c: any) => [c.id, { category: c.category, confidence: c.confidence }])
      );
      setComponents(
        components.map((c) =>
          map.has(c.id)
            ? { ...c, category: map.get(c.id)!.category as any, confidence: map.get(c.id)!.confidence }
            : c
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
    if (step === 1 && next === 2) {
      setStep(2);
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

  const handleAddCompensationItem = () => {
    addCompensationItem(createCompensationItem());
  };

  const handleGenerate = () => {
    router.push("/results");
  };

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">Salary Structuring</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">{STAGE_LABELS[step]}</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6 lg:px-8">
        <div className="mb-5">
          <WorkflowTimeline stages={stages} />
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <SectionHeader
              title="Employee Information"
              description="Candidate and role details. Current Annual CTC is required — every other field is optional."
            />
            <Card>
              <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Employee name">
                  <Input value={employee.name} onChange={(e) => setEmployee({ name: e.target.value })} placeholder="Optional" />
                </Field>
                <Field label="Employee ID">
                  <Input value={employee.employeeId} onChange={(e) => setEmployee({ employeeId: e.target.value })} placeholder="Optional" />
                </Field>
                <Field label="Designation">
                  <Input value={employee.designation} onChange={(e) => setEmployee({ designation: e.target.value })} placeholder="Optional" />
                </Field>
                <Field label="Hiring grade">
                  <Select
                    value={employee.grade}
                    onChange={(e) => {
                      setEmployee({ grade: e.target.value as Grade });
                      setGrade(e.target.value as Grade);
                    }}
                  >
                    <option value="">Unspecified</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Business unit">
                  <Select value={employee.businessUnit} onChange={(e) => setEmployee({ businessUnit: e.target.value as any })}>
                    <option value="">Unspecified</option>
                    {BUSINESS_UNITS.map((bu) => (
                      <option key={bu} value={bu}>{bu}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Location">
                  <Input value={employee.location} onChange={(e) => setEmployee({ location: e.target.value })} placeholder="e.g. Gurugram" />
                </Field>
                <Field label="Experience (years)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={employee.experienceYears ?? ""}
                    onChange={(e) => setEmployee({ experienceYears: e.target.value === "" ? null : Number(e.target.value) })}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Current employer">
                  <Input
                    value={employee.currentEmployer}
                    onChange={(e) => setEmployee({ currentEmployer: e.target.value })}
                    placeholder="e.g. ABB, Siemens, Trimble, Leica"
                  />
                </Field>
                <Field label="Current company / entity (if internal)">
                  <Input value={employee.currentCompany} onChange={(e) => setEmployee({ currentCompany: e.target.value })} placeholder="Optional" />
                </Field>
              </CardContent>
            </Card>

            <Card className="border-sky/25 bg-sky/[0.03]">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Candidate current annual CTC — required">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={employee.currentCTC ?? ""}
                      onChange={(e) => setEmployee({ currentCTC: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="e.g. 1800000"
                      className="text-base font-semibold"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      From the candidate&rsquo;s existing employer. Used to benchmark the proposed Hexagon package.
                    </p>
                  </Field>
                  <Field label="Department budget cap (optional)">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={employee.departmentBudgetCap ?? ""}
                      onChange={(e) => setEmployee({ departmentBudgetCap: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="e.g. 2800000"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shown as a reference point on the results benchmark panel.
                    </p>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" onClick={() => setStep(1)} disabled={!employeeInfoComplete}>
                Continue to Current Compensation <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {!employeeInfoComplete && (
              <p className="text-right text-xs text-muted-foreground">Enter the candidate&rsquo;s current annual CTC to continue.</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <SectionHeader
              title="Current Compensation"
              description="Add as many or as few components as you know. Classification, taxability, and AI mapping update live as you type."
            />
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <p className="text-sm font-semibold">Salary components</p>
                  <Badge variant="sea">Total (annual): {formatINR(total)}</Badge>
                </div>

                <div className="hidden grid-cols-12 gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <div className="col-span-3">Component</div>
                  <div className="col-span-2 text-right">Monthly</div>
                  <div className="col-span-2 text-right">Annual</div>
                  <div className="col-span-2 text-center">Classification</div>
                  <div className="col-span-2 text-center">Taxability / AI Mapping</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div>
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

                <div className="p-3">
                  <Button variant="outline" onClick={handleAddComponent}>
                    <Plus className="h-4 w-4" /> Add Salary Component
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={() => goToStep(2)}>
                Run AI Classification <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <SectionHeader
              title="AI Classification"
              description="Claude has reviewed each component's name and description and filed it under the standard compensation taxonomy, with a confidence score."
            />
            <Card>
              <CardContent className="p-0">
                {classifying ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-sky" />
                    <p className="text-sm">Classifying components…</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2.5">Component</th>
                        <th className="px-4 py-2.5 text-right">Annual</th>
                        <th className="px-4 py-2.5">Classification</th>
                        <th className="px-4 py-2.5">Taxability</th>
                        <th className="px-4 py-2.5 text-right">AI Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.filter((c) => c.name.trim()).map((c) => (
                        <tr key={c.id} className="border-b border-border/70 last:border-0">
                          <td className="px-4 py-3 font-medium">{c.name}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatINR(c.annual ?? 0)}</td>
                          <td className="px-4 py-3"><Badge variant="default">{c.category || "Uncategorised"}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground">{c.taxability ?? "—"}</td>
                          <td className="px-4 py-3 text-right">
                            {c.confidence != null ? (
                              <span className={c.confidence >= 90 ? "font-semibold text-land" : c.confidence >= 70 ? "font-semibold text-warn" : "font-semibold text-danger"}>
                                {c.confidence}%
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={() => setStep(3)} disabled={classifying}>
                Continue to Framework Comparison <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <SectionHeader
              title="Framework Comparison"
              description="Set the target Fixed CTC and choose exactly one company. The proposed structure is built entirely on that company's official compensation policy."
            />
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold">Target Fixed CTC</h2>
                <div className="mt-3 max-w-xs">
                  <Label>Target Fixed CTC (₹ / annum)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="mt-1.5 text-base font-semibold"
                    placeholder="e.g. 3000000"
                    value={targetCTC ?? ""}
                    onChange={(e) => setTargetCTC(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1800000, 2400000, 3000000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTargetCTC(v)}
                      className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground hover:border-sky/40 hover:text-sky"
                    >
                      {formatINR(v, { compact: true })}
                    </button>
                  ))}
                </div>
                {employee.currentCTC && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Candidate&rsquo;s current CTC on record: <span className="font-medium text-foreground">{formatINR(employee.currentCTC)}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold">Benchmark against</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup">
                  {Object.values(COMPANIES).map((c) => {
                    const active = selectedCompany === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedCompany(c.id)}
                        className={`relative rounded-lg border p-4 text-left transition-all ${
                          active ? "border-sky/50 bg-sky/[0.05] ring-1 ring-sky/30" : "border-border bg-white/[0.02] hover:border-sky/30 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-sky" : "border-border"}`}>
                            {active && <span className="h-2 w-2 rounded-full bg-sky" />}
                          </span>
                          <p className="text-sm font-semibold">{c.name}</p>
                        </div>
                        <p className="mt-1.5 pl-6 text-xs text-muted-foreground">{c.gratuityStatedRate}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={() => setStep(4)} disabled={!targetCTC || !selectedCompany}>
                Continue to Special Compensation <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <SectionHeader
              title="Special Compensation"
              description="One-off or discretionary items paid by Hexagon on top of the structured salary — joining bonus, relocation, retention bond, etc. Choose whether each item counts toward the candidate's headline CTC."
            />
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
                  <p className="text-sm font-semibold">Compensation items</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="sea">Included in CTC: {formatINR(compTotals.totalInCTC)}</Badge>
                    <Badge variant="neutral">Outside CTC: {formatINR(compTotals.totalOutsideCTC)}</Badge>
                  </div>
                </div>

                {compensationItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">No special compensation items added</p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Add a joining bonus, relocation support, or a retention bond with a service commitment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {compensationItems.map((item) => (
                      <CompensationItemRow
                        key={item.id}
                        item={item}
                        onChange={(patch) => updateCompensationItem(item.id, patch)}
                        onRemove={() => removeCompensationItem(item.id)}
                      />
                    ))}
                  </div>
                )}

                <div className="p-3 pt-0">
                  <Button variant="outline" onClick={handleAddCompensationItem}>
                    <Plus className="h-4 w-4" /> Add Compensation Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={handleGenerate} disabled={!targetCTC || !selectedCompany}>
                Generate Recommendation <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
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
