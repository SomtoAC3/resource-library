"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ResourceType } from "@/lib/types";

type FilterValue = ResourceType | "all";

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "resource", label: "Resources" },
  { value: "reference", label: "References" },
];

export function TypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = (searchParams.get("type") ?? "all") as FilterValue;

  const select = useCallback(
    (value: FilterValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") params.delete("type");
      else params.set("type", value);
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className="chip chip-accent"
          data-active={active === value ? "1" : "0"}
          onClick={() => select(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
