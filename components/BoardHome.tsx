"use client";

import { useState, useRef, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MemoCard } from "./MemoCard";
import { AddResourceModal } from "./AddResourceModal";
import { CATEGORIES } from "@/lib/types";
import type { Resource } from "@/lib/types";

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const SCATTER_POS: CSSProperties[] = [
  { top: "3%",  left: "2%" },
  { top: "37%", left: "8.5%" },
  { bottom: "4%", left: "2.5%" },
  { top: "5%",  right: "2%" },
  { top: "39%", right: "8.5%" },
  { bottom: "3%", right: "2.5%" },
];

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

interface Props {
  resources: Resource[];
  totalCount: number;
}

export function BoardHome({ resources, totalCount }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [addUrl, setAddUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim();
  const urlMode = isUrl(trimmed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (urlMode) {
      setAddUrl(trimmed);
      setValue("");
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const around = resources.slice(0, SCATTER_POS.length);

  return (
    <div className="home-canvas fade-in">
      <div className="board-stage">
        {/* Scattered memo cards (desktop only, hidden on mobile via CSS) */}
        <div className="scatter-around">
          {around.map((r, i) => (
            <div
              key={r.id}
              className="around-card"
              style={SCATTER_POS[i]}
            >
              <MemoCard resource={r} />
            </div>
          ))}
        </div>

        {/* Central stage */}
        <div className="stage-center">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            the design stash · {totalCount} pinned
          </p>

          <h1 style={{
            fontSize: "clamp(1.6rem, 3.6vw, 2.15rem)",
            fontWeight: 700,
            letterSpacing: "-0.022em",
            lineHeight: 1.1,
            margin: "0 0 8px",
          }}>
            Found something good?
          </h1>

          <p style={{
            fontSize: "0.98em",
            margin: "0 0 20px",
            color: "var(--muted-foreground)",
          }}>
            Pin a link to stash it — or dig through the board around you.
          </p>

          {/* Unified search / add bar */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
            <div className="field field-lg" style={{ flex: 1 }}>
              <span className="ico">
                {urlMode ? <LinkIcon /> : <SearchIcon />}
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="paste a link or search…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trimmed}
              className={`btn btn-lg ${urlMode ? "btn-primary" : "btn-outline"}`}
              style={{ height: 52, flexShrink: 0, opacity: loading ? 0.6 : 1 }}
            >
              {urlMode ? "Stash 📌" : "Search"}
            </button>
          </form>

          <p style={{ fontSize: "0.76em", marginTop: 12, color: "var(--ds-fg-subtle)" }}>
            psst — copy a link and we&rsquo;ll spot it for you.
          </p>

          {/* Category chips */}
          <div className="stage-cats">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/search?category=${encodeURIComponent(c)}`}
                className="chip"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="stage-foot">
        <Link href="/search" className="tertiary-link">
          see the whole stash <ArrowRightIcon />
        </Link>
        <span className="stage-hint">tap a card to open it · &nbsp;{around.length > 0 ? "drag the pins around" : ""}</span>
      </div>

      {/* Add flow modal (triggered by URL submission) */}
      {addUrl && (
        <AddResourceModal
          onClose={() => setAddUrl(null)}
          initialUrl={addUrl}
        />
      )}
    </div>
  );
}
