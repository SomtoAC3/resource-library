"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HoverEffect } from "./HoverEffect";

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="shell">
      <HoverEffect />

      {/* Centered brand logo — no nav bar */}
      <div className="brandbar">
        <Link href="/" className="brand-logo" aria-label="stash — home">
          {/* Plain img — no width attr, so browser never stretches it */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stash-logo.png" alt="stash" style={{ height: 56, width: "auto", display: "block" }} />
        </Link>
      </div>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
