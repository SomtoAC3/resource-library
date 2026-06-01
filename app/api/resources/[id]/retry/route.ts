import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processResource } from "@/lib/process";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: resource, error: fetchError } = await supabase
    .from("resources")
    .select("id, url, status")
    .eq("id", id)
    .single();

  if (fetchError || !resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.status !== "failed") {
    return NextResponse.json({ error: "Only failed resources can be retried" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("resources")
    .update({ status: "processing" })
    .eq("id", id);

  if (updateError) {
    console.error(`[POST /api/resources/${id}/retry] supabase update failed — code=${updateError.code} message=${updateError.message} detail=${updateError.details} hint=${updateError.hint}`);
    return NextResponse.json({ error: "Failed to reset resource status" }, { status: 500 });
  }

  after(async () => {
    await processResource(id, resource.url);
  });

  return NextResponse.json({ status: "processing" });
}
