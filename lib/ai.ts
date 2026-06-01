import OpenAI from "openai";
import { CATEGORIES, type Category } from "./types";

interface AIResult {
  categories: Category[];
  tags: string[];
  ai_summary: string;
}

const SYSTEM_PROMPT = `You are a resource categorization assistant for a design and development library.

Given a web resource, return a JSON object with exactly these fields:
- categories: array of zero or more categories from this fixed list: ${CATEGORIES.map((c) => `"${c}"`).join(", ")}
- tags: array of 3–8 short descriptive tags (e.g. "React", "Animation", "UI")
- ai_summary: a single sentence under 200 characters describing the resource

Rules:
- Only use categories from the fixed list. Do not invent new categories.
- Tags should be concise, title-cased, specific, and useful for search.
- ai_summary must be under 200 characters.
- Return valid JSON only. No markdown, no explanation.`;

export async function categorizeResource(input: {
  url: string;
  title: string | null;
  description: string | null;
  domain: string;
}): Promise<AIResult> {
  const userMessage = [
    `URL: ${input.url}`,
    `Domain: ${input.domain}`,
    input.title ? `Title: ${input.title}` : null,
    input.description ? `Description: ${input.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
  });

  const raw = JSON.parse(response.choices[0].message.content ?? "{}");

  const categories = (Array.isArray(raw.categories) ? raw.categories : []).filter(
    (c: unknown): c is Category => CATEGORIES.includes(c as Category)
  );

  const tags = (Array.isArray(raw.tags) ? raw.tags : [])
    .filter((t: unknown) => typeof t === "string")
    .slice(0, 8)
    .map((t: string) => t.trim());

  const ai_summary =
    typeof raw.ai_summary === "string"
      ? raw.ai_summary.trim().slice(0, 200)
      : "";

  return { categories, tags, ai_summary };
}
