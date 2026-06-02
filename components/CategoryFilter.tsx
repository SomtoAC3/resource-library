"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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

  const clearCategory = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      <button
        type="button"
        className="chip chip-accent"
        data-active={!active ? "1" : "0"}
        onClick={clearCategory}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className="chip chip-accent"
          data-active={active === cat ? "1" : "0"}
          onClick={() => toggle(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
