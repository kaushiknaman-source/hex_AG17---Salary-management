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
  confidence?: number; // 0-100, AI classification confidence (or heuristic fallback)
  taxability?: TaxabilityStatus;
}

export type TaxabilityStatus = "Taxable" | "Partially Exempt" | "Exempt";

// Indicative mapping only — not tax advice. Real taxability depends on
// limits, regime (old vs new tax regime), and case-specific facts that this
// platform does not evaluate. Shown to give HR a directional flag to verify
// with Finance/Tax, not a filing determination.
export function heuristicTaxability(category?: ComponentCategory): TaxabilityStatus {
  switch (category) {
    case "Basic Salary":
    case "Variable Pay":
    case "Bonus":
      return "Taxable";
    case "Employer Contribution":
    case "Retiral":
      return "Exempt";
    case "Allowance":
    case "Benefit":
      return "Partially Exempt";
    case "Reimbursement":
      return "Exempt";
    default:
      return "Taxable";
  }
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

// ---------------------------------------------------------------------
// Current-structure summary used to build the results header, metric
// comparison cards, and composition chart from freeform user-entered
// components (matched by known id where available, else by category).
// ---------------------------------------------------------------------

export interface CurrentSummary {
  totalAnnual: number;
  basic: number;
  hraAndConveyance: number;
  specialAllowance: number;
  employerContribution: number; // Employer PF + Gratuity (employer-borne retirals)
  variablePay: number; // Bonus + Variable Pay categories
  otherBenefits: number; // Benefit + Reimbursement categories
  takeHomeMonthly: number; // (Total − Employer Contribution − Variable Pay) / 12, approx.
}

export function computeCurrentSummary(components: SalaryComponent[]): CurrentSummary {
  const get = (id: string) => components.find((c) => c.id === id)?.annual ?? 0;

  // Prefer known default ids for precision; fall back to AI/heuristic category
  // for custom components so the summary still accounts for everything.
  const knownIds = new Set(["basic", "hra", "shift", "medical", "lta", "special", "pf", "gratuity", "meal", "incentive"]);
  const basic = get("basic");
  const hraAndConveyance = get("hra") + get("shift") + get("lta");
  const specialAllowance = get("special");
  const employerContribution = get("pf") + get("gratuity");
  const variablePayKnown = get("incentive");
  const otherKnown = get("medical") + get("meal");

  let variablePayExtra = 0;
  let otherExtra = 0;
  let employerContributionExtra = 0;
  let unclassifiedExtra = 0;

  for (const c of components) {
    if (knownIds.has(c.id) || !(c.annual && c.annual > 0)) continue;
    switch (c.category) {
      case "Variable Pay":
      case "Bonus":
        variablePayExtra += c.annual;
        break;
      case "Employer Contribution":
      case "Retiral":
        employerContributionExtra += c.annual;
        break;
      case "Benefit":
      case "Reimbursement":
        otherExtra += c.annual;
        break;
      default:
        unclassifiedExtra += c.annual; // treated as allowance-like, folded into "other"
        otherExtra += 0; // keep explicit for clarity; counted in totalAnnual regardless
    }
  }

  const variablePay = variablePayKnown + variablePayExtra;
  const otherBenefits = otherKnown + otherExtra + unclassifiedExtra;
  const employerContributionTotal = employerContribution + employerContributionExtra;
  const totalAnnual = components.reduce((sum, c) => sum + (c.annual ?? 0), 0);
  const takeHomeMonthly = Math.max(0, totalAnnual - employerContributionTotal - variablePay) / 12;

  return {
    totalAnnual,
    basic,
    hraAndConveyance,
    specialAllowance,
    employerContribution: employerContributionTotal,
    variablePay,
    otherBenefits,
    takeHomeMonthly,
  };
}

// ---------------------------------------------------------------------
// Detailed line-by-line comparison table (current vs proposed), grouped
// by target category so consolidated components read as one clear row
// rather than duplicating the proposed figure across every source line.
// ---------------------------------------------------------------------

export interface DetailedRow {
  label: string;
  current: number;
  proposed: number;
  reason: string;
  isNew: boolean; // proposed-only line with no current equivalent supplied
}

export function buildDetailedRows(
  components: SalaryComponent[],
  companyId: CompanyId,
  structure: ProposedStructure
): DetailedRow[] {
  const company = COMPANIES[companyId];
  const flexiTarget =
    companyId === "vero" ? "Special Allowance (Flexi Allowance)" : "Special Allowance";
  const mapped = mapComponentsToCompany(components, companyId);

  const grouped = new Map<string, { current: number; reasons: Set<string> }>();
  for (const m of mapped) {
    const g = grouped.get(m.mappedTo) || { current: 0, reasons: new Set<string>() };
    g.current += m.sourceAnnual;
    if (!m.isDirectMatch) g.reasons.add(m.reason);
    grouped.set(m.mappedTo, g);
  }

  const proposedByLabel: Record<string, number> = {
    Basic: structure.basic,
    HRA: structure.hra,
    [flexiTarget]: structure.specialAllowance,
    "Employer PF": structure.employerPF,
    Gratuity: structure.gratuity,
    "Meal Allowance": structure.mealAllowance,
    "Annual Incentive": structure.annualIncentive,
  };

  const order = [
    "Basic",
    "HRA",
    "Conveyance Allowance",
    flexiTarget,
    "Employer PF",
    "Gratuity",
    ...(company.hasMealAllowance ? ["Meal Allowance"] : []),
    ...(company.hasFlexiAttire && structure.flexiAttire ? ["Flexi Attire Benefit"] : []),
    "Annual Incentive",
  ];

  const rows: DetailedRow[] = order.map((label) => {
    if (label === "Conveyance Allowance") {
      return {
        label,
        current: 0,
        proposed: structure.conveyanceAllowance,
        reason: `Statutory conveyance component introduced under ${company.name}'s framework (${(company.conveyancePct * 100).toFixed(0)}% of Deemed Wages) — no equivalent was present in the current structure.`,
        isNew: true,
      };
    }
    if (label === "Flexi Attire Benefit") {
      return {
        label,
        current: 0,
        proposed: structure.flexiAttire,
        reason: `Grade-banded flexi benefit under ${company.name}'s policy for grade ${structure.grade}.`,
        isNew: true,
      };
    }
    const g = grouped.get(label);
    const current = g?.current ?? 0;
    const proposed = proposedByLabel[label] ?? 0;
    const reason =
      g && g.reasons.size > 0
        ? Array.from(g.reasons)[0]
        : current > 0
        ? "Direct equivalent identified in the official compensation structure."
        : `Standard ${company.name} component — no current equivalent supplied.`;
    return { label, current, proposed, reason, isNew: current === 0 };
  });

  return rows.filter((r) => r.current > 0 || r.proposed > 0);
}

// ---------------------------------------------------------------------
// Compliance panel — deterministic, rule-based checks against the values
// the engine itself computed. These are structural sanity checks against
// the New Labour Code assumptions baked into the engine, not a substitute
// for legal/statutory review — flagged items should always go to Finance/
// Legal, and "Passed" only means the number is internally consistent with
// the modeled rule, not that it has been independently audited.
// ---------------------------------------------------------------------

export type ComplianceStatus = "passed" | "review";

export interface ComplianceCheck {
  label: string;
  status: ComplianceStatus;
  detail: string;
}

export function computeComplianceChecks(
  structure: ProposedStructure,
  companyId: CompanyId
): ComplianceCheck[] {
  const company = COMPANIES[companyId];
  const checks: ComplianceCheck[] = [];

  // 1. Wage code: Basic + allowances forming "wages" must be >= 50% of total CTC
  const wagesRatio = structure.deemedWages / structure.fixedCTC;
  checks.push({
    label: "Wage Code — 50% Deemed Wages Floor",
    status: wagesRatio >= 0.499 ? "passed" : "review",
    detail: `Deemed Wages = ${(wagesRatio * 100).toFixed(1)}% of Fixed CTC (statutory floor: 50%).`,
  });

  // 2. Basic must be at least 40% of Fixed CTC under the modeled policy
  const basicRatio = structure.basic / structure.fixedCTC;
  checks.push({
    label: "Basic Wages Threshold",
    status: basicRatio >= 0.399 ? "passed" : "review",
    detail: `Basic = ${(basicRatio * 100).toFixed(1)}% of Fixed CTC (policy target: ${(company.basicPct * 100).toFixed(0)}%).`,
  });

  // 3. Employer PF should be 12% of Deemed Wages
  const pfRatio = structure.deemedWages > 0 ? structure.employerPF / structure.deemedWages : 0;
  checks.push({
    label: "Employer PF Contribution",
    status: Math.abs(pfRatio - company.pfPct) < 0.005 ? "passed" : "review",
    detail: `Employer PF = ${(pfRatio * 100).toFixed(1)}% of Deemed Wages (policy: ${(company.pfPct * 100).toFixed(0)}%).`,
  });

  // 4. Gratuity computed and non-zero
  checks.push({
    label: "Gratuity Accrual",
    status: structure.gratuity > 0 ? "passed" : "review",
    detail:
      structure.gratuity > 0
        ? `Gratuity accrual of ${formatINR(structure.gratuity)}/year modeled per ${company.gratuityStatedRate}.`
        : "No gratuity accrual computed — verify Fixed CTC input.",
  });

  // 5. Variable pay reasonableness — flag if incentive exceeds 30% of total CTC
  const variableRatio = structure.annualIncentive / structure.totalCTC;
  checks.push({
    label: "Variable Pay Mix",
    status: variableRatio <= 0.3 ? "passed" : "review",
    detail: `Target incentive is ${(variableRatio * 100).toFixed(1)}% of Total CTC (policy target: ${(company.incentivePct * 100).toFixed(0)}% of Fixed CTC).`,
  });

  // 6. Internal consistency: Base Pay + Total Retiral must reconcile to Fixed CTC
  checks.push({
    label: "Fixed CTC Reconciliation",
    status: Math.abs(structure.fixedCTCCheck - structure.fixedCTC) <= 1 ? "passed" : "review",
    detail: `Base Pay + Total Retiral reconciles to ${formatINR(structure.fixedCTCCheck)} against a target of ${formatINR(structure.fixedCTC)}.`,
  });

  return checks;
}

// ---------------------------------------------------------------------
// Offer signals — transparent, rule-based indicators (NOT a machine-learned
// prediction and not sourced from external market data). Competitiveness is
// purely the % change vs. the candidate's disclosed current CTC; retention
// risk is the inverse of that same signal. Both are explained inline in the
// UI so HR can see exactly how each label was derived.
// ---------------------------------------------------------------------

export type OfferBand = "Highly Competitive" | "Competitive" | "Moderate" | "Below Current";
export type RetentionRisk = "Low" | "Moderate" | "High" | "Unknown";

export interface OfferSignals {
  increasePct: number | null;
  competitiveness: OfferBand | "Unknown";
  competitivenessScore: number | null; // 0-100, simple linear mapping for display only
  retentionRisk: RetentionRisk;
}

export function computeOfferSignals(currentEmployerCTC: number | null, proposedTotalCTC: number): OfferSignals {
  if (!currentEmployerCTC || currentEmployerCTC <= 0) {
    return { increasePct: null, competitiveness: "Unknown", competitivenessScore: null, retentionRisk: "Unknown" };
  }
  const increasePct = (proposedTotalCTC - currentEmployerCTC) / currentEmployerCTC;

  let competitiveness: OfferBand;
  let retentionRisk: RetentionRisk;
  if (increasePct >= 0.15) {
    competitiveness = "Highly Competitive";
    retentionRisk = "Low";
  } else if (increasePct >= 0.05) {
    competitiveness = "Competitive";
    retentionRisk = "Low";
  } else if (increasePct >= 0) {
    competitiveness = "Moderate";
    retentionRisk = "Moderate";
  } else {
    competitiveness = "Below Current";
    retentionRisk = "High";
  }

  // Simple bounded linear score for display (0 at -20% or worse, 100 at +30% or better)
  const score = Math.round(Math.min(100, Math.max(0, ((increasePct + 0.2) / 0.5) * 100)));

  return { increasePct, competitiveness, competitivenessScore: score, retentionRisk };
}

// ---------------------------------------------------------------------
// Special Compensation — one-off / discretionary items filed alongside an
// employee's structured salary (joining bonus, relocation, retention bond,
// etc). Each item can optionally be folded into the CTC figure shown to the
// candidate via `includeInCTC`. "Retention Bond" items model a service
// commitment: an annual amount paid over a fixed number of years, which is
// recoverable from the employee — on a pro-rata basis — if they exit before
// completing the commitment period.
// ---------------------------------------------------------------------

export type CompensationItemType = "one-time" | "retention-bond" | "other";

export const COMPENSATION_TYPE_LABELS: Record<CompensationItemType, string> = {
  "one-time": "One-Time Bonus",
  "retention-bond": "Retention Bond (Clawback)",
  other: "Other",
};

export interface CompensationItem {
  id: string;
  name: string;
  type: CompensationItemType;
  includeInCTC: boolean;
  notes?: string;
  // "one-time" / "other" — a single lump-sum amount
  amount?: number | null;
  // "retention-bond" — paid annually over a fixed commitment period
  annualAmount?: number | null;
  commitmentYears?: number | null;
}

export function createCompensationItem(type: CompensationItemType = "one-time"): CompensationItem {
  return {
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    type,
    includeInCTC: false,
    notes: "",
    amount: null,
    annualAmount: null,
    commitmentYears: null,
  };
}

/** The figure this item contributes to an *annual* CTC number. */
export function compensationItemAnnualValue(item: CompensationItem): number {
  if (item.type === "retention-bond") return item.annualAmount ?? 0;
  return item.amount ?? 0;
}

/** Total commitment value of a retention bond (annualAmount * commitmentYears). */
export function retentionBondTotal(item: CompensationItem): number {
  if (item.type !== "retention-bond") return 0;
  return (item.annualAmount ?? 0) * (item.commitmentYears ?? 0);
}

export interface CompensationTotals {
  totalAll: number; // annualized value of every item, regardless of CTC inclusion
  totalInCTC: number; // annualized value of items marked "include in CTC"
  totalOutsideCTC: number;
  totalRetentionCommitment: number; // full multi-year value of all retention bonds
}

export function computeCompensationTotals(items: CompensationItem[]): CompensationTotals {
  let totalInCTC = 0;
  let totalOutsideCTC = 0;
  let totalRetentionCommitment = 0;
  for (const item of items) {
    const v = compensationItemAnnualValue(item);
    if (item.includeInCTC) totalInCTC += v;
    else totalOutsideCTC += v;
    totalRetentionCommitment += retentionBondTotal(item);
  }
  return {
    totalInCTC,
    totalOutsideCTC,
    totalAll: totalInCTC + totalOutsideCTC,
    totalRetentionCommitment,
  };
}

export interface RetentionBondYear {
  year: number; // 1-indexed year of the commitment
  paidThisYear: number;
  cumulativePaid: number;
  recoverableIfExitAfterThisYear: number; // pro-rata clawback if they leave right after completing this year
}

/**
 * Builds a year-by-year payout / clawback schedule for a retention bond.
 * Recovery model: if the employee exits after completing Y of N committed
 * years, Hexagon can recover the amount paid so far, prorated by the
 * fraction of the commitment left unserved: paidSoFar * (N - Y) / N.
 */
export function retentionBondSchedule(item: CompensationItem): RetentionBondYear[] {
  if (item.type !== "retention-bond") return [];
  const annual = item.annualAmount ?? 0;
  const years = item.commitmentYears ?? 0;
  if (annual <= 0 || years <= 0) return [];
  const schedule: RetentionBondYear[] = [];
  let cumulative = 0;
  for (let y = 1; y <= years; y++) {
    cumulative += annual;
    const remainingFraction = (years - y) / years;
    schedule.push({
      year: y,
      paidThisYear: annual,
      cumulativePaid: cumulative,
      recoverableIfExitAfterThisYear: Math.round(cumulative * remainingFraction),
    });
  }
  return schedule;
}
