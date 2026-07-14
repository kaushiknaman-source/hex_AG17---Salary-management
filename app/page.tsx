"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Building2,
  Activity,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { HexagonMark } from "@/components/logo";
import { DistributionPreviewChart } from "@/components/results/distribution-preview-chart";
import { COMPANIES } from "@/lib/salary-engine";
import { useSalaryStore } from "@/lib/store";

export default function DashboardPage() {
  const history = useSalaryStore((s) => s.history);

  return (
    <main className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#03101f]/80 px-6 backdrop-blur-xl lg:px-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">Command Center</span>
          <span className="text-white/20">/</span>
          <span>Overview</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sky" /> AI Engine Online
          </Badge>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-xs font-bold text-[#00161F]">
            HR
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/[0.06] px-6 pb-16 pt-14 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2"
          >
            <Badge variant="default">
              <Sparkles className="h-3 w-3" /> Hexagon · AI-Based HR Intelligence
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight lg:text-[3.4rem]"
          >
            Structure every new-hire offer with the
            <span className="text-gradient"> precision of policy</span>, not guesswork.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Hexagon_AG17 takes a candidate&rsquo;s current CTC, classifies every component like a
            seasoned C&amp;B consultant, and builds their new offer against the official
            Geosystems, Metrology, and Vero salary frameworks &mdash; instantly, and to the rupee.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/salary">
              <Button size="lg" className="group">
                Start New Hire Offer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button size="lg" variant="outline">
                View Company Frameworks
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Engine Status"
            value="Live"
            sublabel="Claude-powered classification & insights"
            icon={Activity}
            accent="sky"
            delay={0}
          />
          <KpiCard
            label="Frameworks Loaded"
            value="3 / 3"
            sublabel="Geosystems · Metrology · Vero"
            icon={Building2}
            accent="sky"
            delay={0.05}
          />
          <KpiCard
            label="Analyses Run"
            value={String(history.length)}
            sublabel="Stored in this workspace"
            icon={TrendingUp}
            accent="sky"
            delay={0.1}
          />
          <KpiCard
            label="Compliance Model"
            value="New Labour Codes"
            sublabel="Statutory gratuity & PF logic embedded"
            icon={ShieldCheck}
            accent="sky"
            delay={0.15}
          />
        </div>
      </section>

      {/* Main grid: Get Started + Distribution + Company Overview */}
      <section className="px-6 pb-10 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Get started */}
          <Card className="lg:col-span-2">
            <CardContent className="p-7">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-sky" />
                <h2 className="text-base font-semibold">Get started</h2>
              </div>
              <ol className="mt-5 space-y-5">
                {[
                  {
                    title: "Capture the candidate's current CTC",
                    body: "Log their current CTC as disclosed, plus a full breakup if you have it. Every field is optional and freely editable.",
                  },
                  {
                    title: "Let the AI classify each component",
                    body: "Claude reads the component names and descriptions and files each one under Basic, Allowance, Benefit, Retiral, Variable Pay, or Reimbursement.",
                  },
                  {
                    title: "Set the offered Fixed CTC and benchmark",
                    body: "Pick the hiring entity — the engine builds the new offer using that company's exact, official compensation formulas and shows the hike over their current CTC.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky/10 text-sm font-bold text-sky ring-1 ring-sky/25">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/salary" className="mt-6 inline-block">
                <Button variant="secondary">
                  Open Salary Structuring <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* distribution preview */}
          <Card>
            <CardContent className="p-7">
              <h2 className="text-base font-semibold">Typical CTC Composition</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Illustrative split under the standard 40/50 wage-code model
              </p>
              <DistributionPreviewChart />
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {[
                  ["Basic", "#005198"],
                  ["HRA + Conveyance", "#01ADFF"],
                  ["Special Allowance", "#4FC3FF"],
                  ["Retirals", "#99D6FF"],
                  ["Variable Pay", "#CFE9FF"],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: color as string }} />
                    {label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Company overview cards */}
      <section className="px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Compensation Framework Overview</h2>
            <Link href="/compare" className="text-xs font-medium text-sky hover:underline">
              Full breakdown &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {Object.values(COMPANIES).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="h-full transition-all hover:border-sky/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                        <HexagonMark className="h-4 w-4 text-white" />
                      </div>
                      <p className="font-semibold">{c.name}</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <Row label="Basic Wages" value={`${(c.basicPct * 100).toFixed(0)}% of Fixed`} />
                      <Row label="Gratuity" value={c.gratuityStatedRate} />
                      <Row label="Deemed Wages" value={`${(c.deemedWagesPct * 100).toFixed(0)}% of TR`} />
                      <Row label="Employer PF" value={`${(c.pfPct * 100).toFixed(0)}% of DW`} />
                      <Row label="Target Incentive" value={`${(c.incentivePct * 100).toFixed(0)}% of Fixed CTC`} />
                      {c.hasMealAllowance && <Row label="Meal Allowance" value="₹4,400 / month" />}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant + recent activity */}
      <section className="px-6 pb-16 lg:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-l-2 border-l-sky">
            <CardContent className="flex items-start gap-4 p-7">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky/15 ring-1 ring-sky/30">
                <Sparkles className="h-5 w-5 text-sky" />
              </div>
              <div>
                <p className="font-semibold">AI Executive Insights</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every comparison you generate comes with a written summary explaining why each
                  component moved and how the proposed structure compares to the current one —
                  right on the results page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-7">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-sky" />
                <p className="font-semibold">Recent Analyses</p>
              </div>
              {history.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing here yet — analyses you run will appear for quick recall.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {history.slice(0, 4).map((h) => (
                    <li key={h.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{h.employeeName || "Unnamed employee"}</span>
                      <span className="text-muted-foreground">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
