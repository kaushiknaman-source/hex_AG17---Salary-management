"use client";

import { useSalaryStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSalaryStore((s) => s.sidebarCollapsed);
  return (
    <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
      {children}
    </div>
  );
}
