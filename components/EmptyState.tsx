"use client";

import { useState } from "react";
import { AddResourceModal } from "./AddResourceModal";

export function EmptyState() {
  const [open, setOpen] = useState(false);

  return (
    <div className="empty-state">
      <div style={{ fontSize: "2em", marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: "1.05em", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
        Nothing here yet
      </div>
      <div style={{ fontSize: "0.9em", color: "var(--muted-foreground)", marginBottom: 24 }}>
        Try a different search or category — or add the first one yourself.
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Stash a resource
      </button>

      {open && <AddResourceModal onClose={() => setOpen(false)} />}
    </div>
  );
}
