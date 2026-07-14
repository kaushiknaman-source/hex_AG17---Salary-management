import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProposedStructure, formatINR } from "./salary-engine";

export function exportComparisonPDF({
  employeeName,
  targetCTC,
  structures,
  insights,
}: {
  employeeName: string;
  targetCTC: number;
  structures: ProposedStructure[];
  insights?: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(0, 40, 76);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HEXAGON", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Hexagon_AG17 — Salary Structuring Report", pageWidth - 14, 18, { align: "right" });

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Employee: ${employeeName || "Unnamed"}`, 14, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Target Fixed CTC: ${formatINR(targetCTC)}`, 14, 47);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53);

  let y = 62;

  structures.forEach((s) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(s.companyName, 14, y);
    y += 4;

    const rows: [string, string][] = [
      ["Basic", formatINR(s.basic)],
      ["HRA", formatINR(s.hra)],
      ["Conveyance Allowance", formatINR(s.conveyanceAllowance)],
      ["Special / Flexi Allowance", formatINR(s.specialAllowance)],
      ["Base Pay", formatINR(s.basePay)],
      ["Employer PF", formatINR(s.employerPF)],
      ["Gratuity", formatINR(s.gratuity)],
      ["Total Retiral", formatINR(s.totalRetiral)],
      ...(s.mealAllowance ? ([["Meal Allowance", formatINR(s.mealAllowance)]] as [string, string][]) : []),
      ["Fixed CTC", formatINR(s.fixedCTCCheck)],
      ["Annual Target Incentive", formatINR(s.annualIncentive)],
      ["Total CTC / Year", formatINR(s.totalCTC)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Component", "Annual Amount"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [1, 173, 255], textColor: [0, 22, 31] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore - lastAutoTable is added at runtime by the plugin
    y = doc.lastAutoTable.finalY + 12;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });

  if (insights) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AI Executive Insights", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(insights, pageWidth - 28);
    doc.text(lines, 14, y);
  }

  doc.save(`Hexagon-AG17-Salary-Report-${employeeName || "employee"}.pdf`);
}
