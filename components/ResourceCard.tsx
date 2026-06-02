"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getTint, getMark, hashStr } from "./MemoCard";
import type { Resource } from "@/lib/types";

interface Props {
  resource: Resource;
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ResourceRow({ resource }: Props) {
  const isProcessing = resource.status === "processing";
  const tint = getTint(resource);
  const mark = getMark(resource);
  const fs = Math.round(36 * 0.5);

  return (
    <Link href={`/resources/${resource.id}`} className="resource-row">
      {/* Favicon */}
      <span
        className="favicon"
        style={{
          width: 36, height: 36, fontSize: fs,
          background: `linear-gradient(150deg, ${tint}, color-mix(in oklab, ${tint} 78%, #000))`,
          borderRadius: Math.max(4, 36 * 0.3),
          flexShrink: 0,
        }}
      >
        {mark}
      </span>

      <div className="resource-row-main">
        <div className="resource-row-top">
          <span className="resource-row-title">
            {isProcessing ? (
              <Skeleton className="h-3.5 w-40 inline-block" />
            ) : (
              resource.title ?? resource.domain
            )}
          </span>
          <span className="resource-row-domain">{resource.domain}</span>
        </div>
        {(resource.ai_summary || resource.description) && (
          <div className="resource-row-summary">
            {resource.ai_summary ?? resource.description}
          </div>
        )}
      </div>

      {resource.categories.length > 0 && (
        <div className="resource-row-cats hidden sm:flex">
          {resource.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="kind-tag" style={{ textTransform: "none", letterSpacing: "0.01em" }}>
              {cat}
            </span>
          ))}
        </div>
      )}

      <span className="resource-row-arrow">
        <ArrowRightIcon />
      </span>
    </Link>
  );
}
