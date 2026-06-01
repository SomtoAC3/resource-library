"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  resourceId: string;
}

export function RetryButton({ resourceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resources/${resourceId}/retry`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Retry failed");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={handleRetry}
        disabled={loading}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
        {loading ? "Retrying…" : "Retry Processing"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
