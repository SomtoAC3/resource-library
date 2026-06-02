import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TypeFilter } from "@/components/TypeFilter";
import { ResourceGrid } from "@/components/ResourceGrid";
import { Recommendations } from "@/components/Recommendations";
import { ViewToggle } from "@/components/ViewToggle";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Resource, ResourceType } from "@/lib/types";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    view?: string;
  }>;
}

async function searchResources(
  q: string | undefined,
  category: string | undefined,
  type: ResourceType | undefined
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
    if (type) query = query.eq("type", type);

    const { data } = await query;
    return data ?? [];
  }

  const { data } = await supabase.rpc("search_resources", {
    query_text: q.trim(),
    filter_category: category ?? null,
    result_limit: 48,
    result_offset: 0,
    filter_type: type ?? null,
  });

  return data ?? [];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, type: typeParam, view: viewParam } = await searchParams;
  const view = viewParam === "list" ? "list" : "gallery";
  const type = typeParam === "resource" || typeParam === "reference" ? typeParam : undefined;
  const results = await searchResources(q, category, type);

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Sticky search + filters bar */}
      <div className="search-sticky">
        <div className="container">
          {/* Centered search bar */}
          <div style={{ maxWidth: 640, margin: "0 auto 14px" }}>
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {/* Type filter */}
          <div style={{ marginBottom: 10 }}>
            <Suspense>
              <TypeFilter />
            </Suspense>
          </div>

          {/* Category filters + count + view toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
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
        </div>
      </div>

      {/* Results grid — scrolls under the sticky bar */}
      <div className="container fade-in" style={{ paddingTop: 28 }}>
        <ResourceGrid resources={results} view={view} />

        {results.length === 0 && q?.trim() && (
          <Recommendations query={q.trim()} />
        )}
      </div>

      <ScrollToTop />
    </div>
  );
}
