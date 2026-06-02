"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";
import { getTint, getMark, getKind } from "@/lib/resource-utils";

interface Suggestion {
  id: string;
  title: string | null;
  domain: string | null;
  categories: string[];
  source: string | null;
}

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

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions on input change
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q.trim())}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 200);
  };

  const navigate = useCallback((q: string) => {
    setOpen(false);
    setSuggestions([]);
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/resources/${suggestions[activeIndex].id}`);
      setOpen(false);
    } else {
      navigate(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const pickSuggestion = (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    router.push(`/resources/${s.id}`);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fieldSize = size === "sm" ? "field-sm" : "field-md";

  return (
    <div ref={wrapRef} className={`suggestions-wrap${className ? ` ${className}` : ""}`}>
      <form onSubmit={handleSubmit}>
        <div className={`field ${fieldSize}`}>
          <span className="ico"><SearchIcon size={size === "sm" ? 14 : 16} /></span>
          <input
            ref={inputRef}
            name="q"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search resources, tags, domains…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="suggestions" role="listbox">
          {suggestions.map((s, i) => {
            const tint = getTint(s as any);
            const mark = getMark(s as any);
            const kind = getKind(s as any);
            return (
              <div
                key={s.id}
                className="suggestion-item"
                data-active={i === activeIndex ? "1" : "0"}
                role="option"
                onMouseDown={() => pickSuggestion(s)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span
                  className="suggestion-favicon"
                  style={{
                    width: 26, height: 26,
                    background: `linear-gradient(150deg, ${tint}, color-mix(in oklab, ${tint} 72%, #000))`,
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  {mark}
                </span>
                <div className="suggestion-body">
                  <div className="suggestion-title">{s.title ?? s.domain}</div>
                  {s.domain && <div className="suggestion-meta">{s.domain}</div>}
                </div>
                {kind && <span className="suggestion-kind">{kind}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
