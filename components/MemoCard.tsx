"use client";

import Link from "next/link";
import { hashStr, getTint, getKind } from "@/lib/resource-utils";
import type { Resource } from "@/lib/types";

// Re-export for any existing imports elsewhere
export { hashStr, getTint, getKind };
export { getMark } from "@/lib/resource-utils";

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
    return <div className="memo" style={memoStyle}>{inner}</div>;
  }

  return (
    <Link href={`/resources/${resource.id}`} className="memo" style={memoStyle}>
      {inner}
    </Link>
  );
}
