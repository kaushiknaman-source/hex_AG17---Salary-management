"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  GitCompareArrows,
  FileBarChart,
  Settings,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { HexagonMark } from "./logo";
import { cn } from "@/lib/utils";
import { useSalaryStore } from "@/lib/store";

const WORKSPACE_NAV = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/salary", label: "Salary Structuring", icon: Calculator },
  { href: "/results", label: "Comparison & Results", icon: GitCompareArrows },
];

const REFERENCE_NAV = [
  { href: "/compare", label: "Company Frameworks", icon: FileBarChart },
];

// The sidebar is an intentionally dark surface, independent of the light
// content theme, so its text colors are hardcoded rather than pulled from
// the light-surface semantic tokens (which would be unreadable here).
export function NavSidebar() {
  const pathname = usePathname();
  const collapsed = useSalaryStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSalaryStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[0.06] bg-[#0B1220] transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2.5 border-b border-white/[0.06]", collapsed ? "justify-center px-0" : "px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 ring-1 ring-sky/25">
          <HexagonMark className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[16px] font-bold tracking-tight text-white">Hexagon_AG17</p>
            <p className="truncate text-[10.5px] text-white/40">Compensation &amp; Benefits</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <NavGroup title="Workspace" collapsed={collapsed} items={WORKSPACE_NAV} pathname={pathname} />
        <NavGroup title="Reference" collapsed={collapsed} items={REFERENCE_NAV} pathname={pathname} />

        <div>
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
              Operations
            </p>
          )}
          <NavStub icon={History} label="Analysis History" collapsed={collapsed} />
          <NavStub icon={ShieldCheck} label="Compliance Log" collapsed={collapsed} />
          <NavStub icon={Settings} label="Settings" collapsed={collapsed} />
        </div>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sea" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[11px] font-medium text-white">Engine Live</p>
              <p className="truncate text-[9.5px] text-white/40">Claude-powered · Framework v1.0</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] py-1.5 text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </div>
    </aside>
  );
}

function NavGroup({
  title,
  collapsed,
  items,
  pathname,
}: {
  title: string;
  collapsed: boolean;
  items: { href: string; label: string; icon: any }[];
  pathname: string;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">{title}</p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                collapsed && "justify-center",
                active ? "bg-white/[0.06] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-sky" />}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-sky")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NavStub({ icon: Icon, label, collapsed }: { icon: any; label: string; collapsed: boolean }) {
  return (
    <div
      title={collapsed ? label : undefined}
      className={cn(
        "flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-white/30",
        collapsed && "justify-center"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </div>
  );
}
