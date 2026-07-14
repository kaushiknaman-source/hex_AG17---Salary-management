"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  GitCompareArrows,
  Settings,
  History,
  FileBarChart,
  Sparkles,
} from "lucide-react";
import { HexagonMark } from "./logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/salary", label: "Salary Structuring", icon: Calculator },
  { href: "/results", label: "Comparison & Results", icon: GitCompareArrows },
  { href: "/compare", label: "Company Frameworks", icon: FileBarChart },
];

export function NavSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.06] bg-[#03101f]/95 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky/10 ring-1 ring-sky/30">
          <HexagonMark className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">Hexagon_AG17</p>
          <p className="text-[11px] text-muted-foreground">Salary Management Agent</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sky/10 text-sky ring-1 ring-sky/25"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-sky")} />
              {item.label}
            </Link>
          );
        })}

        <div className="!mt-6 border-t border-white/[0.06] pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Operations
          </p>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/60">
            <History className="h-4 w-4" /> Analysis History
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/60">
            <Settings className="h-4 w-4" /> Settings
          </div>
        </div>
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-2 rounded-xl border border-sky/20 bg-sky/[0.06] px-3 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-sky">Engine Live</p>
            <p className="text-[10px] text-muted-foreground">Claude-powered · v1.0</p>
          </div>
          <Sparkles className="ml-auto h-3.5 w-3.5 text-sky/60" />
        </div>
      </div>
    </aside>
  );
}
