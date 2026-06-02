import { createClient } from "@/lib/supabase/server";
import { BoardHome } from "@/components/BoardHome";
import type { Resource } from "@/lib/types";

async function getHomeData(): Promise<{ resources: Resource[]; count: number }> {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("resources")
    .select("*", { count: "exact" })
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(8);

  return { resources: data ?? [], count: count ?? 0 };
}

export default async function HomePage() {
  const { resources, count } = await getHomeData();

  return <BoardHome resources={resources} totalCount={count} />;
}
