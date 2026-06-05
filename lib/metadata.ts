import * as cheerio from "cheerio";

export interface ExtractedMetadata {
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  domain: string;
}

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const parsed = new URL(url);
  const domain = parsed.hostname.replace(/^www\./, "");

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ResourceLibraryBot/1.0)" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text() ||
    null;

  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    null;

  const og_image_url =
    $('meta[property="og:image"]').attr("content") || null;

  const faviconHref =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    "/favicon.ico";

  const favicon_url = faviconHref.startsWith("http")
    ? faviconHref
    : `${parsed.protocol}//${parsed.host}${faviconHref.startsWith("/") ? "" : "/"}${faviconHref}`;

  return {
    title: title?.trim().slice(0, 500) ?? null,
    description: description?.trim().slice(0, 1000) ?? null,
    og_image_url,
    favicon_url,
    domain,
  };
}
