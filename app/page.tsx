"use client";

import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Building2,
  ShieldCheck,
  FileBarChart,
  Sparkles,
  Plus,
  ClipboardList,
  BookOpen,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { COMPANIES } from "@/lib/salary-engine";
import { useSalaryStore } from "@/lib/store";

const POLICY_TIPS = [
  "Hexagon Geosystems models Gratuity at 8.33% of Deemed Wages — solved algebraically to a fixed 4% of Fixed CTC to remove the circular Deemed-Wages-depends-on-Gratuity reference.",
  "Metrology and Vero both apply a 4.81% Deemed Wages gratuity rate, which resolves to 2.34852% of Fixed CTC once the same circular reference is solved.",
  "Every framework holds Deemed Wages at 50% of Total Remuneration (Fixed CTC minus Gratuity) — the statutory wage-code floor.",
  "Vero layers a fixed ₹4,400/month Meal Allowance on top of Fixed CTC, rather than netting it against Basic or Special Allowance.",
];

export default function DashboardPage() {
  const router = useRouter();
  const history = useSalaryStore((s) => s.history);
  const loadAnalysis = useSalaryStore((s) => s.loadAnalysis);
  const todayCount = history.filter(
    (h) => new Date(h.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const monthCount = history.filter((h) => {
    const d = new Date(h.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const tip = POLICY_TIPS[history.length % POLICY_TIPS.length];

  return (
    <main className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Command Center</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="sea">
            <span className="h-1.5 w-1.5 rounded-full bg-sea" /> Engine Operational
          </Badge>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky text-[11px] font-bold text-[#00161F]">
            HR
          </div>
        </div>
      </header>

      <div className="px-6 py-6 lg:px-8">
        {/* Page title row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Compensation &amp; Benefits — Command Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hexagon Geosystems internal salary structuring and framework benchmarking platform.
            </p>
          </div>
          <Link href="/salary">
            <Button>
              <Plus className="h-4 w-4" /> New Salary Analysis
            </Button>
          </Link>
        </div>

        {/* Enterprise widget row */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Widget title="Engine Health" icon={Activity} accent="sea">
            <Stat label="Claude API" value="Operational" positive />
            <Stat label="Calculation Engine" value="Operational" positive />
            <Stat label="Export Service" value="Operational" positive />
          </Widget>

          <Widget title="Framework Status" icon={Building2} accent="sky">
            <Stat label="Frameworks Loaded" value="3 / 3" positive />
            <Stat label="Ruleset" value="New Labour Codes" />
            <Stat label="Engine Version" value="v1.0" />
          </Widget>

          <Widget title="Session Activity" icon={ClipboardList} accent="land">
            <Stat label="Analyses Today" value={String(todayCount)} />
            <Stat label="Analyses This Month" value={String(monthCount)} />
            <Stat label="Stored In Session" value={String(history.length)} />
          </Widget>

          <Widget title="Compliance Status" icon={ShieldCheck} accent="warn">
            <Stat label="Wage Code Floor" value="Enforced" positive />
            <Stat label="PF / Gratuity Rules" value="Modeled" positive />
            <Stat label="Last Reviewed" value="Framework v1.0" />
          </Widget>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Recent analyses */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent Analyses</h2>
                <div className="flex items-center gap-3">
                  <Link href="/history" className="text-xs font-medium text-sky hover:underline">
                    View all &amp; search
                  </Link>
                  <Link href="/salary" className="text-xs font-medium text-sky hover:underline">
                    New analysis
                  </Link>
                </div>
              </div>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">No analyses saved yet</p>
                  <p className="text-xs text-muted-foreground">Save a comparison from the Results page to see it here.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 font-semibold">Position — Experience</th>
                      <th className="py-2 font-semibold">Benchmark</th>
                      <th className="py-2 text-right font-semibold">Total CTC</th>
                      <th className="py-2 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 8).map((h) => (
                      <tr
                        key={h.id}
                        className="cursor-pointer border-b border-border/70 last:border-0 hover:bg-muted/30"
                        onClick={() => {
                          loadAnalysis(h.id);
                          router.push("/results");
                        }}
                      >
                        <td className="py-2.5 font-medium text-foreground">{h.label}</td>
                        <td className="py-2.5 text-muted-foreground">{COMPANIES[h.company]?.name.replace("Hexagon ", "")}</td>
                        <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                          ₹{h.totalCTC.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground">
                          {new Date(h.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* AI recommendation / policy insight */}
          <Card className="border-sky/20 bg-sky/[0.03]">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky" />
                <h2 className="text-sm font-semibold">Framework Insight</h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{tip}</p>
              <Link href="/compare" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline">
                View full framework logic <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Latest salary policies */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Compensation Frameworks</h2>
              </div>
              <div className="divide-y divide-border">
                {Object.values(COMPANIES).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Basic {(c.basicPct * 100).toFixed(0)}% · PF {(c.pfPct * 100).toFixed(0)}% of DW · {c.gratuityStatedRate}
                      </p>
                    </div>
                    <Badge variant="default">
                      <CircleCheck className="h-3 w-3" /> Active
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                <QuickAction href="/salary" label="Start New Salary Analysis" />
                <QuickAction href="/results" label="Open Last Comparison" />
                <QuickAction href="/compare" label="Review Company Frameworks" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Widget({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent: "sky" | "sea" | "land" | "warn";
  children: React.ReactNode;
}) {
  const accentMap = {
    sky: "text-sky bg-sky/10",
    sea: "text-sea bg-sea/10",
    land: "text-land bg-land/10",
    warn: "text-warn bg-warn/15",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accentMap[accent]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        </div>
        <div className="space-y-1.5">{children}</div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${positive ? "text-land" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-sky/30 hover:bg-sky/[0.03]"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}
