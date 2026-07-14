"use client";

import { useState } from "react";
import { Plus, X, RotateCcw, Trash2, Activity, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalaryStore } from "@/lib/store";

export default function SettingsPage() {
  const { hikePresets, setHikePresets, reset, clearHistory, history } = useSalaryStore();
  const [newPct, setNewPct] = useState("");

  const addPreset = () => {
    const v = Number(newPct);
    if (!v || v <= 0 || hikePresets.includes(v)) return;
    setHikePresets([...hikePresets, v].sort((a, b) => a - b));
    setNewPct("");
  };

  const removePreset = (v: number) => {
    setHikePresets(hikePresets.filter((p) => p !== v));
  };

  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky">Operations</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Configure how offers are suggested and manage what&rsquo;s stored in this workspace.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Default hike bands</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The quick-select hike percentages offered when setting a candidate&rsquo;s target
                CTC in Salary Structuring.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {hikePresets.length === 0 && (
                  <p className="text-xs text-muted-foreground">No presets — add one below.</p>
                )}
                {hikePresets.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1.5 text-xs font-medium text-foreground"
                  >
                    +{p}%
                    <button
                      onClick={() => removePreset(p)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-white/10 hover:text-danger"
                      aria-label={`Remove ${p}% preset`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex max-w-xs items-end gap-2">
                <div className="flex-1">
                  <Label>Add hike %</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="mt-1.5"
                    placeholder="e.g. 18"
                    value={newPct}
                    onChange={(e) => setNewPct(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPreset()}
                  />
                </div>
                <Button variant="outline" onClick={addPreset}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Workspace data</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything here — the current draft and analysis history — is stored only in this
                browser, not on a server.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Clear the current draft (candidate details, components, target CTC)? History is kept."))
                      reset();
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> Reset current draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete all ${history.length} stored analyses? This can't be undone.`))
                      clearHistory();
                  }}
                  disabled={history.length === 0}
                >
                  <Trash2 className="h-4 w-4" /> Clear analysis history
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">About this engine</h2>
              <div className="mt-4 space-y-3 text-sm">
                <InfoRow icon={Activity} label="Engine status" value="Live · Claude-powered classification & insights" />
                <InfoRow icon={Building2} label="Frameworks loaded" value="3 / 3 · Geosystems · Metrology · Vero" />
                <InfoRow icon={ShieldCheck} label="Compliance model" value="New Labour Codes · statutory gratuity & PF logic embedded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
