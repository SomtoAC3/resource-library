import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { UnifiedBar } from "@/components/UnifiedBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/types";

async function getResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export default async function HomePage() {
  const resources = await getResources();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-20 pb-14 max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-[2.25rem] sm:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.15]">
          A library of the internet&apos;s best resources.
        </h1>
        <Suspense>
          <UnifiedBar className="w-full" />
        </Suspense>
      </section>

      {/* Categories */}
      <section className="pb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?category=${encodeURIComponent(cat)}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium",
                "bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors duration-150"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Resource grid */}
      <section className="pb-20">
        {resources.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {resources.length} recent resource{resources.length !== 1 ? "s" : ""}
            </p>
            <Link
              href="/search"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse all →
            </Link>
          </div>
        )}
        <ResourceGrid resources={resources} view="gallery" />
        {resources.length === 0 && (
          <div className="text-center py-24 space-y-2">
            <p className="text-muted-foreground">No resources yet.</p>
            <p className="text-sm text-muted-foreground">
              Paste a URL above to add the first one.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
