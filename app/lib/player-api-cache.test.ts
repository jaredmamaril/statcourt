import { afterEach, describe, expect, it, vi } from "vitest";

type FakePage = { players: { id: number }[]; hasMore: boolean; total?: number | null };

function mockPlayerApi(pages: FakePage[]) {
  const requested: number[] = [];
  let inFlight = 0;
  let maxInFlight = 0;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const page = Number(new URL(url, "http://localhost").searchParams.get("page"));

      requested.push(page);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;

      return { ok: true, json: async () => pages[page - 1] } as Response;
    }),
  );

  return { requested, getMaxInFlight: () => maxInFlight };
}

function pageOf(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: start + index }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("getCachedApiPlayers", () => {
  it("requests the remaining pages in parallel and keeps them in order", async () => {
    const api = mockPlayerApi([
      { players: pageOf(1, 750), hasMore: true, total: 2000 },
      { players: pageOf(751, 750), hasMore: true, total: 2000 },
      { players: pageOf(1501, 500), hasMore: false, total: 2000 },
    ]);
    const { getCachedApiPlayers } = await import("./player-api-cache");

    const players = await getCachedApiPlayers();

    expect(players).toHaveLength(2000);
    expect(players.map((player) => player.id)).toEqual(
      Array.from({ length: 2000 }, (_, index) => index + 1),
    );
    expect(api.requested[0]).toBe(1);
    expect([...api.requested].sort()).toEqual([1, 2, 3]);
    // Pages 2 and 3 were in flight at the same time.
    expect(api.getMaxInFlight()).toBe(2);
  });

  it("asks for 750 players per page", async () => {
    mockPlayerApi([{ players: pageOf(1, 10), hasMore: false, total: 10 }]);
    const { getCachedApiPlayers } = await import("./player-api-cache");

    await getCachedApiPlayers();

    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("limit=750");
  });

  it("falls back to one page at a time without a total", async () => {
    const api = mockPlayerApi([
      { players: pageOf(1, 750), hasMore: true, total: null },
      { players: pageOf(751, 750), hasMore: true, total: null },
      { players: pageOf(1501, 3), hasMore: false, total: null },
    ]);
    const { getCachedApiPlayers } = await import("./player-api-cache");

    const players = await getCachedApiPlayers();

    expect(players).toHaveLength(1503);
    expect(api.requested).toEqual([1, 2, 3]);
    expect(api.getMaxInFlight()).toBe(1);
  });

  it("keeps reading if the list grew after the total was counted", async () => {
    const api = mockPlayerApi([
      { players: pageOf(1, 750), hasMore: true, total: 1500 },
      { players: pageOf(751, 750), hasMore: true, total: 1500 },
      { players: pageOf(1501, 2), hasMore: false, total: 1502 },
    ]);
    const { getCachedApiPlayers } = await import("./player-api-cache");

    const players = await getCachedApiPlayers();

    expect(players).toHaveLength(1502);
    expect(api.requested).toEqual([1, 2, 3]);
  });
});
