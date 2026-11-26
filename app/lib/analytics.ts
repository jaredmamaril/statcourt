import type { StatMode } from "../components/court-data";

// Product analytics (PostHog). One typed module so event names and properties can't
// drift. Every function is safe to call anywhere: without NEXT_PUBLIC_POSTHOG_KEY (e.g.
// in CI), with Do Not Track on, or when an ad blocker stops PostHog from loading, calls
// do nothing.
//
// Privacy: cookieless mode (nothing stored on the device; unique visitors are counted
// with a daily server-side hash), no person profiles or identify(), no autocapture, no
// session replay or surveys. Events only carry what's listed in AnalyticsEvents.
//
// PostHog loads after the page is interactive (see AnalyticsProvider); events fired
// before that are queued and sent once it's ready.

export type AnalyticsPage = "player" | "rankings";

export type AnalyticsEvents = {
  $pageview: {
    $current_url: string;
    path: string;
    // ?mode= the page was opened with, e.g. from a shared link.
    link_mode: StatMode | null;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  share: {
    method: "native" | "copy" | "x" | "reddit" | "download";
    mode: StatMode;
    slug: string | null;
    page: AnalyticsPage;
  };
  share_image_downloaded: { mode: StatMode; slug: string | null };
  stat_mode_changed: {
    from: StatMode;
    to: StatMode;
    page: AnalyticsPage;
    slug?: string | null;
  };
  player_search: {
    surface: "players" | "rankings" | "court_picker" | "lineup_picker" | "community";
    query_length: number;
    result_count: number;
    // Only sent when the search matched at least one player (so it's a player name).
    query?: string;
  };
  compare_added: { slot: "left" | "right"; slug: string; page: "player" | "players" | "court" };
  favorite_toggled: { slug: string; favorited: boolean; page: "player" | "players" };
  lineup_built: { source: "saved" | "updated"; mode: StatMode; player_count: number };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

const MAX_QUEUED_EVENTS = 50;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

let client: PostHogClient | null = null;
let status: "idle" | "loading" | "ready" | "disabled" = "idle";
let queue: { event: string; properties: Record<string, unknown> }[] = [];

function getKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || null;
}

function hasDoNotTrack() {
  if (typeof navigator === "undefined") return false;

  const dnt =
    navigator.doNotTrack ??
    (window as Window & { doNotTrack?: string }).doNotTrack ??
    (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack;

  return dnt === "1" || dnt === "yes";
}

export function isAnalyticsEnabled() {
  return status !== "disabled" && getKey() !== null && !hasDoNotTrack();
}

export function track<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEvents[E],
) {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;

  const payload = properties as Record<string, unknown>;

  if (client) {
    try {
      client.capture(event, payload);
    } catch {
      // Analytics must never break the page.
    }

    return;
  }

  if (queue.length < MAX_QUEUED_EVENTS) queue.push({ event, properties: payload });
}

// The $pageview for the current URL, with UTM params and the shared ?mode, read now so
// a queued pageview keeps the URL it happened on.
export function trackPageview() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const utm = Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = url.searchParams.get(key);

      return value ? [[key, value.slice(0, 200)]] : [];
    }),
  );
  const mode = url.searchParams.get("mode");

  track("$pageview", {
    $current_url: url.toString(),
    path: url.pathname,
    link_mode: mode === "career" || mode === "peak" || mode === "current" ? mode : null,
    ...utm,
  });
}

export const POSTHOG_CONFIG = {
  // Same-origin reverse proxy (next.config.ts rewrites), so ad blockers don't drop events.
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  cookieless_mode: "always",
  person_profiles: "never",
  // Pageviews are sent by AnalyticsProvider for real navigations only (a ?mode toggle
  // with history.replaceState isn't a new page).
  capture_pageview: false,
  capture_pageleave: true,
  autocapture: false,
  capture_heatmaps: false,
  capture_dead_clicks: false,
  capture_performance: false,
  disable_session_recording: true,
  disable_surveys: true,
  disable_web_experiments: true,
  disable_external_dependency_loading: true,
  advanced_disable_flags: true,
  respect_dnt: true,
} as const;

// Loads PostHog (once). Called by AnalyticsProvider when the page is idle.
export async function loadAnalytics(
  importPostHog: () => Promise<{ default: unknown }> = () =>
    import("posthog-js/dist/module.slim"),
) {
  const key = getKey();

  if (status !== "idle" || typeof window === "undefined") return;

  if (!key || hasDoNotTrack()) {
    status = "disabled";
    queue = [];
    return;
  }

  status = "loading";

  try {
    const posthog = (await importPostHog()).default as PostHogClient & {
      init: (key: string, config: Record<string, unknown>) => unknown;
    };

    posthog.init(key, { ...POSTHOG_CONFIG });
    client = posthog;
    status = "ready";

    const pending = queue;

    queue = [];
    pending.forEach(({ event, properties }) => {
      try {
        posthog.capture(event, properties);
      } catch {
        // Ignore: analytics must never break the page.
      }
    });
  } catch {
    // Blocked or failed to load: stop queuing and do nothing from now on.
    status = "disabled";
    queue = [];
  }
}

// Test helper: resets the module state between tests.
export function resetAnalyticsForTests() {
  client = null;
  status = "idle";
  queue = [];
}

// Query text for player_search: only when it matched a player (so it's a player
// name), trimmed, lowercased and capped.
export function getPlayerSearchQuery(query: string, resultCount: number) {
  const normalized = query.trim().toLowerCase().slice(0, 40);

  return resultCount > 0 && normalized.length > 0 ? normalized : undefined;
}
