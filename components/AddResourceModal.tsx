"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Grabbing the page",
  "Snapping a preview",
  "Reading it over",
  "Filing it on the board",
];

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </svg>
  );
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface Props {
  onClose: () => void;
  initialUrl?: string;
}

export function AddResourceModal({ onClose, initialUrl = "" }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [type, setType] = useState<"resource" | "reference">("resource");
  const [whyILikeThis, setWhyILikeThis] = useState("");
  const [inspirationNotes, setInspirationNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  const trimmed = url.trim();
  const urlMode = isUrl(trimmed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || !urlMode) return;

    setLoading(true);
    setError(null);
    setStep(0);

    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), 620 * (i + 1))
    );

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          type,
          ...(type === "reference" && whyILikeThis.trim() ? { why_i_like_this: whyILikeThis.trim() } : {}),
          ...(type === "reference" && inspirationNotes.trim() ? { inspiration_notes: inspirationNotes.trim() } : {}),
        }),
      });
      const data = await res.json();
      timers.forEach(clearTimeout);

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        setStep(-1);
        return;
      }

      onClose();
      router.push(`/resources/${data.id}`);
    } catch {
      timers.forEach(clearTimeout);
      setError("Network error — please try again.");
      setLoading(false);
      setStep(-1);
    }
  };

  const host = trimmed ? trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] : "";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "16px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: "0.92em" }}>
            {loading ? (
              <span style={{ color: "var(--ds-accent)" }}><SparklesIcon /></span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ds-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
            {loading ? "Pinning it up…" : type === "reference" ? "Add a reference" : "Add a resource"}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: 30, padding: 0, justifyContent: "center" }}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-pad">
          {loading ? (
            <>
              {/* URL chip */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: "var(--secondary)",
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) * 0.7)",
                marginBottom: 18,
              }}>
                <span style={{ color: "var(--ds-fg-subtle)", flexShrink: 0 }}><LinkIcon /></span>
                <span style={{
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: "0.84em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {host}
                </span>
              </div>

              {/* Steps */}
              <div className="add-steps">
                {STEPS.map((label, i) => {
                  const state = step > i ? "done" : step === i ? "active" : "todo";
                  return (
                    <div key={label} className="add-step" data-state={state}>
                      <span className="add-step-dot">
                        {state === "done" && <CheckIcon />}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Type toggle */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {(["resource", "reference"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      fontSize: "0.82em",
                      fontWeight: 500,
                      cursor: "pointer",
                      background: type === t ? "var(--foreground)" : "transparent",
                      color: type === t ? "var(--background)" : "var(--muted-foreground)",
                      transition: "all 0.15s",
                    }}
                  >
                    {t === "resource" ? "Resource" : "Reference"}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "0.9em", color: "var(--muted-foreground)", marginTop: 0, marginBottom: 14 }}>
                {type === "reference"
                  ? "A product, app, or brand that inspires you — something you want to learn from."
                  : "Paste any URL — we’ll fetch a preview, write a summary, and file it under the right categories."}
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", gap: 8, marginBottom: type === "reference" ? 14 : 0 }}>
                  <div className="field field-md" style={{ flex: 1 }}>
                    <input
                      ref={inputRef}
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(null); }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = (e.clipboardData?.getData("text") ?? "").trim();
                        setUrl(text); setError(null);
                      }}
                      placeholder="https://example.com"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      inputMode="url"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!urlMode}
                    style={{ opacity: urlMode ? 1 : 0.4, height: 40 }}
                  >
                    Stash it
                  </button>
                </div>

                {type === "reference" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78em", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ds-fg-subtle)", marginBottom: 6 }}>
                        Why I Like This
                      </label>
                      <textarea
                        value={whyILikeThis}
                        onChange={e => setWhyILikeThis(e.target.value)}
                        placeholder="Motion, Typography, Product polish…"
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          background: "var(--secondary)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "0.88em",
                          lineHeight: 1.6,
                          resize: "none",
                          fontFamily: "inherit",
                          color: "var(--foreground)",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78em", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ds-fg-subtle)", marginBottom: 6 }}>
                        Inspiration Notes
                      </label>
                      <textarea
                        value={inspirationNotes}
                        onChange={e => setInspirationNotes(e.target.value)}
                        placeholder="Subtle motion, excellent onboarding, trust signals…"
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          background: "var(--secondary)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "0.88em",
                          lineHeight: 1.6,
                          resize: "none",
                          fontFamily: "inherit",
                          color: "var(--foreground)",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                )}
              </form>

              {error && (
                <p style={{ marginTop: 10, fontSize: "0.82em", color: "var(--destructive)" }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
