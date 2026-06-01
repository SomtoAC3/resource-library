"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/types";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  const toggle = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (active === cat) params.delete("category");
      else params.set("category", cat);
      router.push(`/search?${params.toString()}`);
    },
    [active, router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => toggle(cat)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150",
            active === cat
              ? "bg-foreground text-background"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
