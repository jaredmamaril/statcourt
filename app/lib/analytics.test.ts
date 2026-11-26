import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPlayerSearchQuery,
  loadAnalytics,
  POSTHOG_CONFIG,
  resetAnalyticsForTests,
  track,
  trackPageview,
} from "./analytics";
import { trackShare } from "./share";

function fakePostHog() {
  const posthog = { init: vi.fn(), capture: vi.fn() };

  return { posthog, importPostHog: vi.fn(async () => ({ default: posthog })) };
}

function setDoNotTrack(value: string | null) {
  Object.defineProperty(navigator, "doNotTrack", { value, configurable: true });
}

beforeEach(() => {
  resetAnalyticsForTests();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
  setDoNotTrack(null);
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("analytics helper", () => {
  it("queues events before PostHog loads, then sends them with the right names", async () => {
    const { posthog, importPostHog } = fakePostHog();

    track("stat_mode_changed", { from: "career", to: "peak", page: "player", slug: "lamelo-ball" });
    expect(posthog.capture).not.toHaveBeenCalled();

    await loadAnalytics(importPostHog);
    track("compare_added", { slot: "left", slug: "lamelo-ball", page: "player" });

    expect(posthog.capture.mock.calls).toEqual([
      ["stat_mode_changed", { from: "career", to: "peak", page: "player", slug: "lamelo-ball" }],
      ["compare_added", { slot: "left", slug: "lamelo-ball", page: "player" }],
    ]);
  });

  it("initializes PostHog through the proxy, cookieless, with nothing autocaptured", async () => {
    const { posthog, importPostHog } = fakePostHog();

    await loadAnalytics(importPostHog);

    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test_key",
      expect.objectContaining({
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        cookieless_mode: "always",
        person_profiles: "never",
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        respect_dnt: true,
      }),
    );
    expect(POSTHOG_CONFIG.autocapture).toBe(false);
  });

  it("does nothing without a key (e.g. in CI)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { posthog, importPostHog } = fakePostHog();

    track("share", { method: "copy", mode: "peak", slug: "lamelo-ball", page: "player" });
    await loadAnalytics(importPostHog);
    track("share", { method: "copy", mode: "peak", slug: "lamelo-ball", page: "player" });

    expect(importPostHog).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("does nothing when PostHog is blocked or fails to load", async () => {
    const importPostHog = vi.fn(async () => {
      throw new TypeError("Failed to fetch dynamically imported module");
    });

    track("share", { method: "x", mode: "current", slug: "lamelo-ball", page: "player" });

    await expect(loadAnalytics(importPostHog)).resolves.toBeUndefined();
    expect(() =>
      track("share", { method: "x", mode: "current", slug: "lamelo-ball", page: "player" }),
    ).not.toThrow();
  });

  it("never loads PostHog when Do Not Track is on", async () => {
    setDoNotTrack("1");
    const { posthog, importPostHog } = fakePostHog();

    track("favorite_toggled", { slug: "lamelo-ball", favorited: true, page: "player" });
    await loadAnalytics(importPostHog);

    expect(importPostHog).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("sends a $pageview with the URL, UTM params and the link's mode", async () => {
    const { posthog, importPostHog } = fakePostHog();

    window.history.replaceState(
      null,
      "",
      "/players/lamelo-ball?mode=peak&utm_source=reddit&utm_medium=social&utm_campaign=launch",
    );
    trackPageview();
    await loadAnalytics(importPostHog);

    expect(posthog.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: `${window.location.origin}/players/lamelo-ball?mode=peak&utm_source=reddit&utm_medium=social&utm_campaign=launch`,
      path: "/players/lamelo-ball",
      link_mode: "peak",
      utm_source: "reddit",
      utm_medium: "social",
      utm_campaign: "launch",
    });
  });

  it("sends share events from trackShare, plus share_image_downloaded for downloads", async () => {
    const { posthog, importPostHog } = fakePostHog();

    await loadAnalytics(importPostHog);
    trackShare("copy", "peak", "lamelo-ball");
    trackShare("download", "current", "lamelo-ball");
    trackShare("reddit", "career", null);

    expect(posthog.capture.mock.calls).toEqual([
      ["share", { method: "copy", mode: "peak", slug: "lamelo-ball", page: "player" }],
      ["share", { method: "download", mode: "current", slug: "lamelo-ball", page: "player" }],
      ["share_image_downloaded", { mode: "current", slug: "lamelo-ball" }],
      ["share", { method: "reddit", mode: "career", slug: null, page: "rankings" }],
    ]);
  });

  it("keeps a search query only when it matched a player", () => {
    expect(getPlayerSearchQuery("  LaMelo ", 1)).toBe("lamelo");
    expect(getPlayerSearchQuery("john smith 555-0100", 0)).toBeUndefined();
    expect(getPlayerSearchQuery("a".repeat(60), 3)).toHaveLength(40);
  });
});
