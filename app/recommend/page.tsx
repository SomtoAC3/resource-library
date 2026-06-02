"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Recommendations } from "@/components/Recommendations";
import { ScrollToTop } from "@/components/ScrollToTop";

function RecommendContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return (
      <div className="empty-state" style={{ marginTop: 48 }}>
        <div style={{ fontSize: "1.05em", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
          Describe what you&rsquo;re building
        </div>
        <div style={{ fontSize: "0.9em", color: "var(--muted-foreground)" }}>
          e.g. &ldquo;I need inspiration for a fintech onboarding flow&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingTop: 28, paddingBottom: 96 }}>
      <Recommendations query={q} onClose={undefined} />
    </div>
  );
}

export default function RecommendPage() {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div className="search-sticky">
        <div className="container">
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense>
        <RecommendContent />
      </Suspense>

      <ScrollToTop />
    </div>
  );
}
