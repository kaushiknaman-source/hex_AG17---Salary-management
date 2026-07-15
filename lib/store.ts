"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CompanyId,
  Grade,
  SalaryComponent,
  DEFAULT_COMPONENTS,
  CompensationItem,
} from "./salary-engine";

export const BUSINESS_UNITS = [
  "Geosystems",
  "Metrology",
  "Safety, Infrastructure & Geospatial",
  "Manufacturing Intelligence",
  "Autonomy & Positioning",
  "Mining",
] as const;
export type BusinessUnit = (typeof BUSINESS_UNITS)[number];

export interface Employee {
  name: string;
  employeeId: string;
  designation: string;
  grade: Grade | ""; // "Hiring Grade" in the UI
  currentCompany: string;
  currentCTC: number | null; // mandatory — candidate's current annual CTC from their existing employer
  currentEmployer: string; // e.g. ABB, Siemens, Trimble, Leica, Bosch, Autodesk
  experienceYears: number | null;
  location: string;
  businessUnit: BusinessUnit | "";
  departmentBudgetCap: number | null; // optional, user-supplied reference point for the benchmark section
}

// A saved analysis is a full snapshot of everything needed to reopen the
// Results page exactly as it was — the Results page always *recomputes* the
// proposed structure live from these inputs (same as a fresh analysis), so
// there's no risk of a stale cached total drifting from the engine.
export interface AnalysisRecord {
  id: string;
  timestamp: number;
  label: string; // "Designation — N yrs exp", the save-as key the user asked for
  employeeName: string;
  designation: string;
  experienceYears: number | null;
  businessUnit: BusinessUnit | "";
  location: string;
  targetCTC: number;
  company: CompanyId;
  totalCTC: number; // recommended total CTC at the time of saving, incl. any in-CTC special compensation
  snapshot: {
    employee: Employee;
    components: SalaryComponent[];
    compensationItems: CompensationItem[];
    targetCTC: number;
    selectedCompany: CompanyId;
    grade: Grade | null;
  };
}

interface SalaryStore {
  employee: Employee;
  components: SalaryComponent[];
  compensationItems: CompensationItem[];
  targetCTC: number | null;
  selectedCompany: CompanyId;
  grade: Grade | null;
  history: AnalysisRecord[];
  sidebarCollapsed: boolean;
  setEmployee: (e: Partial<Employee>) => void;
  setComponents: (c: SalaryComponent[]) => void;
  updateComponent: (id: string, patch: Partial<SalaryComponent>) => void;
  addComponent: (c: SalaryComponent) => void;
  removeComponent: (id: string) => void;
  reorderComponents: (from: number, to: number) => void;
  setCompensationItems: (c: CompensationItem[]) => void;
  addCompensationItem: (c: CompensationItem) => void;
  updateCompensationItem: (id: string, patch: Partial<CompensationItem>) => void;
  removeCompensationItem: (id: string) => void;
  setTargetCTC: (v: number | null) => void;
  setSelectedCompany: (c: CompanyId) => void;
  setGrade: (g: Grade | null) => void;
  saveAnalysis: (r: AnalysisRecord) => void;
  loadAnalysis: (id: string) => void;
  deleteAnalysis: (id: string) => void;
  toggleSidebar: () => void;
  reset: () => void;
}

const EMPTY_EMPLOYEE: Employee = {
  name: "",
  employeeId: "",
  designation: "",
  grade: "",
  currentCompany: "",
  currentCTC: null,
  currentEmployer: "",
  experienceYears: null,
  location: "",
  businessUnit: "",
  departmentBudgetCap: null,
};

export const useSalaryStore = create<SalaryStore>()(
  persist(
    (set, get) => ({
      employee: EMPTY_EMPLOYEE,
      components: DEFAULT_COMPONENTS,
      compensationItems: [],
      targetCTC: null,
      selectedCompany: "geosystems",
      grade: null,
      history: [],
      sidebarCollapsed: false,
      setEmployee: (e) => set({ employee: { ...get().employee, ...e } }),
      setComponents: (c) => set({ components: c }),
      updateComponent: (id, patch) =>
        set({
          components: get().components.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        }),
      addComponent: (c) => set({ components: [...get().components, c] }),
      removeComponent: (id) =>
        set({ components: get().components.filter((c) => c.id !== id) }),
      reorderComponents: (from, to) => {
        const arr = [...get().components];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        set({ components: arr });
      },
      setCompensationItems: (c) => set({ compensationItems: c }),
      addCompensationItem: (c) =>
        set({ compensationItems: [...get().compensationItems, c] }),
      updateCompensationItem: (id, patch) =>
        set({
          compensationItems: get().compensationItems.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        }),
      removeCompensationItem: (id) =>
        set({ compensationItems: get().compensationItems.filter((c) => c.id !== id) }),
      setTargetCTC: (v) => set({ targetCTC: v }),
      setSelectedCompany: (c) => set({ selectedCompany: c }),
      setGrade: (g) => set({ grade: g }),
      // Explicit, user-triggered save — nothing lands in history until the
      // person chooses to save it from the Results page.
      saveAnalysis: (r) =>
        set({ history: [r, ...get().history.filter((h) => h.id !== r.id)].slice(0, 200) }),
      // Reopens a saved analysis by restoring its full snapshot into the
      // live working state, so /results recomputes it exactly as before.
      loadAnalysis: (id) => {
        const record = get().history.find((h) => h.id === id);
        if (!record) return;
        set({
          employee: record.snapshot.employee,
          components: record.snapshot.components,
          compensationItems: record.snapshot.compensationItems,
          targetCTC: record.snapshot.targetCTC,
          selectedCompany: record.snapshot.selectedCompany,
          grade: record.snapshot.grade,
        });
      },
      deleteAnalysis: (id) =>
        set({ history: get().history.filter((h) => h.id !== id) }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      reset: () =>
        set({
          employee: EMPTY_EMPLOYEE,
          components: DEFAULT_COMPONENTS,
          compensationItems: [],
          targetCTC: null,
          selectedCompany: "geosystems",
          grade: null,
        }),
    }),
    { name: "hexagon-ag17-salary-session-v4" }
  )
);
