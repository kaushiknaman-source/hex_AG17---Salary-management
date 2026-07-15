"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Eye, Trash2, History as HistoryIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSalaryStore } from "@/lib/store";
import { COMPANIES, formatINR } from "@/lib/salary-engine";

export default function HistoryPage() {
  const router = useRouter();
  const history = useSalaryStore((s) => s.history);
  const loadAnalysis = useSalaryStore((s) => s.loadAnalysis);
  const deleteAnalysis = useSalaryStore((s) => s.deleteAnalysis);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    if (!q) return sorted;
    return sorted.filter((h) => {
      const haystack = [
        h.label,
        h.employeeName,
        h.designation,
        h.businessUnit,
        h.location,
        COMPANIES[h.company]?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [history, query]);

  const handleView = (id: string) => {
    loadAnalysis(id);
    router.push("/results");
  };

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">Analysis History</span>
        </div>
        <Link href="/salary">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> New Salary Analysis
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Analysis History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every saved comparison, filed by position and years of experience. Search or open any of them to pick up
            exactly where you left off.
          </p>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by position, employee, business unit, location…"
            className="pl-9"
          />
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <HistoryIcon className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No saved analyses yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Run a salary structuring analysis and choose &ldquo;Save to History&rdquo; on the results page to see it here.
              </p>
              <Link href="/salary" className="mt-2">
                <Button size="sm">Start Salary Analysis</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">No matches for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground">Try a different position, name, or business unit.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Position — Experience</th>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Framework</th>
                    <th className="px-4 py-2.5 text-right">Total CTC</th>
                    <th className="px-4 py-2.5 text-right">Saved</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h) => (
                    <tr key={h.id} className="border-b border-border/70 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">{h.label}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {h.employeeName || "Unnamed employee"}
                        {h.businessUnit && <span className="ml-1.5 text-xs text-muted-foreground/70">· {h.businessUnit}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">{COMPANIES[h.company]?.name.replace("Hexagon ", "")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">{formatINR(h.totalCTC)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Open" onClick={() => handleView(h.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-danger"
                            title="Delete"
                            onClick={() => deleteAnalysis(h.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
