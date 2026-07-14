/**
 * Hexagon Salary Structuring Engine
 * ----------------------------------------------------------------------
 * This module is a line-for-line replication of the formulas found in the
 * "NEW SALARY STRUCTURE AS PER NEW LABOR CODES" columns of HRCYTemp.xlsx,
 * one engine per legal entity: Hexagon Geosystems, Hexagon Manufacturing
 * Intelligence (Metrology), and Vero.
 *
 * Source cells (per workbook, Fixed CTC = B3):
 *   B6  Basic            = ROUND(FixedCTC * 40%, 0)
 *   B13 Gratuity          = ROUND(FixedCTC * gratuityConstant, 0)
 *        (gratuityConstant is the algebraic solution of "Gratuity = gratuityRate
 *         * Deemed Wages" once the circular Deemed-Wages-depends-on-Gratuity
 *         reference is solved: Geosystems 8.33% of DW -> 4% of Fixed CTC;
 *         Metrology & Vero 4.81% of DW -> 2.34852% of Fixed CTC. Verified
 *         against the workbook's own cached values: 3,000,000 * 4% = 120,000
 *         (Geosystems, matches cell); 300,000 * 2.34852% = 7,046 (Metrology,
 *         matches cell); 3,000,000 * 2.34852% = 70,456 (Vero, matches cell).)
 *   B16 Total Remuneration (TR) = FixedCTC - Gratuity
 *   B8  Total Deemed Wages (DW) = ROUND(TR * 50%, 0)
 *   B7  Special Allowance        = DW - Basic
 *   B9  Conveyance Allowance     = ROUND(DW * 35%, 0)
 *   B12 Employer PF              = ROUND(DW * 12%, 0)
 *   B14 Total Retiral            = PF + Gratuity
 *   B10 HRA                      = FixedCTC - DW - Conveyance - TotalRetiral
 *   B11 Base Pay                 = DW + Conveyance + HRA
 *   B15 Fixed CTC check (I)      = BasePay + TotalRetiral  (must equal input)
 *   B17 Target Annual Incentive  = 10% * B15
 *   B18 Total CTC per year (K)   = B15 + B17
 *
 * Vero additionally carries a fixed Meal Allowance of INR 4,400 / month
 * (cell C15, "4400 PM") layered on top of, not netted against, Fixed CTC.
 *
 * Geosystems additionally carries a grade-banded Flexi "Attire" benefit
 * (cells B21:E22), selectable by employee grade (JM / MM / SM / HOD).
 * ----------------------------------------------------------------------
 */

export type CompanyId = "geosystems" | "metrology" | "vero";

export type Grade = "JM" | "MM" | "SM" | "HOD";

export interface CompanyDefinition {
  id: CompanyId;
  name: string;
  legalName: string;
  basicLabel: string;
  specialAllowanceLabel: string;
  basicPct: number; // 40%
  gratuityPctOfFixedCTC: number; // algebraic constant, see header
  gratuityStatedRate: string; // human-readable rate as stated in workbook
  deemedWagesPct: number; // 50% of TR
  conveyancePct: number; // 35% of DW
  pfPct: number; // 12% of DW
  incentivePct: number; // 10% of Fixed CTC (I)
  hasMealAllowance: boolean;
  mealAllowancePerMonth: number;
  hasFlexiAttire: boolean;
}

export const COMPANIES: Record<CompanyId, CompanyDefinition> = {
  geosystems: {
    id: "geosystems",
    name: "Hexagon Geosystems",
    legalName: "Hexagon Geosystems",
    basicLabel: "Basic Wages",
    specialAllowanceLabel: "Special Allowance",
    basicPct: 0.4,
    gratuityPctOfFixedCTC: 0.04,
    gratuityStatedRate: "8.33% of Deemed Wages",
    deemedWagesPct: 0.5,
    conveyancePct: 0.35,
    pfPct: 0.12,
    incentivePct: 0.1,
    hasMealAllowance: false,
    mealAllowancePerMonth: 0,
    hasFlexiAttire: true,
  },
  metrology: {
    id: "metrology",
    name: "Hexagon Manufacturing Intelligence",
    legalName: "Hexagon Metrology",
    basicLabel: "Basic Wages",
    specialAllowanceLabel: "Special Allowance",
    basicPct: 0.4,
    gratuityPctOfFixedCTC: 0.0234852,
    gratuityStatedRate: "4.81% of Deemed Wages",
    deemedWagesPct: 0.5,
    conveyancePct: 0.35,
    pfPct: 0.12,
    incentivePct: 0.1,
    hasMealAllowance: false,
    mealAllowancePerMonth: 0,
    hasFlexiAttire: false,
  },
  vero: {
    id: "vero",
    name: "Vero",
    legalName: "Vero India",
    basicLabel: "Basic Salary",
    specialAllowanceLabel: "Special Allowance (Flexi Allowance)",
    basicPct: 0.4,
    gratuityPctOfFixedCTC: 0.0234852,
    gratuityStatedRate: "4.81% of Deemed Wages",
    deemedWagesPct: 0.5,
    conveyancePct: 0.35,
    pfPct: 0.12,
    incentivePct: 0.1,
    hasMealAllowance: true,
    mealAllowancePerMonth: 4400,
    hasFlexiAttire: false,
  },
};

export const FLEXI_ATTIRE_ANNUAL: Record<Grade, number> = {
  JM: 60000,
  MM: 120000,
  SM: 150000,
  HOD: 180000,
};

export const GRADES: Grade[] = ["JM", "MM", "SM", "HOD"];

const round0 = (n: number) => Math.round(n);

export interface ProposedStructure {
  companyId: CompanyId;
  companyName: string;
  fixedCTC: number;
  basic: number;
  specialAllowance: number;
  deemedWages: number;
  conveyanceAllowance: number;
  hra: number;
  basePay: number;
  employerPF: number;
  gratuity: number;
  totalRetiral: number;
  mealAllowance: number;
  flexiAttire: number;
  fixedCTCCheck: number; // basePay + totalRetiral (should equal fixedCTC)
  annualIncentive: number;
  totalCTC: number;
  grade?: Grade;
}

export function computeProposedStructure(
  companyId: CompanyId,
  fixedCTC: number,
  grade?: Grade
): ProposedStructure {
  const c = COMPANIES[companyId];
  const basic = round0(fixedCTC * c.basicPct);
  const gratuity = round0(fixedCTC * c.gratuityPctOfFixedCTC);
  const totalRemuneration = fixedCTC - gratuity;
  const deemedWages = round0(totalRemuneration * c.deemedWagesPct);
  const specialAllowance = deemedWages - basic;
  const conveyanceAllowance = round0(deemedWages * c.conveyancePct);
  const employerPF = round0(deemedWages * c.pfPct);
  const totalRetiral = employerPF + gratuity;
  const hra = fixedCTC - deemedWages - conveyanceAllowance - totalRetiral;
  const basePay = deemedWages + conveyanceAllowance + hra;
  const fixedCTCCheck = basePay + totalRetiral;
  const annualIncentive = round0(fixedCTCCheck * c.incentivePct);
  const mealAllowance = c.hasMealAllowance ? c.mealAllowancePerMonth * 12 : 0;
  const flexiAttire =
    c.hasFlexiAttire && grade ? FLEXI_ATTIRE_ANNUAL[grade] : 0;
  const totalCTC = fixedCTCCheck + annualIncentive + mealAllowance;

  return {
    companyId,
    companyName: c.name,
    fixedCTC,
    basic,
    specialAllowance,
    deemedWages,
    conveyanceAllowance,
    hra,
    basePay,
    employerPF,
    gratuity,
    totalRetiral,
    mealAllowance,
    flexiAttire,
    fixedCTCCheck,
    annualIncentive,
    totalCTC,
    grade,
  };
}

// ---------------------------------------------------------------------
// Current / custom salary component model
// ---------------------------------------------------------------------

export type ComponentCategory =
  | "Basic Salary"
  | "Allowance"
  | "Benefit"
  | "Employer Contribution"
  | "Retiral"
  | "Variable Pay"
  | "Bonus"
  | "Reimbursement";

export interface SalaryComponent {
  id: string;
  name: string;
  monthly: number | null;
  annual: number | null;
  description: string;
  category?: ComponentCategory;
  isCustom?: boolean;
}

export const DEFAULT_COMPONENTS: SalaryComponent[] = [
  { id: "basic", name: "Basic", monthly: null, annual: null, description: "Core basic wage component", category: "Basic Salary" },
  { id: "hra", name: "HRA", monthly: null, annual: null, description: "House Rent Allowance", category: "Allowance" },
  { id: "shift", name: "Shift Allowance", monthly: null, annual: null, description: "Compensation for non-standard shift hours", category: "Allowance" },
  { id: "medical", name: "Medical", monthly: null, annual: null, description: "Medical reimbursement / allowance", category: "Benefit" },
  { id: "lta", name: "LTA", monthly: null, annual: null, description: "Leave Travel Allowance", category: "Allowance" },
  { id: "special", name: "Special Allowance", monthly: null, annual: null, description: "Balancing / catch-all allowance", category: "Allowance" },
  { id: "pf", name: "Employer PF", monthly: null, annual: null, description: "Employer's Provident Fund contribution", category: "Employer Contribution" },
  { id: "gratuity", name: "Gratuity", monthly: null, annual: null, description: "Statutory gratuity accrual", category: "Retiral" },
  { id: "meal", name: "Meal Benefit", monthly: null, annual: null, description: "Meal / food coupons benefit", category: "Benefit" },
  { id: "incentive", name: "Annual Incentive", monthly: null, annual: null, description: "Performance-based variable pay", category: "Variable Pay" },
];

export function normalizeComponent(comp: SalaryComponent): SalaryComponent {
  const monthly = comp.monthly ?? (comp.annual != null ? comp.annual / 12 : null);
  const annual = comp.annual ?? (comp.monthly != null ? comp.monthly * 12 : null);
  return { ...comp, monthly, annual };
}

export function totalAnnual(components: SalaryComponent[]): number {
  return components.reduce((sum, c) => sum + (c.annual ?? 0), 0);
}

export function totalMonthly(components: SalaryComponent[]): number {
  return components.reduce((sum, c) => sum + (c.monthly ?? (c.annual ? c.annual / 12 : 0)), 0);
}

// Fixed vs. Variable split — Variable Pay and Bonus categories are treated as
// "at risk" / performance-linked pay; every other category is Fixed. This
// mirrors how HR/C&B teams typically report a CTC breakup to an employee.
const VARIABLE_CATEGORIES: ComponentCategory[] = ["Variable Pay", "Bonus"];

export interface FixedVariableSplit {
  fixedAnnual: number;
  variableAnnual: number;
  fixedPct: number;
  variablePct: number;
}

export function splitFixedVariable(components: SalaryComponent[]): FixedVariableSplit {
  let fixedAnnual = 0;
  let variableAnnual = 0;
  for (const c of components) {
    const annual = c.annual ?? 0;
    if (c.category && VARIABLE_CATEGORIES.includes(c.category)) {
      variableAnnual += annual;
    } else {
      fixedAnnual += annual;
    }
  }
  const total = fixedAnnual + variableAnnual;
  return {
    fixedAnnual,
    variableAnnual,
    fixedPct: total ? fixedAnnual / total : 0,
    variablePct: total ? variableAnnual / total : 0,
  };
}

// Local heuristic classifier used as an instant fallback / pre-fill before
// (or if) the AI classification route responds. The AI route in
// app/api/classify/route.ts performs the authoritative classification.
export function heuristicClassify(name: string): ComponentCategory {
  const n = name.toLowerCase();
  if (n.includes("basic")) return "Basic Salary";
  if (n.includes("pf") || n.includes("provident") || n.includes("nps") || n.includes("esi")) return "Employer Contribution";
  if (n.includes("gratuity") || n.includes("retiral") || n.includes("pension")) return "Retiral";
  if (n.includes("incentive") || n.includes("commission") || n.includes("variable") || n.includes("esop") || n.includes("rsu")) return "Variable Pay";
  if (n.includes("bonus") || n.includes("joining") || n.includes("retention")) return "Bonus";
  if (n.includes("reimburs") || n.includes("fuel") || n.includes("phone") || n.includes("internet") || n.includes("travel")) return "Reimbursement";
  if (n.includes("meal") || n.includes("medical") || n.includes("insurance") || n.includes("housing") || n.includes("education")) return "Benefit";
  return "Allowance";
}

// ---------------------------------------------------------------------
// Component mapping: user components -> official company structure
// ---------------------------------------------------------------------

export interface MappedComponent {
  sourceName: string;
  sourceAnnual: number;
  mappedTo: string;
  isDirectMatch: boolean;
  reason: string;
}

const DIRECT_MAP_KEYWORDS: Record<string, string[]> = {
  Basic: ["basic"],
  HRA: ["hra", "house rent"],
  "Special Allowance": ["special allowance", "flexi allowance"],
  "Employer PF": ["pf", "provident"],
  Gratuity: ["gratuity"],
  "Meal Benefit": ["meal"],
  "Annual Incentive": ["incentive", "variable pay", "bonus", "commission"],
};

export function mapComponentsToCompany(
  components: SalaryComponent[],
  companyId: CompanyId
): MappedComponent[] {
  const company = COMPANIES[companyId];
  const flexiTarget = companyId === "vero" ? "Special Allowance (Flexi Allowance)" : "Special Allowance";

  return components
    .filter((c) => (c.annual ?? 0) > 0)
    .map((c) => {
      const n = c.name.toLowerCase();
      let mappedTo: string | null = null;
      for (const [target, keywords] of Object.entries(DIRECT_MAP_KEYWORDS)) {
        if (keywords.some((k) => n.includes(k))) {
          mappedTo = target === "Special Allowance" ? flexiTarget : target;
          break;
        }
      }
      if (!mappedTo && companyId === "vero" && n.includes("meal")) {
        mappedTo = "Meal Allowance";
      }
      const isDirectMatch = mappedTo !== null;
      if (!mappedTo) {
        mappedTo = flexiTarget;
      }
      const reason = isDirectMatch
        ? `Direct equivalent identified in ${company.name}'s official compensation structure.`
        : `No equivalent compensation category exists within ${company.name}'s salary framework. This component has therefore been consolidated into ${flexiTarget} while preserving the employee's overall compensation.`;
      return {
        sourceName: c.name,
        sourceAnnual: c.annual ?? 0,
        mappedTo,
        isDirectMatch,
        reason,
      };
    });
}

export function formatINR(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function pctDiff(current: number, proposed: number): number {
  if (!current) return 0;
  return (proposed - current) / current;
}
