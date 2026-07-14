import type { Metadata } from "next";
import "./globals.css";
import { NavSidebar } from "@/components/nav-sidebar";

export const metadata: Metadata = {
  title: "Hexagon_AG17 – Salary Management Agent",
  description:
    "AI-Powered Salary Structuring, Compensation Benchmarking & HR Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <NavSidebar />
        <div className="lg:pl-[260px]">{children}</div>
      </body>
    </html>
  );
}
