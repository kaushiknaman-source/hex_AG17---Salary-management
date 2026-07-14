# Hexagon_AG17 — Salary Management Agent

AI-Powered Salary Structuring, Compensation Benchmarking & HR Intelligence Platform for Hexagon's global HR organization.

## What this is

A production-ready internal enterprise application that:

- Takes an employee's current salary structure (fully optional, freeform, unlimited custom components).
- Uses Claude to classify every component (Basic Salary, Allowance, Benefit, Employer Contribution, Retiral, Variable Pay, Bonus, Reimbursement).
- Rebuilds the compensation structure against a **Target Fixed CTC** using the exact, official calculation logic of three Hexagon entities — **Hexagon Geosystems**, **Hexagon Manufacturing Intelligence (Metrology)**, and **Vero** — replicated line-for-line from `HRCYTemp.xlsx`.
- Intelligently maps components with no direct equivalent into Special/Flexi Allowance, with a human-readable reason for every decision.
- Generates an AI executive insights report grounded in the specific comparison.
- Exports the full comparison to PDF and Excel.

## Why the math isn't "AI-generated"

Salary calculations are computed **deterministically** in `lib/salary-engine.ts`, not by the language model. This is a deliberate compliance decision: payroll arithmetic must be exact and auditable every time, and an LLM should never be the source of truth for statutory figures. Claude is used for the parts that genuinely need judgment and language — classifying ambiguous component names and writing the narrative insights — while always being given the already-computed figures as grounding context so it explains real numbers rather than inventing them.

Every formula in `lib/salary-engine.ts` was verified cell-for-cell against `HRCYTemp.xlsx`'s own cached values for all three companies (see the comment block at the top of that file for the full derivation, including how the circular Gratuity ↔ Deemed Wages reference was solved algebraically).

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — fully serverless, Vercel-first
- **TailwindCSS** + hand-authored shadcn/ui-pattern components (`components/ui`)
- **Framer Motion** for motion, **Recharts** for charts
- **Claude API** (`@anthropic-ai/sdk`) via Next.js Route Handlers — classification, streaming insights
- **Zustand** (persisted to `localStorage`) for client-side session state — no server persistence, no database, nothing that breaks Vercel's stateless serverless model
- **jsPDF / jsPDF-AutoTable** and **SheetJS (xlsx)** for client-side export

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the `ANTHROPIC_API_KEY` environment variable (and optionally `ANTHROPIC_MODEL`) in Project Settings → Environment Variables.
4. Deploy. `npm run build` requires no manual steps.

The Claude API key is only ever read inside `app/api/*/route.ts` (Node.js runtime, server-side) — it is never sent to or embedded in client bundles.

## Project structure

```
app/
  page.tsx                 Command Center dashboard
  salary/page.tsx          Step 1–3: current structure → AI classification → target CTC & companies
  results/page.tsx         Comparison results, charts, mapping, AI insights
  compare/page.tsx         Reference: official formulas per company
  api/classify/route.ts    AI component classification
  api/insights/route.ts    AI executive insights (streaming)
lib/
  salary-engine.ts         The deterministic calculation engine (source of truth)
  store.ts                 Zustand session store
  export-pdf.ts / export-excel.ts
components/
  ui/                      Button, Card, Input, Tabs, Badge, Select, etc.
  results/                 Charts and summary cards
```

## Brand compliance

Colors, typography, and the logo mark are sourced directly from the uploaded Hexagon brand guidelines (`tailwind.config.ts` encodes the full official palette; `components/logo.tsx` renders the fold mark in white for dark-surface use, per instruction). Arial is used throughout per the "Digital/Microsoft font" guideline for on-screen application UI.
