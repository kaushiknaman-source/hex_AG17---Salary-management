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

// A fixed, disclosed confidence used for the local heuristic path — this is
// not a real probability, just a legible "not AI-verified" signal in the UI.
const HEURISTIC_CONFIDENCE = 65;

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
        confidence: HEURISTIC_CONFIDENCE,
        source: "heuristic" as const,
      })),
      source: "heuristic-fallback",
    });
  }

  const prompt = `You are an experienced Compensation & Benefits consultant reviewing an Indian salary structure.

Classify each salary component below into EXACTLY one of these categories:
${CATEGORIES.map((c) => `- ${c}`).join("\n")}

For each, also give a confidence score from 0-100 reflecting how certain you are the name/description unambiguously identifies that category (a generic or ambiguous label like "Allowance A" should score lower than an unambiguous one like "Basic Salary").

Components:
${components.map((c, i) => `${i + 1}. "${c.name}"${c.description ? ` — ${c.description}` : ""}`).join("\n")}

Respond with ONLY a JSON array, no markdown fences, no preamble, in this exact shape:
[{"index": 1, "category": "Basic Salary", "confidence": 98}, ...]
The "index" must match the numbering above. The "category" must be one of the exact category strings listed. "confidence" must be an integer 0-100.`;

  try {
    const msg = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1536,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed: { index: number; category: string; confidence?: number }[] = JSON.parse(text);

    const classifications = components.map((c, i) => {
      const match = parsed.find((p) => p.index === i + 1);
      const category = CATEGORIES.includes(match?.category as ComponentCategory)
        ? (match!.category as ComponentCategory)
        : heuristicClassify(c.name);
      const confidence =
        typeof match?.confidence === "number" && match.confidence >= 0 && match.confidence <= 100
          ? Math.round(match.confidence)
          : HEURISTIC_CONFIDENCE;
      return { id: c.id, category, confidence, source: "ai" as const };
    });

    return NextResponse.json({ classifications, source: "claude" });
  } catch (err) {
    console.error("Classification error:", err);
    return NextResponse.json({
      classifications: components.map((c) => ({
        id: c.id,
        category: heuristicClassify(c.name),
        confidence: HEURISTIC_CONFIDENCE,
        source: "heuristic" as const,
      })),
      source: "heuristic-fallback",
    });
  }
}
