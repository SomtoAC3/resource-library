"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MemoCard } from "./MemoCard";
import { AddResourceModal } from "./AddResourceModal";
import { CATEGORIES } from "@/lib/types";
import type { Resource } from "@/lib/types";

// ── helpers ────────────────────────────────────────────────────────────

function isUrl(value: string): boolean {
  const t = value.trim();
  if (/\s/.test(t)) return false;
  return /^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(t);
}

const MEMO_SIZE = 232;

// Fractional positions (relative to stage width/height)
const POS_SPECS = [
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
  pos,
  onMove,
  onOpen,
  children,
}: {
  pos: Position;
  onMove: (x: number, y: number) => void;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    sx: number; sy: number; ox: number; oy: number; moved: boolean;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button != null && e.button !== 0) return;
    try { ref.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
    ref.current?.classList.add("dragging");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    onMove(d.ox + dx, d.oy + dy);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    ref.current?.classList.remove("dragging");
    if (d && !d.moved) onOpen();
  };

  return (
    <div
      ref={ref}
      className="around-card"
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}

// ── StickyNote ──────────────────────────────────────────────────────────

function StickyNote({
  note,
  onClose,
  onSubmit,
  onMove,
}: {
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

  const ready = val.trim() && isUrl(val.trim());
  const stash = () => { if (ready) onSubmit(val.trim()); };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    if (target.closest("textarea, button")) return;
    try { ref.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag.current = { sx: e.clientX, sy: e.clientY, ox: note.x, oy: note.y };
    ref.current?.classList.add("dragging");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    onMove(d.ox + (e.clientX - d.sx), d.oy + (e.clientY - d.sy));
  };

  const onPointerUp = () => {
    drag.current = null;
    ref.current?.classList.remove("dragging");
  };

  return (
    <div
      ref={ref}
      className="around-card"
      style={{ left: note.x, top: note.y, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="sticky-note" style={{ "--paper": note.color } as CSSProperties}>
        <button type="button" className="note-x" onClick={onClose} aria-label="Remove note">
          ✕
        </button>
        <div className="memo-eye" style={{ opacity: 0.6 }}>new pin</div>
        <textarea
          ref={inputRef}
          className="note-input"
          placeholder="add a link to stash it…"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); stash(); }
            else if (e.key === "Escape") onClose();
          }}
        />
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
  const stageRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState("");
  const [addUrl, setAddUrl] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [clip, setClip] = useState<string | null>(null);
  const [clipDismissed, setClipDismissed] = useState(false);

  const trimmed = value.trim();
  const urlMode = isUrl(trimmed);

  // Compute absolute scatter positions from stage dimensions
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    setPositions(
      POS_SPECS.map(p => ({
        x: "left" in p
          ? (p as any).left * W
          : W - (p as any).right * W - MEMO_SIZE,
        y: "top" in p
          ? (p as any).top * H
          : H - (p as any).bottom * H - MEMO_SIZE,
      }))
    );
  }, []);

  // Clipboard awareness
  useEffect(() => {
    let cancelled = false;

    const consider = (text: string) => {
      const t = text.trim();
      if (!cancelled && t && isUrl(t) && !clipDismissed) setClip(t);
    };

    const tryRead = async () => {
      try {
        if (navigator.clipboard?.readText) consider(await navigator.clipboard.readText());
      } catch { /* permission denied — paste listener covers it */ }
    };

    tryRead();

    const onFocus = () => tryRead();
    const onPaste = (e: ClipboardEvent) => {
      const t = e.clipboardData?.getData("text") ?? "";
      if (isUrl(t.trim())) { setClipDismissed(false); setClip(t.trim()); }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("paste", onPaste);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("paste", onPaste);
    };
  }, [clipDismissed]);

  const movePin = useCallback((i: number, x: number, y: number) => {
    setPositions(prev => {
      if (!prev) return prev;
      const next = [...prev];
      next[i] = { x, y };
      return next;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (urlMode) { setAddUrl(trimmed); setValue(""); }
    else router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // Tap empty board → spawn sticky note
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

  const around = resources.slice(0, POS_SPECS.length);
  const short = (u: string) =>
    u.replace(/^https?:\/\//i, "").replace(/^www\./i, "").slice(0, 46);

  return (
    <div className="home-canvas fade-in">
      <div className="board-stage" ref={stageRef} onClick={spawnNote}>

        {/* Scattered draggable pins + tap-to-create sticky notes */}
        <div className="scatter-around">
          {positions && around.map((r, i) => (
            <DraggablePin
              key={r.id}
              pos={positions[i]}
              onMove={(x, y) => movePin(i, x, y)}
              onOpen={() => router.push(`/resources/${r.id}`)}
            >
              <MemoCard resource={r} noLink />
            </DraggablePin>
          ))}

          {notes.map(n => (
            <StickyNote
              key={n.id}
              note={n}
              onClose={() => setNotes(ns => ns.filter(x => x.id !== n.id))}
              onSubmit={url => {
                setNotes(ns => ns.filter(x => x.id !== n.id));
                setAddUrl(url);
              }}
              onMove={(x, y) =>
                setNotes(ns => ns.map(m => m.id === n.id ? { ...m, x, y } : m))
              }
            />
          ))}
        </div>

        {/* Centered stage content */}
        <div className="stage-center">
          {clip ? (
            /* Clipboard URL detected */
            <div className="clipnote alert">
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                📋 spotted in your clipboard
              </p>
              <h1 style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2rem)",
                fontWeight: 700, letterSpacing: "-0.02em",
                lineHeight: 1.12, margin: "0 0 14px",
              }}>
                Ooh, a link! Want to stash it?
              </h1>
              <div className="clip-url" style={{ marginBottom: 18 }}>{short(clip)}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => { setAddUrl(clip); setClip(null); }}
                >
                  Pin it up 📌
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => { setClip(null); setClipDismissed(true); }}
                >
                  nah, I&rsquo;m just snooping 👀
                </button>
              </div>
            </div>
          ) : (
            /* Normal hero */
            <>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                the design stash · {totalCount} pinned
              </p>
              <h1 style={{
                fontSize: "clamp(1.6rem, 3.6vw, 2.15rem)",
                fontWeight: 700, letterSpacing: "-0.022em",
                lineHeight: 1.1, margin: "0 0 8px",
              }}>
                Found something good?
              </h1>
              <p style={{ fontSize: "0.98em", margin: "0 0 20px", color: "var(--muted-foreground)" }}>
                Pin a link to stash it — or dig through the board around you.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
                <div className="field field-lg" style={{ flex: 1 }}>
                  <span className="ico">
                    {urlMode ? <LinkIcon /> : <SearchIcon />}
                  </span>
                  <input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="paste a link or search…"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!trimmed}
                  className={`btn btn-lg ${urlMode ? "btn-primary" : "btn-outline"}`}
                  style={{ height: 52, flexShrink: 0, opacity: trimmed ? 1 : 0.5 }}
                >
                  {urlMode ? "Stash 📌" : "Search"}
                </button>
              </form>

              <p style={{ fontSize: "0.76em", marginTop: 12, color: "var(--ds-fg-subtle)" }}>
                psst — copy a link and we&rsquo;ll spot it for you.
              </p>

              <div className="stage-cats">
                {CATEGORIES.map(c => (
                  <Link key={c} href={`/search?category=${encodeURIComponent(c)}`} className="chip">
                    {c}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="stage-foot">
        <Link href="/search" className="tertiary-link">
          see the whole stash <ArrowRightIcon />
        </Link>
        <span className="stage-hint">
          drag the pins around · tap anywhere to add a pin
        </span>
      </div>

      {addUrl && (
        <AddResourceModal onClose={() => setAddUrl(null)} initialUrl={addUrl} />
      )}
    </div>
  );
}
