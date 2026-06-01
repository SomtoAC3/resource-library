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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Search input */}
      <Suspense>
        <SearchBar className="w-full max-w-2xl" />
      </Suspense>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Suspense>
          <CategoryFilter />
        </Suspense>
        <div className="flex items-center gap-4 shrink-0">
          {q && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{results.length}</span>{" "}
              result{results.length !== 1 ? "s" : ""}
              {category && (
                <>
                  {" "}in{" "}
                  <span className="font-medium text-foreground">{category}</span>
                </>
              )}
            </p>
          )}
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
