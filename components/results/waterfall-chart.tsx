"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { formatINR } from "@/lib/salary-engine";

export interface WaterfallStep {
  label: string;
  delta: number; // signed change; first and last steps are totals (base=0)
  isTotal?: boolean;
}

export function WaterfallChart({ steps }: { steps: WaterfallStep[] }) {
  let running = 0;
  const data = steps.map((s) => {
    if (s.isTotal) {
      const base = 0;
      running = s.delta;
      return { label: s.label, base, value: s.delta, delta: s.delta, isTotal: true };
    }
    const start = running;
    running += s.delta;
    const base = Math.min(start, running);
    const value = Math.abs(s.delta);
    return { label: s.label, base, value, delta: s.delta, isTotal: false };
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#8DA3BB", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={60} />
        <YAxis
          tick={{ fill: "#8DA3BB", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatINR(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number, name: string, props: any) => [
            formatINR(props.payload.isTotal ? props.payload.value : props.payload.delta),
            props.payload.isTotal ? "Total" : "Change",
          ]}
          contentStyle={{
            background: "#0F2237",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontSize: 12,
            color: "#F4F9FF",
          }}
          itemStyle={{ color: "#F4F9FF" }}
          labelStyle={{ color: "#F4F9FF", fontWeight: 600, marginBottom: 4 }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="base" stackId="w" fill="transparent" />
        <Bar dataKey="value" stackId="w" radius={[6, 6, 6, 6]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isTotal ? "#01ADFF" : d.delta >= 0 ? "#83C410" : "#FA4C40"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
