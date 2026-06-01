"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  view: "gallery" | "list";
}

export function ViewToggle({ view }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (v: "gallery" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
      <button
        onClick={() => setView("gallery")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "gallery" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Gallery view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => setView("list")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}
