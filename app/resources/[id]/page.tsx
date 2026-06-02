import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RetryButton } from "@/components/RetryButton";
import { MemoCard } from "@/components/MemoCard";
import { ReferenceNotes } from "@/components/ReferenceNotes";
import { ProcessingPoller } from "@/components/ProcessingPoller";
import { getTint, getMark } from "@/lib/resource-utils";
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

async function getRelated(resource: Resource): Promise<Resource[]> {
  const supabase = await createClient();
  if (!resource.categories.length) return [];
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "ready")
    .neq("id", resource.id)
    .contains("categories", resource.categories.slice(0, 1))
    .limit(4);
  return data ?? [];
}

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 5h5v5M19 5l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}


export default async function ResourcePage({ params }: Props) {
  const { id } = await params;
  const resource = await getResource(id);

  if (!resource) notFound();

  const related = await getRelated(resource);
  const isProcessing = resource.status === "processing";
  const image = resource.screenshot_url ?? resource.og_image_url;
  const tint = getTint(resource);
  const mark = getMark(resource);

  return (
    <div className="container fade-in" style={{ maxWidth: 880, paddingTop: 24, paddingBottom: 96 }}>
      {/* Back + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <Link href="/search" className="link-muted" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeftIcon /> Back
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {resource.status === "failed" && <RetryButton resourceId={resource.id} />}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Visit website <ExternalIcon />
          </a>
        </div>
      </div>

      {/* Hero thumbnail */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "2.1 / 1",
        overflow: "hidden",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        marginBottom: 30,
        background: `color-mix(in oklab, ${tint} 18%, #f4ecdb)`,
      }}>
        {isProcessing && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        {!isProcessing && image && (
          <Image
            src={image}
            alt={resource.title ?? resource.domain ?? ""}
            fill
            className="object-cover object-top"
            priority
          />
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 660 }}>
        {/* Domain + kind + type badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
          <span
            className="favicon"
            style={{
              width: 20, height: 20, fontSize: 10,
              background: `linear-gradient(150deg, ${tint}, color-mix(in oklab, ${tint} 78%, #000))`,
              borderRadius: 6,
            }}
          >
            {mark}
          </span>
          <span className="eyebrow" style={{ fontSize: "0.72em" }}>{resource.domain}</span>
          {resource.type === "reference" && (
            <span style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: "0.62em",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: tint,
              color: "#fff",
              padding: "2px 7px",
              borderRadius: 4,
            }}>
              Reference
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          margin: "0 0 18px",
        }}>
          {isProcessing ? <Skeleton className="h-8 w-3/4 inline-block" /> : (resource.title ?? resource.domain)}
        </h1>

        {/* Summary */}
        <div style={{ fontSize: "1.04em", lineHeight: 1.62, marginBottom: 26, color: "var(--muted-foreground)" }}>
          {isProcessing ? (
            <>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : (
            resource.ai_summary ?? resource.description
          )}
        </div>

        {/* Categories */}
        {(resource.categories.length > 0 || isProcessing) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
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
                  className="chip"
                >
                  {cat}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tags */}
        {resource.tags.length > 0 && !isProcessing && (
          <div style={{ fontSize: "0.88em", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {resource.tags.map((tag, i) => (
              <span key={tag}>
                <Link
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="tag-link"
                >
                  #{tag}
                </Link>
                {i < resource.tags.length - 1 && (
                  <span style={{ color: "var(--ds-border-strong)", margin: "0 3px" }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}

        {isProcessing && (
          <>
            <p style={{ fontSize: "0.82em", color: "var(--ds-fg-subtle)", marginTop: 8 }}>
              Processing — this page will update shortly.
            </p>
            <ProcessingPoller resourceId={resource.id} />
          </>
        )}
      </div>

      {/* Reference notes */}
      {!isProcessing && (
        <ReferenceNotes
          resourceId={resource.id}
          initialType={resource.type}
          whyILikeThis={resource.why_i_like_this}
          inspirationNotes={resource.inspiration_notes}
          tint={tint}
        />
      )}

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 56, paddingTop: 36, borderTop: "1px solid var(--border)" }}>
          <div className="sec-head">
            <span className="sec-title" style={{ fontSize: "1em" }}>
              more like this
            </span>
          </div>
          <div className="scatter">
            {related.map((r) => (
              <MemoCard key={r.id} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
