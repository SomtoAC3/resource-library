"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProcessingPoller({ resourceId }: { resourceId: string }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/resources/${resourceId}`);
        const data = await res.json();
        if (data.status !== "processing") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [resourceId, router]);

  return null;
}
