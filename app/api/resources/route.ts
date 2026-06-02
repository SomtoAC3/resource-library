import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processResource } from "@/lib/process";
import { normalizeUrl, urlVariants, toFullUrl, looksLikeUrl } from "@/lib/url-utils";

export const maxDuration = 60;

const isDev = process.env.NODE_ENV === "development";

function devDetail(error: unknown): Record<string, unknown> {
  if (!isDev) return {};
  if (error instanceof Error) return { detail: error.message, stack: error.stack };
  return { detail: String(error) };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url: unknown = body?.url;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Accept bare domains like "magnific.com" — prepend https:// if needed
  if (!looksLikeUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  const fullUrl = toFullUrl(url);

  let parsed: URL;
  try {
    parsed = new URL(fullUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "URL must use http or https" }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(fullUrl);
  const domain = parsed.hostname.toLowerCase().replace(/^www\./, "");

  const supabase = await createClient();

  // Dedup: check all www/slash variants so magnific.com and www.magnific.com both match
  const { data: existingRows } = await supabase
    .from("resources")
    .select("*")
    .in("url", urlVariants(normalizedUrl))
    .limit(1);

  const existing = existingRows?.[0] ?? null;

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const { data: resource, error } = await supabase
    .from("resources")
    .insert({
      url: normalizedUrl,
      domain,
      status: "processing",
      source: body.source ?? "web",
      submitted_by: body.submitted_by ?? null,
    })
    .select()
    .single();

  if (error || !resource) {
    console.error(`[POST /api/resources] supabase insert failed — code=${error?.code} message=${error?.message} detail=${error?.details} hint=${error?.hint}`);
    return NextResponse.json(
      { error: "Failed to create resource", ...devDetail(new Error(error?.message ?? "unknown")) },
      { status: 500 }
    );
  }

  after(async () => {
    await processResource(resource.id, resource.url);
  });

  return NextResponse.json(resource, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const offset = Number(searchParams.get("offset") ?? 0);
  const category = searchParams.get("category");

  const supabase = await createClient();

  let query = supabase
    .from("resources")
    .select("*")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.contains("categories", [category]);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`[GET /api/resources] supabase query failed — code=${error.code} message=${error.message} detail=${error.details} hint=${error.hint}`);
    return NextResponse.json(
      { error: "Failed to fetch resources", ...devDetail(new Error(error.message)) },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
