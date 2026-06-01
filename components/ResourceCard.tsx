"use client";

import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Resource } from "@/lib/types";

interface Props {
  resource: Resource;
  view?: "gallery" | "list";
}

export function ResourceCard({ resource, view = "gallery" }: Props) {
  const isProcessing = resource.status === "processing";
  const isFailed = resource.status === "failed";
  const image = resource.screenshot_url ?? resource.og_image_url;

  if (view === "list") {
    return (
      <Link
        href={`/resources/${resource.id}`}
        className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-card hover:bg-secondary/60 transition-colors duration-150"
      >
        <div className="relative w-[72px] h-[46px] rounded-lg overflow-hidden shrink-0 bg-muted">
          {image && !isProcessing && (
            <Image
              src={image}
              alt={resource.title ?? resource.domain ?? ""}
              fill
              className="object-cover object-top"
            />
          )}
          {isProcessing && <Skeleton className="absolute inset-0 rounded-none" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate leading-snug">
            {isProcessing ? (
              <Skeleton className="h-3.5 w-40 inline-block" />
            ) : (
              resource.title ?? resource.domain
            )}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground mt-0.5 truncate">
            {resource.domain}
          </p>
        </div>

        {resource.categories.length > 0 && (
          <div className="hidden sm:flex gap-1.5 shrink-0">
            {resource.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/resources/${resource.id}`}
      className="group block rounded-2xl bg-card overflow-hidden shadow-[0_1px_4px_rgb(0,0,0,0.07),0_1px_2px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.11)] hover:-translate-y-[3px] transition-all duration-200"
    >
      {/* Screenshot */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {isFailed && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            No preview
          </div>
        )}
        {isProcessing && <Skeleton className="absolute inset-0 rounded-none" />}
        {image && !isProcessing && (
          <Image
            src={image}
            alt={resource.title ?? resource.domain ?? ""}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-2">
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
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground truncate">
            {resource.domain}
          </span>
        </div>

        <p className="text-[15px] font-semibold leading-snug line-clamp-2 text-foreground">
          {isProcessing ? (
            <>
              <Skeleton className="h-4 w-full mb-1 inline-block" />
              <Skeleton className="h-4 w-3/4 inline-block" />
            </>
          ) : (
            resource.title ?? resource.domain
          )}
        </p>
      </div>
    </Link>
  );
}
