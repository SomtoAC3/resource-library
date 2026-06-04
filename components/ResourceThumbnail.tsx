"use client";

import { useState, useEffect, useRef } from "react";

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
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // After mount, check if the image already completed (preloaded/cached) before
  // React had a chance to attach onLoad/onError.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) setBroken(true);
  }, [currentSrc]);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = () => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 3000);
  };

  const probeUrl = (url: string): Promise<boolean> =>
    new Promise(resolve => {
      const img = new window.Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}/refetch-image`, { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        const valid = await probeUrl(url);
        if (valid) {
          setCurrentSrc(url);
          setBroken(false);
        } else {
          showToast();
        }
      } else {
        showToast();
      }
    } catch {
      showToast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {currentSrc && !broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          onError={() => setBroken(true)}
          onLoad={e => { if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) setBroken(true); }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
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
      {toast && (
        <div className="toast-tr" role="status">
          No thumbnail found for this resource
        </div>
      )}
    </>
  );
}
