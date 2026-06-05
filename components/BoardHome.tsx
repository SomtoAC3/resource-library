"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  CSSProperties,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MemoCard } from "./MemoCard";
import { AddResourceModal } from "./AddResourceModal";
import { getTint, getMark, getKind } from "@/lib/resource-utils";
import { useBoard } from "@/lib/use-board";
import { looksLikeUrl, toFullUrl, detectMode } from "@/lib/url-utils";
import { CATEGORIES } from "@/lib/types";
import type { Resource, ResourceType } from "@/lib/types";

interface Suggestion {
  id: string;
  title: string | null;
  domain: string | null;
  categories: string[];
  source: string | null;
}

// ── helpers ────────────────────────────────────────────────────────────

const MEMO_SIZE = 232;

const DEFAULT_POS_SPECS = [
  { top: 0.03,  left:  0.02  },
  { top: 0.37,  left:  0.085 },
  { bottom: 0.04, left: 0.025 },
  { top: 0.05,  right: 0.02  },
  { top: 0.39,  right: 0.085 },
  { bottom: 0.03, right: 0.025 },
] as const;

const NOTE_COLORS = [
  "#f6c5bf", "#f7dca0", "#bfe3c0", "#bcd2f2",
  "#d8c6f0", "#f3c9e0", "#cdeae3", "#f4d6a8",
];

interface Position { x: number; y: number; }
interface StickyNote { id: string; x: number; y: number; color: string; }

function defaultPos(index: number, W: number, H: number): Position {
  const spec = DEFAULT_POS_SPECS[index % DEFAULT_POS_SPECS.length] as any;
  return {
    x: spec.left != null ? spec.left * W : W - spec.right * W - MEMO_SIZE,
    y: spec.top  != null ? spec.top  * H : H - spec.bottom * H - MEMO_SIZE,
  };
}

// ── Icons ───────────────────────────────────────────────────────────────

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

// ── DraggablePin ────────────────────────────────────────────────────────

function DraggablePin({
  pos, onMove, onOpen, children,
}: {
  pos: Position;
  onMove: (x: number, y: number) => void;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button != null && e.button !== 0) return;
    try { ref.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
    ref.current?.classList.add("dragging");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    onMove(d.ox + dx, d.oy + dy);
  };

  const onPointerUp = () => {
    const d = drag.current; drag.current = null;
    ref.current?.classList.remove("dragging");
    if (d && !d.moved) onOpen();
  };

  return (
    <div ref={ref} className="around-card"
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {children}
    </div>
  );
}

// ── StickyNote ──────────────────────────────────────────────────────────

function StickyNote({ note, onClose, onSubmit, onMove }: {
  note: StickyNote;
  onClose: () => void;
  onSubmit: (url: string) => void;
  onMove: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [val, setVal] = useState("");

  useEffect(() => { inputRef.current?.focus(); }, []);

  const ready = val.trim() && looksLikeUrl(val.trim());
  const stash = () => { if (ready) onSubmit(toFullUrl(val.trim())); };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    if (target.closest("textarea, button")) return;
    try { ref.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag.current = { sx: e.clientX, sy: e.clientY, ox: note.x, oy: note.y };
    ref.current?.classList.add("dragging");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    onMove(d.ox + (e.clientX - d.sx), d.oy + (e.clientY - d.sy));
  };

  const onPointerUp = () => { drag.current = null; ref.current?.classList.remove("dragging"); };

  return (
    <div ref={ref} className="around-card"
      style={{ left: note.x, top: note.y, touchAction: "none" }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="sticky-note" style={{ "--paper": note.color } as CSSProperties}>
        <button type="button" className="note-x" onClick={onClose} aria-label="Remove note">✕</button>
        <div className="memo-eye" style={{ opacity: 0.6 }}>new pin</div>
        <textarea ref={inputRef} className="note-input"
          placeholder="add a link to stash it…" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); stash(); }
            else if (e.key === "Escape") onClose();
          }} />
        <div className="note-foot">
          <span className="note-hint">{ready ? "↵ to stash" : "paste a link"}</span>
        </div>
      </div>
    </div>
  );
}

// ── BoardHome ───────────────────────────────────────────────────────────

interface Props {
  resources: Resource[];
  totalCount: number;
}

export function BoardHome({ resources, totalCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const sugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState("");
  const [homeType, setHomeType] = useState<ResourceType | "all">("all");
  const [addUrl, setAddUrl] = useState<string | null>(null);
  const [livePositions, setLivePositions] = useState<Map<string, Position>>(new Map());
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugOpen, setSugOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const mode = detectMode(value);
  const urlMode = mode === "submit";

  // Board state: explicit inclusion — pinned IDs are the homepage; default to latest 6 on first session
  const { ready: boardReady, initialized, pin, unpin, initialize, isOnHomepage, getPosition, savePosition } = useBoard();

  // Before first-session init, fall back to the 6 latest so the board isn't empty during the effect
  const pinnedResources = initialized
    ? resources.filter(r => isOnHomepage(r.id))
    : resources.slice(0, 6);

  // Resources to scatter: pinned resources filtered by type
  const visibleResources = pinnedResources
    .filter(r => homeType === "all" || r.type === homeType);

  // On the very first session, seed pinnedIds with the 6 latest resources
  useEffect(() => {
    if (!boardReady || initialized) return;
    initialize(resources.slice(0, 6).map(r => r.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardReady, initialized]);

  // Handle URLs shared from the iOS share sheet via Web Share Target (/share?url=...)
  useEffect(() => {
    const shared = searchParams.get("share");
    if (shared) {
      setAddUrl(toFullUrl(shared));
      router.replace("/", { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute live scatter positions from saved or default layout
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !boardReady) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;

    setLivePositions(prev => {
      const next = new Map(prev);
      visibleResources.forEach((r, i) => {
        if (!next.has(r.id)) {
          const saved = getPosition(r.id);
          next.set(r.id, saved ?? defaultPos(i, W, H));
        }
      });
      // Remove stale positions for resources no longer visible
      for (const key of next.keys()) {
        if (!visibleResources.some(r => r.id === key)) next.delete(key);
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardReady, visibleResources.map(r => r.id).join(",")]);

  const movePin = useCallback((id: string, x: number, y: number) => {
    setLivePositions(prev => { const next = new Map(prev); next.set(id, { x, y }); return next; });
    savePosition(id, x, y);
  }, [savePosition]);

  // Clipboard awareness — open modal on paste outside of input/textarea fields
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if ((e.target as Element)?.closest?.("input, textarea")) return;
      const t = e.clipboardData?.getData("text") ?? "";
      if (looksLikeUrl(t.trim())) setAddUrl(toFullUrl(t.trim()));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggestions fetch
  const fetchSuggestions = useCallback(async (q: string) => {
    const t = q.trim();
    if (t.length < 2 || looksLikeUrl(t)) { setSuggestions([]); setSugOpen(false); return; }
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(t)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data); setSugOpen(data.length > 0); setActiveIndex(-1);
    } catch { setSuggestions([]); }
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node))
        setSugOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t) return;
    setSugOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/resources/${suggestions[activeIndex].id}`);
      return;
    }
    const m = detectMode(t);
    if (m === "submit") { setAddUrl(toFullUrl(t)); setValue(""); }
    else if (m === "recommend") { router.push(`/recommend?q=${encodeURIComponent(t)}`); }
    else router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  // Spawn sticky note on empty board click
  const spawnNote = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (target.closest(".stage-center, .around-card, .tertiary-link, a, button, input, textarea")) return;
    const rect = stageRef.current!.getBoundingClientRect();
    const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    setNotes(n => [...n, {
      id: "n" + Date.now(),
      x: Math.max(4, e.clientX - rect.left - 110),
      y: Math.max(4, e.clientY - rect.top - 110),
      color,
    }]);
  };

  return (
    <div className="home-canvas fade-in">
      <div className="board-stage" ref={stageRef} onClick={spawnNote}>

        {/* Scattered draggable pins */}
        <div className="scatter-around">
          {boardReady && visibleResources.map(r => {
            const pos = livePositions.get(r.id);
            if (!pos) return null;
            return (
              <DraggablePin key={r.id} pos={pos}
                onMove={(x, y) => movePin(r.id, x, y)}
                onOpen={() => router.push(`/resources/${r.id}`)}>
                <MemoCard resource={r} noLink
                  pinned={true}
                  onTogglePin={() => unpin(r.id)} />
              </DraggablePin>
            );
          })}

          {notes.map(n => (
            <StickyNote key={n.id} note={n}
              onClose={() => setNotes(ns => ns.filter(x => x.id !== n.id))}
              onSubmit={url => { setNotes(ns => ns.filter(x => x.id !== n.id)); setAddUrl(url); }}
              onMove={(x, y) => setNotes(ns => ns.map(m => m.id === n.id ? { ...m, x, y } : m))} />
          ))}
        </div>

        {/* Center stage */}
        <div className="stage-center">
          <>
            <div className="home-hero">
                <p className="eyebrow" style={{ marginBottom: 12 }}>
                  the design stash · {totalCount} pinned
                </p>
                <h1 style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.15rem)", fontWeight: 700, letterSpacing: "-0.022em", lineHeight: 1.1, margin: "0 0 8px" }}>
                  Found something good?
                </h1>
                <p style={{ fontSize: "0.98em", margin: "0 0 20px", color: "var(--muted-foreground)" }}>
                  Pin a link to stash it<span className="home-hero-secondary"> — or dig through the board around you</span>.
                </p>
              </div>

              <div ref={searchWrapRef} className="suggestions-wrap">
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
                  <div className="field field-lg" style={{ flex: 1 }}>
                    <input
                      value={value}
                      onChange={e => {
                        const v = e.target.value;
                        setValue(v);
                        if (sugDebounceRef.current) clearTimeout(sugDebounceRef.current);
                        sugDebounceRef.current = setTimeout(() => fetchSuggestions(v), 200);
                      }}
                      onKeyDown={e => {
                        if (!sugOpen || !suggestions.length) return;
                        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
                        else if (e.key === "Escape") { setSugOpen(false); setActiveIndex(-1); }
                      }}
                      placeholder="search, paste a link, or describe what you're building…"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                  </div>
                  <button type="submit" disabled={!value.trim()}
                    className={`btn btn-lg ${mode === "search" ? "btn-outline" : "btn-primary"}`}
                    style={{ height: 52, flexShrink: 0, opacity: value.trim() ? 1 : 0.5 }}>
                    {mode === "submit" ? "Stash 📌" : mode === "recommend" ? "Ask AI ✨" : "Search"}
                  </button>
                </form>

                {sugOpen && suggestions.length > 0 && (
                  <div className="suggestions" role="listbox">
                    {suggestions.map((s, i) => {
                      const tint = getTint(s as any);
                      const mark = getMark(s as any);
                      const kind = getKind(s as any);
                      return (
                        <div key={s.id} className="suggestion-item"
                          data-active={i === activeIndex ? "1" : "0"} role="option"
                          onMouseDown={() => { router.push(`/resources/${s.id}`); setSugOpen(false); }}
                          onMouseEnter={() => setActiveIndex(i)}>
                          <span className="suggestion-favicon" style={{ width: 26, height: 26, fontSize: 11, borderRadius: 6, background: `linear-gradient(150deg, ${tint}, color-mix(in oklab, ${tint} 72%, #000))` }}>{mark}</span>
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

              <div className="stage-cats">
                {CATEGORIES.map(c => (
                  <Link key={c} href={`/search?category=${encodeURIComponent(c)}`} className="chip">{c}</Link>
                ))}
              </div>

              <div className="home-type-filter" style={{ gap: 6, marginTop: 10, justifyContent: "center" }}>
                {(["all", "resource", "reference"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    className="chip chip-accent"
                    data-active={homeType === t ? "1" : "0"}
                    onClick={() => setHomeType(t)}
                  >
                    {t === "all" ? "All" : t === "resource" ? "Resources" : "References"}
                  </button>
                ))}
              </div>
            </>
        </div>
      </div>

      <div className="stage-foot">
        <Link href="/search" className="tertiary-link">
          see the whole stash <ArrowRightIcon />
        </Link>
        <span className="stage-hint">
          drag the pins around · tap anywhere to add a sticky note
        </span>
      </div>

      {addUrl && <AddResourceModal onClose={() => setAddUrl(null)} initialUrl={addUrl} />}
    </div>
  );
}
