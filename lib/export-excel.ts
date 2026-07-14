import * as XLSX from "xlsx";
import { ProposedStructure, SalaryComponent } from "./salary-engine";

export function exportComparisonExcel({
  employeeName,
  current,
  structures,
}: {
  employeeName: string;
  current: SalaryComponent[];
  structures: ProposedStructure[];
}) {
  const wb = XLSX.utils.book_new();

  const currentRows = current
    .filter((c) => c.name.trim())
    .map((c) => ({
      Component: c.name,
      "Monthly (₹)": c.monthly ?? 0,
      "Annual (₹)": c.annual ?? 0,
      Category: c.category ?? "",
      Description: c.description ?? "",
    }));
  const currentSheet = XLSX.utils.json_to_sheet(currentRows);
  XLSX.utils.book_append_sheet(wb, currentSheet, "Current Structure");

  structures.forEach((s) => {
    const rows = [
      { Component: "Basic", "Annual (₹)": s.basic },
      { Component: "HRA", "Annual (₹)": s.hra },
      { Component: "Conveyance Allowance", "Annual (₹)": s.conveyanceAllowance },
      { Component: "Special / Flexi Allowance", "Annual (₹)": s.specialAllowance },
      { Component: "Base Pay", "Annual (₹)": s.basePay },
      { Component: "Employer PF", "Annual (₹)": s.employerPF },
      { Component: "Gratuity", "Annual (₹)": s.gratuity },
      { Component: "Total Retiral", "Annual (₹)": s.totalRetiral },
      ...(s.mealAllowance ? [{ Component: "Meal Allowance", "Annual (₹)": s.mealAllowance }] : []),
      ...(s.flexiAttire ? [{ Component: "Flexi Attire Benefit", "Annual (₹)": s.flexiAttire }] : []),
      { Component: "Fixed CTC", "Annual (₹)": s.fixedCTCCheck },
      { Component: "Annual Target Incentive", "Annual (₹)": s.annualIncentive },
      { Component: "Total CTC / Year", "Annual (₹)": s.totalCTC },
    ];
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, s.companyName.slice(0, 31));
  });

  XLSX.writeFile(wb, `Hexagon-AG17-Salary-Structure-${employeeName || "employee"}.xlsx`);
}
