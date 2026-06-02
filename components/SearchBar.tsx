"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface Props {
  className?: string;
  size?: "sm" | "md";
}

function SearchIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function SearchBar({ className, size = "md" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value.trim();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => navigate(q), 300);
    },
    [navigate]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
      navigate(q);
    },
    [navigate]
  );

  const fieldSize = size === "sm" ? "field-sm" : "field-md";

  return (
    <form onSubmit={handleSubmit} className={className} style={{ width: "100%" }}>
      <div className={`field ${fieldSize}`}>
        <span className="ico">
          <SearchIcon size={size === "sm" ? 14 : 16} />
        </span>
        <input
          name="q"
          type="search"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={handleChange}
          placeholder="Search resources, tags, domains…"
          autoComplete="off"
        />
      </div>
    </form>
  );
}
