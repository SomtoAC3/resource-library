import { createClient } from "./supabase/server";
import { extractMetadata, type ExtractedMetadata } from "./metadata";
import { captureScreenshot } from "./screenshot";
import { categorizeResource } from "./ai";

function logError(label: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error(`[processResource:${label}] ${message}`);
  if (stack) console.error(stack);
}

export async function processResource(id: string, url: string): Promise<void> {
  const supabase = await createClient();

  // Metadata and screenshot are independent — run in parallel, fail independently
  const [metadataResult, screenshotResult] = await Promise.allSettled([
    extractMetadata(url),
    captureScreenshot(url),
  ]);

  let metadata: ExtractedMetadata | null = null;
  if (metadataResult.status === "fulfilled") {
    metadata = metadataResult.value;
  } else {
    logError("extractMetadata", metadataResult.reason);
  }

  let screenshot: string | null = null;
  if (screenshotResult.status === "fulfilled") {
    screenshot = screenshotResult.value;
  } else {
    logError("captureScreenshot", screenshotResult.reason);
  }

  // AI categorization — failure does not abort; resource still becomes ready
  let categories: string[] = [];
  let tags: string[] = [];
  let ai_summary: string | null = null;

  let aiName: string | null = null;
  let aiKind: string | null = null;

  try {
    const ai = await categorizeResource({
      url,
      title: metadata?.title ?? null,
      description: metadata?.description ?? null,
      domain: metadata?.domain ?? new URL(url).hostname.replace(/^www\./, ""),
    });
    aiName = ai.name;
    aiKind = ai.kind;
    categories = ai.categories;
    tags = ai.tags;
    ai_summary = ai.ai_summary;
  } catch (err) {
    logError("categorizeResource", err);
  }

  // Status is ready if metadata succeeded; failed only if metadata itself failed
  const status = metadata !== null ? "ready" : "failed";

  const { error: updateError } = await supabase
    .from("resources")
    .update({
      // Prefer AI-generated clean name; fall back to og:title / <title>
      title: aiName ?? metadata?.title ?? null,
      description: metadata?.description ?? null,
      og_image_url: metadata?.og_image_url ?? null,
      favicon_url: metadata?.favicon_url ?? null,
      domain: metadata?.domain ?? null,
      screenshot_url: screenshot ?? metadata?.og_image_url ?? null,
      // Repurpose source field to store resource kind (Library, Gallery, Tool …)
      source: aiKind ?? "web",
      categories,
      tags,
      ai_summary,
      status,
    })
    .eq("id", id);

  if (updateError) {
    console.error(`[processResource:supabase:update:${status}] code=${updateError.code} message=${updateError.message} detail=${updateError.details} hint=${updateError.hint}`);
  }
}
