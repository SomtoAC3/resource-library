import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { RetryButton } from "@/components/RetryButton";
import type { Resource } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getResource(id: string): Promise<Resource | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

export default async function ResourcePage({ params }: Props) {
  const { id } = await params;
  const resource = await getResource(id);

  if (!resource) notFound();

  const isProcessing = resource.status === "processing";
  const image = resource.screenshot_url ?? resource.og_image_url;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back
        </Link>
        <div className="flex items-center gap-2">
          {resource.status === "failed" && (
            <RetryButton resourceId={resource.id} />
          )}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Visit Website
            <ExternalLink size={13} className="ml-1.5" />
          </a>
        </div>
      </div>

      {/* Screenshot */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-muted border border-border/50 mb-8"
        style={{ aspectRatio: "2 / 1" }}
      >
        {isProcessing && <Skeleton className="absolute inset-0 rounded-none" />}
        {!isProcessing && image && (
          <Image
            src={image}
            alt={resource.title ?? resource.domain ?? ""}
            fill
            className="object-cover object-top"
            priority
          />
        )}
        {!isProcessing && !image && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No preview available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl space-y-5">
        {/* Domain */}
        <div className="flex items-center gap-2">
          {resource.favicon_url && (
            <Image
              src={resource.favicon_url}
              alt=""
              width={16}
              height={16}
              className="rounded-sm shrink-0"
              unoptimized
            />
          )}
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {resource.domain}
          </span>
        </div>

        {/* Title */}
        <div className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.015em]">
          {isProcessing ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            resource.title ?? resource.domain
          )}
        </div>

        {/* Summary / description */}
        {(resource.ai_summary || resource.description || isProcessing) && (
          <div className="text-[15px] text-muted-foreground leading-relaxed">
            {isProcessing ? (
              <>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </>
            ) : (
              resource.ai_summary ?? resource.description
            )}
          </div>
        )}

        {/* Categories */}
        {(resource.categories.length > 0 || isProcessing) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {isProcessing ? (
              <>
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </>
            ) : (
              resource.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/search?category=${encodeURIComponent(cat)}`}
                  className="px-3.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
                >
                  {cat}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tags */}
        {(resource.tags.length > 0 || isProcessing) && (
          <div className="text-sm text-muted-foreground pt-1">
            {isProcessing ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              resource.tags.map((tag, i) => (
                <span key={tag}>
                  <Link
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {tag}
                  </Link>
                  {i < resource.tags.length - 1 && (
                    <span className="mx-1.5 text-border">·</span>
                  )}
                </span>
              ))
            )}
          </div>
        )}

        {isProcessing && (
          <p className="text-xs text-muted-foreground pt-1">
            Processing — this page will update shortly.
          </p>
        )}
      </div>
    </div>
  );
}
