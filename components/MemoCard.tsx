"use client";

import Link from "next/link";
import type { Resource } from "@/lib/types";

const TINTS = [
  "#18181b", "#4f46e5", "#f59e0b", "#5b61e6", "#f56565",
  "#7c3aed", "#f43f5e", "#f97316", "#6e56cf", "#d946ef",
  "#2563eb", "#84cc16", "#ec4899", "#0d9488", "#0ea5e9",
  "#0891b2", "#6246ea", "#6c63ff", "#1a73e8", "#6d28d9",
];

// These values in `source` are legacy routing values, not kinds
const LEGACY_SOURCES = new Set(["web", "api", "extension"]);

export function hashStr(s: string): number {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getTint(resource: Resource): string {
  return TINTS[hashStr(resource.domain ?? resource.id) % TINTS.length];
}

export function getMark(resource: Resource): string {
  return (resource.title ?? resource.domain ?? "?").charAt(0).toUpperCase();
}

function getKind(resource: Resource): string | null {
  // source field stores kind for resources processed after the AI update
  if (resource.source && !LEGACY_SOURCES.has(resource.source)) {
    return resource.source;
  }
  // Fallback: second category
  return resource.categories[1] ?? null;
}

function HandUnderline() {
  return (
    <svg className="hand-ul" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 5.2 C 22 1.5, 42 7.2, 62 4.2 S 100 1.8, 118 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  resource: Resource;
  style?: React.CSSProperties;
  /** Render as a div instead of a Link — use inside DraggablePin */
  noLink?: boolean;
}

export function MemoCard({ resource, style, noLink = false }: Props) {
  const h = hashStr(resource.id);
  const rot = ((h % 9) - 4) * 1.05;
  const tint = getTint(resource);
  const paper = `color-mix(in oklab, ${tint} 19%, #f4ecdb)`;
  const kind = getKind(resource);

  const eyebrowParts = [resource.categories[0], kind].filter(Boolean);

  const memoStyle = {
    "--rot": `${rot}deg`,
    "--paper": paper,
    "--ink": tint,
    ...style,
  } as React.CSSProperties;

  const inner = (
    <>
      <div className="memo-eye">{eyebrowParts.join(" · ") || "Resource"}</div>
      <h3 className="memo-title">{resource.title ?? resource.domain}</h3>
      <HandUnderline />
      <p className="memo-sum">{resource.ai_summary ?? resource.description ?? ""}</p>
      <div className="memo-foot">
        <span className="memo-dom">{resource.domain}</span>
        {kind && <span className="memo-kind">{kind}</span>}
      </div>
    </>
  );

  if (noLink) {
    return (
      <div className="memo" style={memoStyle}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/resources/${resource.id}`} className="memo" style={memoStyle}>
      {inner}
    </Link>
  );
}
