import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { load } from "cheerio";

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

    const og_image_raw =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const og_image = og_image_raw
      ? og_image_raw.startsWith("http")
        ? og_image_raw
        : og_image_raw.startsWith("//")
        ? `${parsed.protocol}${og_image_raw}`
        : `${parsed.protocol}//${parsed.host}${og_image_raw.startsWith("/") ? "" : "/"}${og_image_raw}`
      : null;

    return og_image;
  } catch {
    return null;
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = createAdminClient();

  const { data: resource, error } = await sb
    .from("resources")
    .select("id, url")
    .eq("id", id)
    .single();

  if (error || !resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const og_image = await fetchImageMeta(resource.url);

  if (!og_image) {
    return NextResponse.json({ error: "No image found" }, { status: 404 });
  }

  await sb
    .from("resources")
    .update({ og_image_url: og_image, screenshot_url: og_image })
    .eq("id", id);

  return NextResponse.json({ url: og_image });
}
