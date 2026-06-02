import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const supabase = await createClient();

  const { data } = await supabase.rpc("search_resources", {
    query_text: q,
    filter_category: null,
    result_limit: 6,
    result_offset: 0,
  });

  return NextResponse.json(
    (data ?? []).map((r: { id: string; title: string | null; domain: string | null; categories: string[]; source: string | null }) => ({
      id: r.id,
      title: r.title,
      domain: r.domain,
      categories: r.categories,
      source: r.source,
    }))
  );
}
