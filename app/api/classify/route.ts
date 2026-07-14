import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";
import { heuristicClassify, ComponentCategory } from "@/lib/salary-engine";

export const runtime = "nodejs";

const CATEGORIES: ComponentCategory[] = [
  "Basic Salary",
  "Allowance",
  "Benefit",
  "Employer Contribution",
  "Retiral",
  "Variable Pay",
  "Bonus",
  "Reimbursement",
];

interface ClassifyInput {
  components: { id: string; name: string; description?: string }[];
}

export async function POST(req: NextRequest) {
  let body: ClassifyInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const components = (body.components || []).filter((c) => c.name?.trim());
  if (components.length === 0) {
    return NextResponse.json({ classifications: [] });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful degradation: local heuristic classifier keeps the product usable
    // without a configured key (e.g. local dev before env vars are set).
    return NextResponse.json({
      classifications: components.map((c) => ({
        id: c.id,
        category: heuristicClassify(c.name),
        confidence: "heuristic",
      })),
      source: "heuristic-fallback",
    });
  }

  const prompt = `You are an experienced Compensation & Benefits consultant reviewing an Indian salary structure.

Classify each salary component below into EXACTLY one of these categories:
${CATEGORIES.map((c) => `- ${c}`).join("\n")}

Components:
${components.map((c, i) => `${i + 1}. "${c.name}"${c.description ? ` — ${c.description}` : ""}`).join("\n")}

Respond with ONLY a JSON array, no markdown fences, no preamble, in this exact shape:
[{"index": 1, "category": "Basic Salary"}, ...]
The "index" must match the numbering above. The "category" must be one of the exact category strings listed.`;

  try {
    const msg = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed: { index: number; category: string }[] = JSON.parse(text);

    const classifications = components.map((c, i) => {
      const match = parsed.find((p) => p.index === i + 1);
      const category = CATEGORIES.includes(match?.category as ComponentCategory)
        ? (match!.category as ComponentCategory)
        : heuristicClassify(c.name);
      return { id: c.id, category, confidence: "ai" as const };
    });

    return NextResponse.json({ classifications, source: "claude" });
  } catch (err) {
    console.error("Classification error:", err);
    return NextResponse.json({
      classifications: components.map((c) => ({
        id: c.id,
        category: heuristicClassify(c.name),
        confidence: "heuristic",
      })),
      source: "heuristic-fallback",
    });
  }
}
