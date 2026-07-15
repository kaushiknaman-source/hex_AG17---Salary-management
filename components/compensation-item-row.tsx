"use client";

import { Trash2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CompensationItem,
  CompensationItemType,
  COMPENSATION_TYPE_LABELS,
  retentionBondTotal,
  retentionBondSchedule,
  formatINR,
} from "@/lib/salary-engine";

export function CompensationItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: CompensationItem;
  onChange: (patch: Partial<CompensationItem>) => void;
  onRemove: () => void;
}) {
  const isBond = item.type === "retention-bond";
  const schedule = isBond ? retentionBondSchedule(item) : [];
  const bondTotal = isBond ? retentionBondTotal(item) : 0;

  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
        <div className="sm:col-span-4">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Item name
          </label>
          <Input
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Retention Bonus"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Type
          </label>
          <Select
            value={item.type}
            onChange={(e) => onChange({ type: e.target.value as CompensationItemType })}
          >
            {(Object.keys(COMPENSATION_TYPE_LABELS) as CompensationItemType[]).map((t) => (
              <option key={t} value={t}>
                {COMPENSATION_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>

        {!isBond && (
          <div className="sm:col-span-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Amount (₹)
            </label>
            <Input
              type="number"
              inputMode="decimal"
              value={item.amount ?? ""}
              onChange={(e) => onChange({ amount: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder="e.g. 100000"
              className="text-right tabular-nums"
            />
          </div>
        )}

        {isBond && (
          <>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Annual amount (₹)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={item.annualAmount ?? ""}
                onChange={(e) => onChange({ annualAmount: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="e.g. 150000"
                className="text-right tabular-nums"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Years
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={item.commitmentYears ?? ""}
                onChange={(e) => onChange({ commitmentYears: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="4"
                className="text-right tabular-nums"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-2 sm:col-span-2 sm:justify-end">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={item.includeInCTC}
              onChange={(e) => onChange({ includeInCTC: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-sky"
            />
            Add to CTC
          </label>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-muted-foreground hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Textarea
          value={item.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notes (optional) — e.g. payout timing, approval reference"
          className="min-h-[44px] bg-white/[0.03] text-sm"
        />
      </div>

      {isBond && (
        <div className="mt-3 rounded-md border border-warn/30 bg-warn/[0.06] p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-warn" />
              Service commitment &amp; clawback
            </div>
            <Badge variant="warn">Total commitment: {formatINR(bondTotal)}</Badge>
          </div>
          {schedule.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Enter an annual amount and a commitment period to see the payout and clawback schedule.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                If the employee exits before completing the full commitment period, the amount paid so far is
                recoverable from them, prorated by the time left unserved.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-1.5 pr-3 font-semibold">After year</th>
                      <th className="py-1.5 pr-3 text-right font-semibold">Cumulative paid</th>
                      <th className="py-1.5 text-right font-semibold">Recoverable if exits now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.year} className="border-b border-border/60 last:border-0">
                        <td className="py-1.5 pr-3 font-medium text-foreground">Year {row.year}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums text-muted-foreground">
                          {formatINR(row.cumulativePaid)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums font-medium text-warn">
                          {row.recoverableIfExitAfterThisYear > 0 ? formatINR(row.recoverableIfExitAfterThisYear) : "Fully vested"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
