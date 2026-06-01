"use client";

import { ResourceCard } from "./ResourceCard";
import type { Resource } from "@/lib/types";

interface Props {
  resources: Resource[];
  view?: "gallery" | "list";
}

export function ResourceGrid({ resources, view = "gallery" }: Props) {
  if (resources.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-16 text-center">
        No resources found.
      </p>
    );
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-1">
        {resources.map((r) => (
          <ResourceCard key={r.id} resource={r} view="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} view="gallery" />
      ))}
    </div>
  );
}
