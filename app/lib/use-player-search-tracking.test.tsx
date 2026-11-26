import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());

vi.mock("./analytics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./analytics")>()),
  track,
}));

beforeEach(() => {
  vi.useFakeTimers();
  track.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePlayerSearchTracking", () => {
  it("sends one event after typing settles, with the query when it matched players", async () => {
    const { usePlayerSearchTracking } = await import("./use-player-search-tracking");
    const { rerender } = renderHook(
      ({ query, count }) => usePlayerSearchTracking("players", query, count),
      { initialProps: { query: "la", count: 40 } },
    );

    rerender({ query: "lame", count: 2 });
    rerender({ query: "LaMelo", count: 1 });
    vi.advanceTimersByTime(1_000);

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("player_search", {
      surface: "players",
      query_length: 6,
      result_count: 1,
      query: "lamelo",
    });
  });

  it("leaves out the query when nothing matched", async () => {
    const { usePlayerSearchTracking } = await import("./use-player-search-tracking");

    renderHook(() => usePlayerSearchTracking("rankings", "jane at gmail", 0));
    vi.advanceTimersByTime(1_000);

    expect(track).toHaveBeenCalledWith("player_search", {
      surface: "rankings",
      query_length: 13,
      result_count: 0,
    });
  });

  it("never sends the query for community (user) search", async () => {
    const { usePlayerSearchTracking } = await import("./use-player-search-tracking");

    renderHook(() =>
      usePlayerSearchTracking("community", "someusername", 1, { includeQuery: false }),
    );
    vi.advanceTimersByTime(1_000);

    expect(track).toHaveBeenCalledWith("player_search", {
      surface: "community",
      query_length: 12,
      result_count: 1,
    });
  });

  it("sends nothing for an empty search", async () => {
    const { usePlayerSearchTracking } = await import("./use-player-search-tracking");

    renderHook(() => usePlayerSearchTracking("players", "   ", 4000));
    vi.advanceTimersByTime(2_000);

    expect(track).not.toHaveBeenCalled();
  });
});
