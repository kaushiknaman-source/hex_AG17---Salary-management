import { NextRequest } from "next/server";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { employee, current, proposals, targetCTC, mappings } = body;

  const system = `You are a senior Compensation & Benefits consultant at Hexagon Geosystems writing the AI Recommendation for an internal HR salary-structuring platform. You are precise, factual, and never invent numbers that were not given to you — you only reason about and narrate the numbers provided in the payload. Write in short, confident paragraphs and tight bullet points. Never use markdown headers (#); use bold section labels (**like this**) followed by a short paragraph or bullets, and cover, in this order: **Why the structure changed**, **Allowance changes**, **PF logic**, **Gratuity**, **Tax considerations** (directional only — flag for Finance/Tax review, do not give definitive tax advice), **Policy compliance**, **Risk flags** (call out anything worth HR's attention, or state there are none), **Offer attractiveness** (react to the competitiveness/retention signals given — do not invent a different number). Keep the total response under 450 words.`;

  const user = `Employee context: ${JSON.stringify(employee || {})}
Target Fixed CTC: ${targetCTC}

Current structure (annual figures, from itemized components entered by HR): ${JSON.stringify(current)}

Proposed structure (already computed deterministically by the official compensation engine — do not recompute or alter any figure, only interpret it): ${JSON.stringify(proposals)}

Component mapping decisions (which current components were consolidated and why): ${JSON.stringify(mappings)}

Write the AI Recommendation covering every section listed in the system prompt. Ground every claim in the numbers given — if the offer competitiveness/retention risk signals are "Unknown" (no current employer CTC on file), say so rather than guessing.`;

  const stream = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 900,
    system,
    messages: [{ role: "user", content: user }],
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
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            "\n\n[Insight generation interrupted — please retry.]"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
