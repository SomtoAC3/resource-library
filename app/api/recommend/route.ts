import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { extractKeywords } from "@/lib/url-utils";

export const maxDuration = 60;

interface RankedItem {
  idx: number;   // index into candidates array — avoids UUID hallucination
  explanation: string;
  visitFirst: boolean;
}

interface AIResponse {
  recommendations: RankedItem[];
  suggestedCategories: string[];
  note: string;
}

const SYSTEM_PROMPT = `You are a design resource curator for "stash" — a curated library of design and development tools, libraries, and inspiration for designers and vibe coders.

A user described what they are building or looking for. You will receive their request and a list of candidate resources from the library.

Your job:
1. Rank the top 5 most relevant resources for this specific request
2. Write a concise 1–2 sentence explanation of WHY each resource fits the request
3. Mark the single most important resource as visitFirst: true
4. Suggest 1–3 category names the user should explore further
5. Write a short overall note (1 sentence) that frames the recommendations

Return valid JSON only — no markdown, no explanation outside JSON:
{
  "recommendations": [
    { "idx": 0, "explanation": "...", "visitFirst": true|false }
  ],
  "suggestedCategories": ["Category"],
  "note": "One sentence framing."
}

IMPORTANT: "idx" must be the exact integer index from the candidate list (0-based). Do NOT use any other identifier.

Rules:
- Only include resources from the provided list
- Rank by actual relevance to the specific request, not just keyword overlap
- Explanations must be specific to the user's request, not generic summaries
- Return exactly 5 recommendations (or fewer if fewer candidates exist)`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query: unknown = body?.query;

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const keywords = extractKeywords(query);

  // Step 1: FTS search for relevant candidates
  let candidates: Record<string, unknown>[] = [];

  if (keywords.trim()) {
    const { data: ftsResults } = await supabase.rpc("search_resources", {
      query_text: keywords,
      filter_category: null,
      result_limit: 20,
      result_offset: 0,
    });
    candidates = ftsResults ?? [];
  }

  // If FTS returned too few results, pad with latest resources
  if (candidates.length < 10) {
    const { data: latest } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(20);

    const existingIds = new Set(candidates.map((r: any) => r.id));
    const padding = (latest ?? []).filter((r: any) => !existingIds.has(r.id));
    candidates = [...candidates, ...padding].slice(0, 20);
  }

  if (candidates.length === 0) {
    return NextResponse.json({ error: "No resources found" }, { status: 404 });
  }

  // Step 2: Send to OpenAI for ranking + explanations
  // Use array index (not UUID) so the model can't hallucinate IDs
  const resourceContext = candidates
    .map((r: any, idx: number) =>
      JSON.stringify({
        idx,
        title: r.title,
        domain: r.domain,
        categories: r.categories,
        tags: r.tags,
        summary: r.ai_summary ?? r.description,
      })
    )
    .join("\n");

  let aiResponse: AIResponse;

  try {
    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `User request: "${query.trim()}"\n\nCandidate resources:\n${resourceContext}`,
        },
      ],
    });

    aiResponse = JSON.parse(completion.choices[0].message.content ?? "{}");
  } catch {
    return NextResponse.json(
      { error: "AI recommendations are temporarily unavailable." },
      { status: 503 }
    );
  }

  // Step 3: Map idx back to full resource data
  const recommendations = (aiResponse.recommendations ?? [])
    .filter((item: RankedItem) => typeof item.idx === "number" && candidates[item.idx])
    .map((item: RankedItem) => ({
      resource: candidates[item.idx],
      explanation: item.explanation,
      visitFirst: item.visitFirst ?? false,
    }));

  return NextResponse.json({
    recommendations,
    suggestedCategories: aiResponse.suggestedCategories ?? [],
    note: aiResponse.note ?? "",
  });
}
