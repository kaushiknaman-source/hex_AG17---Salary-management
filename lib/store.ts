"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CompanyId,
  Grade,
  SalaryComponent,
  DEFAULT_COMPONENTS,
} from "./salary-engine";

export interface Employee {
  name: string;
  employeeId: string;
  designation: string;
  grade: Grade | "";
  currentCompany: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  employeeName: string;
  targetCTC: number;
  companies: CompanyId[];
}

interface SalaryStore {
  employee: Employee;
  components: SalaryComponent[];
  targetCTC: number | null;
  selectedCompanies: CompanyId[];
  grade: Grade | null;
  history: AnalysisRecord[];
  setEmployee: (e: Partial<Employee>) => void;
  setComponents: (c: SalaryComponent[]) => void;
  updateComponent: (id: string, patch: Partial<SalaryComponent>) => void;
  addComponent: (c: SalaryComponent) => void;
  removeComponent: (id: string) => void;
  reorderComponents: (from: number, to: number) => void;
  setTargetCTC: (v: number | null) => void;
  setSelectedCompanies: (c: CompanyId[]) => void;
  setGrade: (g: Grade | null) => void;
  pushHistory: (r: AnalysisRecord) => void;
  reset: () => void;
}

export const useSalaryStore = create<SalaryStore>()(
  persist(
    (set, get) => ({
      employee: {
        name: "",
        employeeId: "",
        designation: "",
        grade: "",
        currentCompany: "",
      },
      components: DEFAULT_COMPONENTS,
      targetCTC: null,
      selectedCompanies: ["geosystems"],
      grade: null,
      history: [],
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
      setSelectedCompanies: (c) => set({ selectedCompanies: c }),
      setGrade: (g) => set({ grade: g }),
      pushHistory: (r) => set({ history: [r, ...get().history].slice(0, 20) }),
      reset: () =>
        set({
          components: DEFAULT_COMPONENTS,
          targetCTC: null,
          selectedCompanies: ["geosystems"],
          grade: null,
        }),
    }),
    { name: "hexagon-ag17-salary-session" }
  )
);
