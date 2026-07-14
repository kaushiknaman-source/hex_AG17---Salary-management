import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { NavSidebar } from "@/components/nav-sidebar";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Hexagon_AG17 – Compensation & Benefits Platform",
  description:
    "Hexagon Geosystems internal Salary Structuring, Compensation Benchmarking & HR Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NavSidebar />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
