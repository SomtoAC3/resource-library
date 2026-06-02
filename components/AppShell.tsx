"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AddResourceModal } from "./AddResourceModal";
import { HoverEffect } from "./HoverEffect";

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);

  return (
    <div className="shell">
      <HoverEffect />
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="wordmark" aria-label="stash — home">
            <span className="glyph">S</span>
            stash
          </Link>
          <div className="topbar-spacer" />
          <button type="button" className="btn btn-outline btn-sm" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add resource
          </button>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      {addOpen && <AddResourceModal onClose={closeAdd} />}
    </div>
  );
}
