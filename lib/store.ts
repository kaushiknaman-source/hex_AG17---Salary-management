"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CompanyId,
  Grade,
  SalaryComponent,
  DEFAULT_COMPONENTS,
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

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  employeeName: string;
  targetCTC: number;
  company: CompanyId;
}

interface SalaryStore {
  employee: Employee;
  components: SalaryComponent[];
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
  setTargetCTC: (v: number | null) => void;
  setSelectedCompany: (c: CompanyId) => void;
  setGrade: (g: Grade | null) => void;
  pushHistory: (r: AnalysisRecord) => void;
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
      setTargetCTC: (v) => set({ targetCTC: v }),
      setSelectedCompany: (c) => set({ selectedCompany: c }),
      setGrade: (g) => set({ grade: g }),
      pushHistory: (r) => set({ history: [r, ...get().history].slice(0, 20) }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      reset: () =>
        set({
          employee: EMPTY_EMPLOYEE,
          components: DEFAULT_COMPONENTS,
          targetCTC: null,
          selectedCompany: "geosystems",
          grade: null,
        }),
    }),
    { name: "hexagon-ag17-salary-session-v3" }
  )
);
