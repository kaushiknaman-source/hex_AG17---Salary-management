import { NextRequest } from "next/server";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, context } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    context: unknown;
  };

  const system = `You are the AI Compensation Assistant embedded in Hexagon_AG17, Hexagon's internal Salary Management Agent. You help HR business partners understand and reason about a specific employee's salary comparison that has already been computed deterministically by the official compensation engine (you are given the exact figures below — never contradict or silently recompute them; if a recalculation is requested, show the arithmetic explicitly using only the official rules: Basic = 40% of Fixed CTC, Deemed Wages = 50% of Total Remuneration (Fixed CTC minus Gratuity), Conveyance = 35% of Deemed Wages, Employer PF = 12% of Deemed Wages, Target Incentive = 10% of Fixed CTC, and company-specific gratuity rates). Be concise, professional, and speak like a seasoned C&B consultant. Use plain text with occasional bold (**like this**) — no markdown headers.

Current analysis context (JSON): ${JSON.stringify(context)}`;

  const stream = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 700,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[Response interrupted — please retry.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
