"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "sky",
  delay = 0,
}: {
  label: string;
  value: string;
  sublabel: string;
  icon: LucideIcon;
  accent?: "sky" | "sea" | "land" | "warn";
  delay?: number;
}) {
  const accentMap = {
    sky: "text-sky bg-sky/10 ring-sky/25",
    sea: "text-sky/80 bg-sky/[0.06] ring-sky/15",
    land: "text-sky bg-sky/10 ring-sky/25",
    warn: "text-muted-foreground bg-white/5 ring-white/15",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-6 transition-all hover:border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
