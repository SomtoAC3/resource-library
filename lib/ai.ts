import OpenAI from "openai";
import { CATEGORIES, type Category } from "./types";

const KINDS = [
  "Library", "Framework", "Tool", "Platform", "AI",
  "Gallery", "Reference", "Icons", "Fonts", "Assets",
  "Generator", "Collection", "Photos",
] as const;

type Kind = (typeof KINDS)[number];

interface AIResult {
  name: string;
  kind: Kind;
  categories: Category[];
  tags: string[];
  ai_summary: string;
}

const SYSTEM_PROMPT = `You are a resource categorization assistant for a curated design-resource library.

Given a web resource, return a JSON object with exactly these fields:

- name: the short, canonical name of the product or website (e.g. "Mobbin", "shadcn/ui", "GSAP", "Framer Motion"). 2–4 words max. Do NOT use the full page title.
- kind: one word classifying what type of resource this is. Must be one of: ${KINDS.join(", ")}.
- categories: array of zero or more categories from this fixed list: ${CATEGORIES.map((c) => `"${c}"`).join(", ")}
- tags: array of 3–8 short descriptive tags (e.g. "React", "Animation", "UI")
- ai_summary: 1–2 sentences under 240 characters describing the resource and why it's useful.

Rules:
- name must be the product's own name, not a tagline or page title.
- kind must be exactly one value from the list above.
- categories must only use values from the fixed list.
- tags should be concise, title-cased, and useful for search.
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
    input.title ? `Page title: ${input.title}` : null,
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

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim().slice(0, 120)
      : input.domain;

  const kind: Kind = KINDS.includes(raw.kind) ? raw.kind : "Tool";

  const categories = (Array.isArray(raw.categories) ? raw.categories : []).filter(
    (c: unknown): c is Category => CATEGORIES.includes(c as Category)
  );

  const tags = (Array.isArray(raw.tags) ? raw.tags : [])
    .filter((t: unknown) => typeof t === "string")
    .slice(0, 8)
    .map((t: string) => t.trim());

  const ai_summary =
    typeof raw.ai_summary === "string"
      ? raw.ai_summary.trim().slice(0, 240)
      : "";

  return { name, kind, categories, tags, ai_summary };
}
