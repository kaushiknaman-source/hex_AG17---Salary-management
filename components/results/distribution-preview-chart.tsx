"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "@/lib/salary-engine";

const DATA = [
  { name: "Basic", value: 40, color: "#005198" },
  { name: "HRA + Conveyance", value: 30, color: "#01ADFF" },
  { name: "Special Allowance", value: 10, color: "#4FC3FF" },
  { name: "Retirals", value: 12, color: "#99D6FF" },
  { name: "Variable Pay", value: 8, color: "#CFE9FF" },
];

export function DistributionPreviewChart() {
  return (
    <div className="relative h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={DATA}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            strokeWidth={0}
          >
            {DATA.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, name: string) => [`${v}%`, name]}
            contentStyle={{
              background: "#0A1B30",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              fontSize: 12,
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#EAF2FA" }}
            itemStyle={{ color: "#EAF2FA" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</p>
        <p className="text-sm font-bold">Standard CTC</p>
      </div>
    </div>
  );
}
