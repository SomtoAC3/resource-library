"use client";

import { MemoCard } from "./MemoCard";
import { ResourceRow } from "./ResourceCard";
import { EmptyState } from "./EmptyState";
import { useBoard } from "@/lib/use-board";
import type { Resource } from "@/lib/types";

interface Props {
  resources: Resource[];
  view?: "gallery" | "list";
}

export function ResourceGrid({ resources, view = "gallery" }: Props) {
  const { isOnHomepage, pin, unpin } = useBoard();

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
          pinned={isOnHomepage(r.id)}
          onTogglePin={() => isOnHomepage(r.id) ? unpin(r.id) : pin(r.id)}
        />
      ))}
    </div>
  );
}
