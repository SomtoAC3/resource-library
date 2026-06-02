export type InputMode = "submit" | "search" | "recommend";

/**
 * Deterministic intent classifier — no AI needed.
 * submit   → looks like a URL
 * search   → 1–4 words
 * recommend → 5+ words (sentence / description / question)
 */
export function detectMode(input: string): InputMode {
  const t = input.trim();
  if (!t) return "search";
  if (looksLikeUrl(t)) return "submit";
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 5) return "recommend";
  return "search";
}

/** Strip common stop-words to extract FTS keywords from a sentence */
export function extractKeywords(sentence: string): string {
  const stop = new Set([
    "i","me","my","we","you","a","an","the","is","are","am","be","was","were",
    "to","of","in","for","on","with","at","by","from","and","or","but","so",
    "need","want","looking","find","show","give","suggest","help","build",
    "building","built","create","creating","made","make","similar","like",
    "something","anything","some","any","that","this","it","its","just","also",
    "really","very","more","can","do","does","how","what","which","where","who",
    "im","ive","id","ill","im","would","could","should","have","has","had",
  ]);
  return sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w))
    .join(" ");
}

/** Returns true for full URLs and bare domain-like strings (magnific.com, www.x.io/path) */
export function looksLikeUrl(value: string): boolean {
  const t = value.trim();
  if (!t || /\s/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return true;
  return /^(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(\/\S*)?$/.test(t);
}

/** Ensures a string has a https:// protocol prefix */
export function toFullUrl(value: string): string {
  const t = value.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/** Canonical form: https, no www, no trailing slash */
export function normalizeUrl(raw: string): string {
  const u = new URL(toFullUrl(raw));
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const path = (u.pathname + (u.search || "")).replace(/\/$/, "") || "";
  return `${u.protocol}//${host}${u.port ? `:${u.port}` : ""}${path}`;
}

/** All URL variants to check for dedup (www/no-www × slash/no-slash) */
export function urlVariants(normalized: string): string[] {
  const withSlash = `${normalized}/`;
  const withWww = normalized.replace(/^(https?:\/\/)/, "$1www.");
  const withWwwSlash = `${withWww}/`;
  return [normalized, withSlash, withWww, withWwwSlash];
}
