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
