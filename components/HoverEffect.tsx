"use client";

import { useEffect } from "react";

const HOVER_COLORS = [
  "#5b61e6", "#2563eb", "#0ea5e9", "#0d9488", "#16a34a",
  "#f59e0b", "#ea580c", "#e11d48", "#db2777", "#7c3aed",
];

function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  const expanded = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(expanded, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#2b2620" : "#ffffff";
}

export function HoverEffect() {
  useEffect(() => {
    let last: string | null = null;

    const fill = (el: HTMLElement) => {
      const pool = HOVER_COLORS.filter((c) => c !== last);
      const c = pool[Math.floor(Math.random() * pool.length)];
      last = c;
      el.style.background = c;
      el.style.borderColor = c;
      el.style.color = contrastText(c);
    };

    const reset = (el: HTMLElement) => {
      el.style.background = "";
      el.style.borderColor = "";
      el.style.color = "";
    };

    const over = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest?.(".btn, .chip") as HTMLElement | null;
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget as Node))) return;
      fill(el);
    };

    const out = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest?.(".btn, .chip") as HTMLElement | null;
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget as Node))) return;
      reset(el);
    };

    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return null;
}
