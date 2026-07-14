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
  /** Candidate's current CTC per annum, as disclosed — used to compute the offer hike. */
  currentCTC: number | null;
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  employee: Employee;
  components: SalaryComponent[];
  targetCTC: number;
  companies: CompanyId[];
  grade: Grade | null;
}

interface SalaryStore {
  employee: Employee;
  components: SalaryComponent[];
  targetCTC: number | null;
  selectedCompanies: CompanyId[];
  grade: Grade | null;
  history: AnalysisRecord[];
  hikePresets: number[];
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
  loadFromHistory: (id: string) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  setHikePresets: (v: number[]) => void;
  reset: () => void;
}

const DEFAULT_EMPLOYEE: Employee = {
  name: "",
  employeeId: "",
  designation: "",
  grade: "",
  currentCompany: "",
  currentCTC: null,
};

const DEFAULT_HIKE_PRESETS = [15, 20, 25, 30];

export const useSalaryStore = create<SalaryStore>()(
  persist(
    (set, get) => ({
      employee: DEFAULT_EMPLOYEE,
      components: DEFAULT_COMPONENTS,
      targetCTC: null,
      selectedCompanies: ["geosystems"],
      grade: null,
      history: [],
      hikePresets: DEFAULT_HIKE_PRESETS,
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
      loadFromHistory: (id) => {
        const record = get().history.find((h) => h.id === id);
        if (!record) return;
        set({
          employee: record.employee,
          components: record.components,
          targetCTC: record.targetCTC,
          selectedCompanies: record.companies,
          grade: record.grade,
        });
      },
      removeHistory: (id) =>
        set({ history: get().history.filter((h) => h.id !== id) }),
      clearHistory: () => set({ history: [] }),
      setHikePresets: (v) => set({ hikePresets: v }),
      reset: () =>
        set({
          employee: DEFAULT_EMPLOYEE,
          components: DEFAULT_COMPONENTS,
          targetCTC: null,
          selectedCompanies: ["geosystems"],
          grade: null,
        }),
    }),
    { name: "hexagon-ag17-salary-session" }
  )
);
