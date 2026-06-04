"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  resourceId: string;
  src: string | null;
  alt: string;
}

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

export function ResourceThumbnail({ resourceId, src, alt }: Props) {
  const [broken, setBroken] = useState(!src);
  const [loading, setLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}/refetch-image`, { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        setCurrentSrc(url);
        setBroken(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {currentSrc && !broken && (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className="object-cover object-top"
          priority
          onError={() => setBroken(true)}
        />
      )}
      {broken && (
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          title="Reload thumbnail"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            cursor: loading ? "wait" : "pointer",
            color: "var(--muted-foreground)",
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshIcon />
        </button>
      )}
    </>
  );
}
