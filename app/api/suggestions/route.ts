import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json([]);

  const supabase = await createClient();
  const pattern = `%${q}%`;

  // Use ilike for partial/prefix matching — better for typeahead than FTS
  const { data } = await supabase
    .from("resources")
    .select("id, title, domain, categories, source")
    .eq("status", "ready")
    .or(`title.ilike.${pattern},domain.ilike.${pattern}`)
    .limit(6);

  return NextResponse.json(data ?? []);
}
