import type { StatMode } from "../components/court-data";
import { track } from "./analytics";

// Shareable stat-mode links: ?mode=career|peak|current on player pages and /rankings.

export const STAT_MODES: readonly StatMode[] = ["career", "peak", "current"];

// The card shown when a link has no mode (unchanged from before mode links existed).
export const DEFAULT_SHARE_MODE: StatMode = "peak";

// Only the exact lowercase values count; anything else falls back to the page's
// usual behavior (the user's saved default, or Career).
export function parseStatMode(value: unknown): StatMode | null {
  const raw = Array.isArray(value) ? value[0] : value;

  return typeof raw === "string" && (STAT_MODES as readonly string[]).includes(raw)
    ? (raw as StatMode)
    : null;
}

// Adds (or replaces) ?mode= on a path or absolute URL, keeping any other params.
export function withModeParam(pathOrUrl: string, mode: StatMode) {
  const isAbsolute = /^https?:\/\//.test(pathOrUrl);
  const url = new URL(pathOrUrl, "https://statcourt.app");

  url.searchParams.set("mode", mode);

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}

// The share card for a player in one mode (also the OG/Twitter preview image).
export function getShareImagePath(canonicalPath: string, mode: StatMode) {
  return `${canonicalPath}/share-image?mode=${mode}`;
}

export function buildXShareUrl({ url, text }: { url: string; text: string }) {
  const params = new URLSearchParams({ text, url });

  return `https://x.com/intent/post?${params.toString()}`;
}

export function buildRedditShareUrl({ url, title }: { url: string; title: string }) {
  const params = new URLSearchParams({ url, title });

  return `https://www.reddit.com/submit?${params.toString()}`;
}

export type ShareMethod = "native" | "copy" | "x" | "reddit" | "download";

// Single hook point for share analytics (PostHog, see app/lib/analytics.ts).
export function trackShare(method: ShareMethod, mode: StatMode, slug: string | null) {
  track("share", { method, mode, slug, page: slug ? "player" : "rankings" });

  if (method === "download") {
    track("share_image_downloaded", { mode, slug });
  }
}

// Writes the URL into the address bar without a navigation, a new history entry, or
// a server request. Next.js keeps useSearchParams in sync with history.replaceState.
export function replaceModeInAddressBar(mode: StatMode) {
  if (typeof window === "undefined") return;

  window.history.replaceState(
    window.history.state,
    "",
    withModeParam(`${window.location.pathname}${window.location.search}${window.location.hash}`, mode),
  );
}
