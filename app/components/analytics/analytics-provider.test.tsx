import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/players/lamelo-ball",
  trackPageview: vi.fn(),
  loadAnalytics: vi.fn(async () => {}),
}));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("../../lib/analytics", () => ({
  trackPageview: mocks.trackPageview,
  loadAnalytics: mocks.loadAnalytics,
}));

beforeEach(() => {
  mocks.pathname = "/players/lamelo-ball";
  mocks.trackPageview.mockClear();
  mocks.loadAnalytics.mockClear();
});

describe("AnalyticsProvider", () => {
  it("sends one $pageview per real navigation, not for a ?mode toggle", async () => {
    const { AnalyticsProvider } = await import("./analytics-provider");
    const { rerender } = render(<AnalyticsProvider />);

    expect(mocks.trackPageview).toHaveBeenCalledTimes(1);

    // The stat mode toggle: history.replaceState on the same path.
    window.history.replaceState(window.history.state, "", "/players/lamelo-ball?mode=peak");
    rerender(<AnalyticsProvider />);
    window.history.replaceState(window.history.state, "", "/players/lamelo-ball?mode=current");
    rerender(<AnalyticsProvider />);

    expect(mocks.trackPageview).toHaveBeenCalledTimes(1);

    // A real navigation to another page.
    mocks.pathname = "/rankings";
    rerender(<AnalyticsProvider />);

    expect(mocks.trackPageview).toHaveBeenCalledTimes(2);
  });

  it("loads PostHog only after the page has loaded, when the browser is idle", async () => {
    const idleCallbacks: (() => void)[] = [];

    window.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      idleCallbacks.push(() => callback({} as IdleDeadline));
      return 1;
    }) as never;
    window.cancelIdleCallback = vi.fn();

    const { AnalyticsProvider } = await import("./analytics-provider");

    render(<AnalyticsProvider />);
    expect(mocks.loadAnalytics).not.toHaveBeenCalled();

    idleCallbacks.forEach((run) => run());
    expect(mocks.loadAnalytics).toHaveBeenCalledTimes(1);
  });
});
