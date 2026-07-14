"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatINR } from "@/lib/salary-engine";

export interface DistributionSlice {
  name: string;
  value: number;
  color: string;
}

export function CompositionDonut({ data }: { data: DistributionSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} strokeWidth={0}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, name: string) => [`${formatINR(v)} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, name]}
            contentStyle={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              color: "#fff",
              fontSize: 12,
            }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: 11, color: "#8DA3BB" }}
            formatter={(value: string) => <span className="text-[#8DA3BB]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
