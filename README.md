# Hexagon_AG17 — Compensation & Benefits Platform

Hexagon Geosystems' internal salary structuring, compensation benchmarking, and HR intelligence platform. Same backend, calculation engine, Claude integration, and exports as before — this revision is a full UI/UX redesign toward enterprise software (SAP SuccessFactors / Workday register) rather than a landing-page-style demo.

## What changed in this pass

Nothing in the calculation engine, API contracts, or export logic changed. What moved:

- **Visual language**: light workspace, dark navy sidebar (now collapsible), thin blue accent lines instead of gradients/glassmorphism, Inter typeface, 12px corner radius, minimal shadows, no consumer-dashboard flourishes.
- **Dashboard → Command Center**: the marketing-style hero is gone. The homepage now leads with dense, real widgets (Engine Health, Framework Status, Session Activity, Compliance Status), a recent-analyses table, a framework-logic insight panel, and quick actions.
- **Employee Information expanded**: Employee Name/ID/Designation/Grade/Company plus, per this revision's requirements, a **mandatory Candidate Current Annual CTC**, Current Employer, Experience, Location, Business Unit, Hiring Grade (renamed from Grade), and an optional Department Budget Cap.
- **Salary components table**: rebuilt as a proper table (Component / Monthly / Annual / Classification / Taxability / AI Mapping / Actions). Descriptions are hidden by default and only appear when a row is expanded for editing. Classification and taxability now update live (instant local heuristic) as you type, then are overwritten with real Claude-derived values — including a numeric confidence score — once the AI Classification step runs.
- **Workflow**: replaced the 3-dot stepper with a 6-stage workflow timeline (Employee Information → Current Compensation → AI Classification → Framework Comparison → Recommendation → Export), so the in-page steps visibly lead into the results page stages.
- **Results page, completely rebuilt** as an executive dashboard: an 8-metric top summary (Current Employer CTC, Target Fixed, Target Variable, Recommended Total CTC, Difference vs current employer, Offer Competitiveness, Retention Risk, current itemized-structure total), a component distribution donut alongside the existing stacked/waterfall charts, a large in-page **AI Recommendation** panel (not a floating chat bubble) structured around why the structure changed, allowance changes, PF logic, gratuity, tax considerations, policy compliance, risk flags, and offer attractiveness, a **Compliance Indicators** panel, a **Benchmark** panel (current employer vs. Hexagon policy vs. optional department budget cap), and an auto-generated, copy-ready **Offer Summary**.
- **AI Assistant**: moved from a floating chat bubble over the charts to a collapsible right-side dock, with one-click capability prompts (explain the recommendation, reduce cost, increase retention, generate an offer/manager/employee explanation, suggest a negotiation strategy) in addition to free-form chat. Same `/api/chat` endpoint as before.

## On the new "signal" metrics — please read before treating these as real analytics

**Offer Competitiveness** and **Retention Risk** are transparent, rule-based labels derived purely from `(Recommended Total CTC − Candidate's Disclosed Current CTC) / Current CTC` — they are not a machine-learned prediction and are not sourced from any external market-benchmark dataset (this platform doesn't have one). The exact thresholds are in `computeOfferSignals()` in `lib/salary-engine.ts` and are shown to HR as what they are: a simple, inspectable rule, not a model. Likewise, **Taxability** per component is an indicative Basic/Allowance/Benefit/Retiral-based heuristic (`heuristicTaxability()`), not tax advice — real taxability depends on limits and regime that this platform doesn't evaluate, and the UI/exports should be read that way. The **Compliance Indicators** panel checks internal consistency against this platform's own modeled rules (wage-code floor, PF %, etc.), not an independent statutory audit. None of this is fabricated data dressed up as fact — every one of these panels either computes directly from your inputs or is explicitly labeled as a heuristic/indicative signal, and the "Department Budget Cap" and "Target Market" fields the original brief mentioned were handled the same way: budget cap is a real optional field you can fill in, and a fabricated "target market" benchmark was intentionally left out rather than inventing numbers with no data source.

## Why the math isn't "AI-generated"

Salary calculations are computed **deterministically** in `lib/salary-engine.ts`, not by the language model — this was true before this redesign and remains true now. Claude is used only for classification, the AI Recommendation narrative, and the chat assistant, always grounded in numbers the engine already computed.

Every formula in `lib/salary-engine.ts` was verified cell-for-cell against `HRCYTemp.xlsx`'s own cached values for all three companies (see the comment block at the top of that file).

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — fully serverless, Vercel-first
- **TailwindCSS** + hand-authored shadcn/ui-pattern components (`components/ui`)
- Self-hosted **Inter** (`@fontsource/inter`) — no external font CDN dependency at build or runtime
- **Framer Motion** (used sparingly — panel/timeline transitions only, no flashy animation) and **Recharts**
- **Claude API** (`@anthropic-ai/sdk`) via Next.js Route Handlers — classification (with confidence), streaming AI Recommendation, streaming chat. Same three endpoints as before: `/api/classify`, `/api/insights`, `/api/chat`.
- **Zustand** (persisted to `localStorage`) for client-side session state
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

## Project structure

```
app/
  page.tsx                  Command Center (dense widgets, no hero)
  salary/page.tsx            4 in-page steps + 6-stage workflow timeline
  results/page.tsx           Executive results dashboard + right-side AI dock
  compare/page.tsx           Reference: official formulas per company
  api/classify/route.ts      AI component classification (+ confidence)
  api/insights/route.ts      AI Recommendation (streaming)
  api/chat/route.ts          AI Assistant (streaming)
lib/
  salary-engine.ts            Deterministic calc engine + compliance checks + offer signals + taxability heuristic
  store.ts                    Zustand store — employee fields, single selectedCompany, sidebar collapse
  export-pdf.ts / export-excel.ts
components/
  ui/                         Button, Card, Input, Tabs, Badge, Select, etc.
  results/                    Charts, summary card, breakdown table, compliance/benchmark/offer-summary panels
  ai-side-panel.tsx            Collapsible right-side AI dock
  nav-sidebar.tsx              Collapsible dark sidebar
  workflow-timeline.tsx        6-stage horizontal workflow indicator
```

## Brand compliance

Colors and the logo mark are sourced directly from the uploaded Hexagon brand guidelines (`tailwind.config.ts` encodes the full official palette; `components/logo.tsx` renders the fold mark with `currentColor`). Enterprise typography uses Inter per this revision's explicit instruction, self-hosted rather than loaded from Google Fonts.
