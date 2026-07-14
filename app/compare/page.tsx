"use client";

import { motion } from "framer-motion";
import { HexagonMark } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANIES, FLEXI_ATTIRE_ANNUAL, GRADES } from "@/lib/salary-engine";

export default function ComparePage() {
  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky">Reference</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">
          Official Company Compensation Frameworks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          These formulas are read directly from the compensation calculator workbook and drive
          every proposed structure — nothing here is approximated.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Object.values(COMPANIES).map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                      <HexagonMark className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.legalName}</p>
                    </div>
                  </div>

                  <ol className="mt-5 space-y-3 text-sm">
                    <FormulaStep n={1} label={c.basicLabel} formula={`${(c.basicPct * 100).toFixed(0)}% of Fixed CTC`} />
                    <FormulaStep n={2} label="Gratuity" formula={`${c.gratuityStatedRate} (≈ ${(c.gratuityPctOfFixedCTC * 100).toFixed(4)}% of Fixed CTC)`} />
                    <FormulaStep n={3} label="Total Remuneration" formula="Fixed CTC − Gratuity" />
                    <FormulaStep n={4} label="Deemed Wages" formula={`${(c.deemedWagesPct * 100).toFixed(0)}% of Total Remuneration`} />
                    <FormulaStep n={5} label={c.specialAllowanceLabel} formula="Deemed Wages − Basic" />
                    <FormulaStep n={6} label="Conveyance Allowance" formula={`${(c.conveyancePct * 100).toFixed(0)}% of Deemed Wages`} />
                    <FormulaStep n={7} label="Employer PF" formula={`${(c.pfPct * 100).toFixed(0)}% of Deemed Wages`} />
                    <FormulaStep n={8} label="HRA" formula="Fixed CTC − Deemed Wages − Conveyance − Total Retiral (balancing figure)" />
                    <FormulaStep n={9} label="Target Annual Incentive" formula={`${(c.incentivePct * 100).toFixed(0)}% of Fixed CTC`} />
                    {c.hasMealAllowance && (
                      <FormulaStep n={10} label="Meal Allowance" formula="₹4,400 / month, layered above Fixed CTC" />
                    )}
                  </ol>

                  {c.hasFlexiAttire && (
                    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Flexi Attire Benefit (by grade, annual)
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {GRADES.map((g) => (
                          <div key={g} className="rounded-lg bg-white/[0.03] p-2">
                            <p className="font-semibold text-sky">{g}</p>
                            <p className="text-muted-foreground">
                              ₹{FLEXI_ATTIRE_ANNUAL[g].toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">Note</Badge>
              <p className="text-sm font-semibold">On the gratuity constant</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Each company&rsquo;s workbook states its gratuity rule as a percentage of{" "}
              <em>Deemed Wages</em> (8.33% for Geosystems, 4.81% for Metrology and Vero) — but Deemed
              Wages is itself derived from Total Remuneration, which is Fixed CTC minus Gratuity. That
              circular reference is solved algebraically once per company, producing a fixed
              percentage of Fixed CTC (4% for Geosystems, 2.34852% for Metrology and Vero) that
              reproduces the exact same result. Every figure in this platform has been verified
              against the workbook&rsquo;s own cached values, cell for cell.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function FormulaStep({ n, label, formula }: { n: number; label: string; formula: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky/10 text-[10px] font-bold text-sky ring-1 ring-sky/25">
        {n}
      </span>
      <div>
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground"> = {formula}</span>
      </div>
    </li>
  );
}
