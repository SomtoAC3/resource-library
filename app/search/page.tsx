import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ViewToggle } from "@/components/ViewToggle";
import type { Resource } from "@/lib/types";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    view?: string;
  }>;
}

async function searchResources(
  q: string | undefined,
  category: string | undefined
): Promise<Resource[]> {
  const supabase = await createClient();

  if (!q?.trim()) {
    let query = supabase
      .from("resources")
      .select("*")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(48);

    if (category) query = query.contains("categories", [category]);

    const { data } = await query;
    return data ?? [];
  }

  const { data } = await supabase.rpc("search_resources", {
    query_text: q.trim(),
    filter_category: category ?? null,
    result_limit: 48,
    result_offset: 0,
  });

  return data ?? [];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, view: viewParam } = await searchParams;
  const view = viewParam === "list" ? "list" : "gallery";
  const results = await searchResources(q, category);

  return (
    <div className="container fade-in" style={{ paddingTop: 28, paddingBottom: 96 }}>
      {/* Search bar */}
      <div style={{ maxWidth: 640, marginBottom: 22 }}>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Filters row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 28,
        flexWrap: "wrap",
      }}>
        <Suspense>
          <CategoryFilter />
        </Suspense>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: "0.84em", color: "var(--ds-fg-subtle)" }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {results.length}
            </strong>{" "}
            result{results.length !== 1 ? "s" : ""}
            {category && (
              <>
                {" "}in{" "}
                <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>
                  {category}
                </strong>
              </>
            )}
          </span>
          <Suspense>
            <ViewToggle view={view} />
          </Suspense>
        </div>
      </div>

      {/* Results */}
      <ResourceGrid resources={results} view={view} />
    </div>
  );
}
