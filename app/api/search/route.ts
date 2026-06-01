import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const offset = Number(searchParams.get("offset") ?? 0);

  const supabase = await createClient();

  if (!q) {
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
    if (error) return NextResponse.json({ error: "Search failed" }, { status: 500 });
    return NextResponse.json({ results: data, query: null });
  }

  // Full-text search via Supabase RPC
  const { data, error } = await supabase.rpc("search_resources", {
    query_text: q,
    filter_category: category ?? null,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ results: data, query: q });
}
