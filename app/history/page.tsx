"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Trash2, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSalaryStore } from "@/lib/store";
import { COMPANIES, formatINR, pctDiff } from "@/lib/salary-engine";

export default function HistoryPage() {
  const router = useRouter();
  const { history, loadFromHistory, removeHistory, clearHistory } = useSalaryStore();

  const handleView = (id: string) => {
    loadFromHistory(id);
    router.push("/results");
  };

  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky">Operations</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">Analysis History</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every offer you&rsquo;ve generated in this workspace, stored locally. Reopen one to
              revisit its results, or clear what you no longer need.
            </p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Clear all analysis history? This can't be undone.")) clearHistory();
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky/10 ring-1 ring-sky/25">
                <History className="h-6 w-6 text-sky" />
              </div>
              <p className="font-semibold">No analyses yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Offers you generate through Salary Structuring will show up here for quick recall.
              </p>
              <Link href="/salary" className="mt-2">
                <Button>
                  Start New Hire Offer <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((h) => {
              const hike = h.employee.currentCTC ? pctDiff(h.employee.currentCTC, h.targetCTC) : null;
              return (
                <Card key={h.id} className="transition-colors hover:border-white/20">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{h.employee.name || "Unnamed candidate"}</p>
                        {h.grade && <Badge variant="neutral">{h.grade}</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(h.timestamp).toLocaleString()}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {h.companies.map((c) => COMPANIES[c].name.replace("Hexagon ", "")).join(", ") || "—"}
                        </span>
                        <span>Offered {formatINR(h.targetCTC, { compact: true })}</span>
                        {hike != null && (
                          <span className={hike >= 0 ? "text-sky" : "text-danger"}>
                            {(hike * 100).toFixed(1)}% hike
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleView(h.id)}>
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-danger"
                        onClick={() => removeHistory(h.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
