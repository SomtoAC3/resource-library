"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface Props {
  compact?: boolean;
  className?: string;
}

export function UnifiedBar({ compact, className }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const urlMode = isUrl(trimmed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;

    if (urlMode) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong");
          return;
        }
        router.push(`/resources/${data.id}`);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-4 text-muted-foreground">
            <Search size={compact ? 16 : 18} strokeWidth={2} />
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={compact ? "Search resources…" : "Search resources or paste a URL…"}
            autoFocus={!compact}
            className={cn(
              "w-full rounded-2xl bg-card border border-border pl-11 pr-14",
              "placeholder:text-muted-foreground/60 text-base",
              "shadow-[0_2px_12px_rgb(0,0,0,0.06)]",
              "focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/25",
              "transition-shadow duration-150",
              compact ? "h-12 text-sm pl-10" : "h-[56px]"
            )}
          />
          <button
            type="submit"
            disabled={loading || !trimmed}
            aria-label={urlMode ? "Add resource" : "Search"}
            className={cn(
              "absolute right-2 flex items-center justify-center rounded-xl",
              "bg-foreground text-background",
              "disabled:opacity-25 transition-opacity duration-150",
              compact ? "w-8 h-8" : "w-10 h-10"
            )}
          >
            {loading ? (
              <Loader2 size={compact ? 14 : 16} className="animate-spin" />
            ) : urlMode ? (
              <Plus size={compact ? 14 : 16} strokeWidth={2.5} />
            ) : (
              <ArrowRight size={compact ? 14 : 16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </form>
      {error && (
        <p className="mt-2 pl-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
