"use client";

import Link from "next/link";
import Image from "next/image";
import { HoverEffect } from "./HoverEffect";

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="shell">
      <HoverEffect />

      {/* Centered brand logo — no nav bar */}
      <div className="brandbar">
        <Link href="/" className="brand-logo" aria-label="stash — home">
          <Image
            src="/stash-logo.png"
            alt="stash"
            height={56}
            width={160}
            style={{ height: 56, width: "auto", display: "block" }}
            priority
          />
        </Link>
      </div>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
