import type { Resource } from "./types";

const TINTS = [
  "#18181b", "#4f46e5", "#f59e0b", "#5b61e6", "#f56565",
  "#7c3aed", "#f43f5e", "#f97316", "#6e56cf", "#d946ef",
  "#2563eb", "#84cc16", "#ec4899", "#0d9488", "#0ea5e9",
  "#0891b2", "#6246ea", "#6c63ff", "#1a73e8", "#6d28d9",
];

const LEGACY_SOURCES = new Set(["web", "api", "extension"]);

export function hashStr(s: string): number {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getTint(resource: Resource): string {
  return TINTS[hashStr(resource.domain ?? resource.id) % TINTS.length];
}

export function getMark(resource: Resource): string {
  return (resource.title ?? resource.domain ?? "?").charAt(0).toUpperCase();
}

export function getKind(resource: Resource): string | null {
  if (resource.source && !LEGACY_SOURCES.has(resource.source)) {
    return resource.source;
  }
  return resource.categories[1] ?? null;
}
