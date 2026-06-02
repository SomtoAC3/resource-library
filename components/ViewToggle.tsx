"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  view: "gallery" | "list";
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
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
    <div style={{
      display: "flex",
      background: "var(--secondary)",
      border: "1px solid var(--border)",
      borderRadius: "calc(var(--radius) * 0.6)",
      padding: 2,
    }}>
      {(["gallery", "list"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          title={v === "gallery" ? "Gallery" : "List"}
          style={{
            display: "grid",
            placeItems: "center",
            width: 32,
            height: 28,
            cursor: "pointer",
            border: 0,
            borderRadius: "calc(var(--radius) * 0.45)",
            background: view === v ? "var(--card)" : "transparent",
            color: view === v ? "var(--foreground)" : "var(--ds-fg-subtle)",
            boxShadow: view === v ? "var(--ds-shadow-sm)" : "none",
            transition: "all 0.13s",
          }}
        >
          {v === "gallery" ? <GridIcon /> : <ListIcon />}
        </button>
      ))}
    </div>
  );
}
