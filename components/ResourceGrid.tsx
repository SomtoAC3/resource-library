"use client";

import { MemoCard } from "./MemoCard";
import { ResourceRow } from "./ResourceCard";
import type { Resource } from "@/lib/types";

interface Props {
  resources: Resource[];
  view?: "gallery" | "list";
}

export function ResourceGrid({ resources, view = "gallery" }: Props) {
  if (resources.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: "1.6em", marginBottom: 6 }}>¯\_(ツ)_/¯</div>
        <div style={{ fontSize: "1.02em", color: "var(--muted-foreground)", marginBottom: 4 }}>
          Nothing pinned here yet.
        </div>
        <div style={{ fontSize: "0.9em", color: "var(--ds-fg-subtle)" }}>
          Try another tag — or paste a link to stash one.
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="resource-list">
        {resources.map((r) => (
          <ResourceRow key={r.id} resource={r} />
        ))}
      </div>
    );
  }

  return (
    <div className="scatter">
      {resources.map((r) => (
        <MemoCard key={r.id} resource={r} />
      ))}
    </div>
  );
}
