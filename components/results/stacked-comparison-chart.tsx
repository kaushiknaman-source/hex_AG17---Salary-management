"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatINR } from "@/lib/salary-engine";

export interface CompositionBar {
  label: string;
  basic: number;
  hra: number;
  specialAllowance: number;
  retirals: number;
  variablePay: number;
  other: number;
}

const SERIES: { key: keyof Omit<CompositionBar, "label">; name: string; color: string }[] = [
  { key: "basic", name: "Basic", color: "#01ADFF" },
  { key: "hra", name: "HRA / Conveyance", color: "#04D0E6" },
  { key: "specialAllowance", name: "Special / Flexi Allowance", color: "#83C410" },
  { key: "retirals", name: "Retirals (PF + Gratuity)", color: "#99D6FF" },
  { key: "variablePay", name: "Variable Pay", color: "#DFF73F" },
  { key: "other", name: "Meal / Other Benefits", color: "#7DFFFC" },
];

export function StackedComparisonChart({ data }: { data: CompositionBar[] }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#8DA3BB", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#8DA3BB", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatINR(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number) => formatINR(v)}
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
        <Legend wrapperStyle={{ fontSize: 11, color: "#8DA3BB", paddingTop: 12 }} />
        {SERIES.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} radius={[0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
