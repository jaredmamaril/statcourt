import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  allowed: true,
  render: vi.fn(),
}));

const SLUG_INDEX = [
  { id: 1, name: "LaMelo Ball", nbaId: 1630163 },
  { id: 2, name: "Mike James", nbaId: 2229 },
  { id: 3, name: "Mike James", nbaId: 1628455 },
];

vi.mock("../../../lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: mocks.allowed }),
  createIpRateLimitRules: (_request: Request, namespace: string) => [{ id: namespace }],
  createRateLimitResponse: () => new Response("Too many requests", { status: 429 }),
}));
vi.mock("../player-share-image", () => ({ renderPlayerShareImage: mocks.render }));
vi.mock("../../../components/player-profile-source", async () => {
  const { findPlayerBySlug } = await import("../../../lib/player-slug");

  return {
    getPlayerForSlug: async (slug: string) => ({
      player: findPlayerBySlug(SLUG_INDEX, slug) ?? null,
      slugIndex: SLUG_INDEX,
      loadError: null,
      newestSeason: "2026-27",
    }),
  };
});

async function getImage(path: string) {
  const { GET } = await import("./route");
  const url = new URL(path, "https://statcourt.app");
  const slug = decodeURIComponent(url.pathname.split("/")[2]);

  return GET(new Request(url), { params: Promise.resolve({ slug }) });
}

function redirectTarget(response: Response) {
  const location = new URL(response.headers.get("location")!);

  return `${location.pathname}${location.search}`;
}

beforeEach(() => {
  mocks.allowed = true;
  mocks.render.mockReset();
  mocks.render.mockResolvedValue(new Response("png", { status: 200 }));
});

describe("share-image route", () => {
  it("renders the normalized URL for each mode with cache headers", async () => {
    for (const mode of ["career", "peak", "current"]) {
      const response = await getImage(`/players/lamelo-ball/share-image?mode=${mode}`);

      expect(response.status).toBe(200);
      expect(mocks.render).toHaveBeenLastCalledWith(
        "lamelo-ball",
        mode,
        expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage=3600") }),
      );
    }
  });

  it.each([
    ["/players/lamelo-ball/share-image", "/players/lamelo-ball/share-image?mode=peak"],
    ["/players/lamelo-ball/share-image?mode=PEAK", "/players/lamelo-ball/share-image?mode=peak"],
    ["/players/lamelo-ball/share-image?mode=Current", "/players/lamelo-ball/share-image?mode=current"],
    ["/players/lamelo-ball/share-image?mode=bogus", "/players/lamelo-ball/share-image?mode=peak"],
    ["/players/lamelo-ball/share-image?mode=peak&cb=123", "/players/lamelo-ball/share-image?mode=peak"],
    ["/players/lamelo-ball/share-image?cb=1&mode=career", "/players/lamelo-ball/share-image?mode=career"],
    ["/players/lamelo-ball/share-image?mode=peak&mode=career", "/players/lamelo-ball/share-image?mode=peak"],
    ["/players/LaMelo%20Ball/share-image?mode=peak", "/players/lamelo-ball/share-image?mode=peak"],
  ])("redirects %s to %s without rendering", async (path, normalized) => {
    const response = await getImage(path);

    expect(response.status).toBe(308);
    expect(redirectTarget(response)).toBe(normalized);
    expect(mocks.render).not.toHaveBeenCalled();
  });

  it("keeps the NBA ID suffix for duplicate names", async () => {
    const response = await getImage("/players/mike-james-1628455/share-image?mode=current");

    expect(response.status).toBe(200);
    expect(mocks.render).toHaveBeenCalledWith("mike-james-1628455", "current", expect.anything());
  });

  it("sends unknown players to the static site preview image", async () => {
    const response = await getImage("/players/not-a-real-player/share-image?mode=peak");

    expect(response.status).toBe(308);
    expect(redirectTarget(response)).toBe("/readme/statcourt-preview.png");
    expect(mocks.render).not.toHaveBeenCalled();
  });

  it("is rate limited before doing any work", async () => {
    mocks.allowed = false;

    const response = await getImage("/players/lamelo-ball/share-image?mode=peak");

    expect(response.status).toBe(429);
    expect(mocks.render).not.toHaveBeenCalled();
  });
});
