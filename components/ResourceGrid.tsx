"use client";

import { MemoCard } from "./MemoCard";
import { ResourceRow } from "./ResourceCard";
import { EmptyState } from "./EmptyState";
import { usePins } from "@/lib/use-pins";
import type { Resource } from "@/lib/types";

interface Props {
  resources: Resource[];
  view?: "gallery" | "list";
}

export function ResourceGrid({ resources, view = "gallery" }: Props) {
  const { isPinned, addPin, removePin } = usePins();

  if (resources.length === 0) {
    return <EmptyState />;
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
        <MemoCard
          key={r.id}
          resource={r}
          pinned={isPinned(r.id)}
          onTogglePin={() => isPinned(r.id) ? removePin(r.id) : addPin(r.id)}
        />
      ))}
    </div>
  );
}
