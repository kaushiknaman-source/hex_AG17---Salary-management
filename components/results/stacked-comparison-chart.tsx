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
  { key: "basic", name: "Basic", color: "#003A6B" },
  { key: "hra", name: "HRA / Conveyance", color: "#005198" },
  { key: "specialAllowance", name: "Special / Flexi Allowance", color: "#01ADFF" },
  { key: "retirals", name: "Retirals (PF + Gratuity)", color: "#4FC3FF" },
  { key: "variablePay", name: "Variable Pay", color: "#99D6FF" },
  { key: "other", name: "Meal / Other Benefits", color: "#CFE9FF" },
];

export function StackedComparisonChart({ data }: { data: CompositionBar[] }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#8DA3BB", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#8DA3BB", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatINR(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number) => formatINR(v)}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#0A1B30",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            fontSize: 12,
            padding: "10px 14px",
          }}
          labelStyle={{ color: "#EAF2FA", fontWeight: 600, marginBottom: 6 }}
          itemStyle={{ color: "#EAF2FA" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8DA3BB" }} />
        {SERIES.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId="a"
            fill={s.color}
            stroke="#03101F"
            strokeWidth={1}
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
