import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { load } from "cheerio";

export const maxDuration = 300;

async function fetchImageMeta(url: string) {
  const parsed = new URL(url);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StashBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = load(html);

    const og_image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const faviconHref =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    const favicon_url = faviconHref.startsWith("http")
      ? faviconHref
      : `${parsed.protocol}//${parsed.host}${faviconHref.startsWith("/") ? "" : "/"}${faviconHref}`;

    return { og_image_url: og_image ?? null, favicon_url };
  } catch {
    return null;
  }
}

export async function POST() {
  const sb = createAdminClient();

  const { data: resources, error } = await sb
    .from("resources")
    .select("id, url, title")
    .eq("status", "ready")
    .is("og_image_url", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Record<string, string> = {};

  for (const r of resources ?? []) {
    const meta = await fetchImageMeta(r.url);
    if (!meta) { results[r.title ?? r.url] = "fetch failed"; continue; }

    const update: Record<string, string | null> = { favicon_url: meta.favicon_url };
    if (meta.og_image_url) {
      update.og_image_url = meta.og_image_url;
      update.screenshot_url = meta.og_image_url;
    }

    const { error: upErr } = await sb.from("resources").update(update).eq("id", r.id);
    results[r.title ?? r.url] = upErr ? `error: ${upErr.message}` : (meta.og_image_url ?? "favicon only");
  }

  return NextResponse.json({ updated: Object.keys(results).length, results });
}
