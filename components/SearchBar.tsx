"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function SearchBar({ className }: Props) {
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

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search size={16} strokeWidth={2} />
      </span>
      <input
        name="q"
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        placeholder="Search resources…"
        className={cn(
          "w-full h-11 rounded-xl border border-border bg-card pl-9 pr-4 text-sm",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/25",
          "transition-shadow duration-150"
        )}
      />
    </form>
  );
}
