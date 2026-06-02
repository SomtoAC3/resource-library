// fetch-images.mjs — fetches og:image + favicon for resources missing thumbnails
// Run: node --env-file=/tmp/vercel-prod.env scripts/fetch-images.mjs

import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fetchImageMeta(url) {
  const parsed = new URL(url);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StashBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const og_image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") || null;

    const faviconHref =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    const favicon_url = faviconHref.startsWith("http")
      ? faviconHref
      : `${parsed.protocol}//${parsed.host}${faviconHref.startsWith("/") ? "" : "/"}${faviconHref}`;

    return { og_image_url: og_image, favicon_url };
  } catch (e) {
    return null;
  }
}

async function main() {
  const { data: resources, error } = await sb
    .from("resources")
    .select("id, url, title, og_image_url, favicon_url")
    .eq("status", "ready")
    .is("og_image_url", null);

  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  console.log(`${resources.length} resources missing og_image_url\n`);

  for (const r of resources) {
    process.stdout.write(`  ${r.title ?? r.url} … `);
    const meta = await fetchImageMeta(r.url);

    if (!meta || (!meta.og_image_url && !meta.favicon_url)) {
      console.log("no image found");
      continue;
    }

    const update = {};
    if (meta.og_image_url) { update.og_image_url = meta.og_image_url; update.screenshot_url = meta.og_image_url; }
    if (meta.favicon_url)  update.favicon_url = meta.favicon_url;

    const { error: upErr } = await sb.from("resources").update(update).eq("id", r.id);
    if (upErr) console.log(`error: ${upErr.message}`);
    else console.log(`✓ ${meta.og_image_url ?? "favicon only"}`);
  }

  console.log("\nDone.");
}

main().catch(console.error);
