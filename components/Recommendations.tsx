"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTint, getMark, getKind } from "@/lib/resource-utils";
import type { Resource } from "@/lib/types";

interface Recommendation {
  resource: Resource;
  explanation: string;
  visitFirst: boolean;
}

interface RecoResult {
  recommendations: Recommendation[];
  suggestedCategories: string[];
  note: string;
}

// Skeleton card matching memo dimensions
function SkeletonCard() {
  const colors = ["#e8d5f5", "#cfe8f3", "#d5ecd4", "#f5e8cc", "#f3d5d5"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <div className="memo" style={{ "--paper": color, "--rot": "0deg", "--ink": "#888" } as React.CSSProperties}>
      <div className="sk" style={{ height: 10, width: "60%", borderRadius: 4, marginBottom: 10 }} />
      <div className="sk" style={{ height: 18, width: "85%", borderRadius: 4, marginBottom: 6 }} />
      <div className="sk" style={{ height: 18, width: "70%", borderRadius: 4, marginBottom: 14 }} />
      <div className="sk" style={{ height: 10, width: "100%", borderRadius: 4, marginBottom: 6 }} />
      <div className="sk" style={{ height: 10, width: "80%", borderRadius: 4, marginBottom: 6 }} />
      <div className="sk" style={{ height: 10, width: "60%", borderRadius: 4 }} />
    </div>
  );
}

function RecoCard({ rec }: { rec: Recommendation }) {
  const { resource, explanation, visitFirst } = rec;
  const tint = getTint(resource);
  const mark = getMark(resource);
  const kind = getKind(resource);
  const paper = `color-mix(in oklab, ${tint} 19%, #f4ecdb)`;

  return (
    <Link
      href={`/resources/${resource.id}`}
      className="memo"
      style={{ "--rot": "0deg", "--paper": paper, "--ink": tint } as React.CSSProperties}
    >
      {visitFirst && (
        <span style={{
          position: "absolute", top: 8, right: 8,
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: "0.55em", letterSpacing: "0.06em", textTransform: "uppercase",
          background: tint, color: "#fff",
          padding: "2px 6px", borderRadius: 4,
        }}>
          Best match
        </span>
      )}
      <div className="memo-eye">
        {[resource.categories[0], kind].filter(Boolean).join(" · ") || "Resource"}
      </div>
      <h3 className="memo-title">{resource.title ?? resource.domain}</h3>
      <svg className="hand-ul" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 5.2 C 22 1.5, 42 7.2, 62 4.2 S 100 1.8, 118 4.8"
          fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {/* Show AI explanation in place of generic summary */}
      <p className="memo-sum">{explanation}</p>
      <div className="memo-foot">
        <span className="memo-dom">{resource.domain}</span>
        {kind && <span className="memo-kind">{kind}</span>}
      </div>
    </Link>
  );
}

interface Props {
  query: string;
  onClose: () => void;
}

export function Recommendations({ query, onClose }: Props) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<RecoResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.error) { setErrorMsg(data.error); setStatus("error"); return; }
        setResult(data);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) { setErrorMsg("AI recommendations are temporarily unavailable."); setStatus("error"); }
      });

    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="fade-in" style={{ marginTop: 32, textAlign: "left" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
            ✦ AI recommendations
          </span>
          <p style={{ fontSize: "0.84em", color: "var(--muted-foreground)", margin: 0 }}>
            {status === "loading" ? "Searching the stash…" : status === "success" && result?.note ? result.note : ""}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          aria-label="Close recommendations"
        >
          ✕
        </button>
      </div>

      {/* Loading skeletons */}
      {status === "loading" && (
        <div className="scatter">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div style={{
          padding: "20px 24px",
          background: "var(--secondary)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          fontSize: "0.9em",
          color: "var(--muted-foreground)",
        }}>
          {errorMsg || "AI recommendations are temporarily unavailable."}
        </div>
      )}

      {/* Results */}
      {status === "success" && result && (
        <>
          <div className="scatter">
            {result.recommendations.map((rec, i) => (
              <RecoCard key={rec.resource.id ?? i} rec={rec} />
            ))}
          </div>

          {/* Suggested categories */}
          {result.suggestedCategories.length > 0 && (
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <span style={{ fontSize: "0.78em", color: "var(--ds-fg-subtle)" }}>Also explore:</span>
              {result.suggestedCategories.map(c => (
                <Link key={c} href={`/search?category=${encodeURIComponent(c)}`} className="chip chip-sm">
                  {c}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
