"use client";

import { useRouter } from "next/navigation";

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="link-muted"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      onClick={() => router.back()}
    >
      <ArrowLeftIcon /> Back
    </button>
  );
}
