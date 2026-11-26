import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Player } from "../../components/court-data";
import { getPlayerRating } from "../../components/player-ratings";
import {
  createPeakContext,
  findTwoSeasonPeak,
  getMaxTeamGamesBySeason,
  type SeasonStatRow,
} from "../../lib/player-peak";

// In-memory stand-in for the database (CI never touches the live database).
type FixturePlayer = { player: Player; seasons: SeasonStatRow[] };

function seasonRow(
  season: string,
  games: number,
  ppg: number,
  team = "BOS",
): SeasonStatRow {
  return {
    season,
    team,
    games,
    ppg,
    rpg: 5,
    apg: 5,
    spg: 1,
    bpg: 0.5,
    fgPercent: 47,
    threePercent: 36,
    ftPercent: 80,
  };
}

function fixturePlayer(
  id: number,
  name: string,
  nbaId: number,
  careerPpg: number,
  seasons: SeasonStatRow[],
  extra: Partial<Player> = {},
): FixturePlayer {
  const stats = {
    ppg: careerPpg,
    rpg: 5,
    apg: 5,
    spg: 1,
    bpg: 0.5,
    fgPercent: 46,
    threePercent: 35,
    ftPercent: 79,
  };

  return {
    player: {
      id,
      nbaId,
      name,
      team: "BOS",
      position: "G",
      jerseyNumber: id,
      stats,
      ratings: { defense: 60, starPower: 60, careerLegacy: 30 },
      statProfiles: {
        career: { profileType: "career", seasonLabel: "Career", games: 300, ...stats },
        // Stored 3-season peak from the old pipeline, which the page must replace.
        peak: { profileType: "peak", seasonLabel: "2001-02 to 2003-04", ppg: 99 },
      },
      rosterStatus: "active",
      rosterStatusImportedAt: "2026-11-24T00:00:00Z",
      ...extra,
    } as Player,
    seasons,
  };
}

// League rows so every season has an 82-game team (41 to qualify) and 2026-27 has 20
// team games so far (Current Season rule: 5 to qualify).
const LEAGUE_FILLER: SeasonStatRow[] = [
  "1990-91",
  "1991-92",
  "1992-93",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
].map((season) => seasonRow(season, 82, 8, "IRN"));
LEAGUE_FILLER.push(seasonRow("2026-27", 20, 8, "IRN"));

const FIXTURES: FixturePlayer[] = [
  fixturePlayer(1, "Normal Guard", 1001, 21.4, [
    seasonRow("2023-24", 70, 18),
    seasonRow("2024-25", 75, 25),
    seasonRow("2025-26", 72, 26),
    seasonRow("2026-27", 15, 22),
  ]),
  fixturePlayer(2, "Mike James", 2229, 9.8, [
    seasonRow("1990-91", 60, 11),
    seasonRow("1991-92", 55, 12),
  ]),
  fixturePlayer(3, "Mike James", 1628455, 12.3, [
    // Traded season: TOT total qualifies even though neither stint does.
    seasonRow("2022-23", 30, 18, "PHX"),
    seasonRow("2022-23", 30, 22, "BKN"),
    seasonRow("2022-23", 60, 20, "TOT"),
    seasonRow("2023-24", 55, 15),
  ]),
  fixturePlayer(
    4,
    "Retired Legend",
    1004,
    27.1,
    [seasonRow("1990-91", 80, 31), seasonRow("1991-92", 78, 29), seasonRow("1992-93", 60, 24)],
    { rosterStatus: "inactive" },
  ),
  fixturePlayer(5, "One Season Rookie", 1005, 14.2, [seasonRow("2026-27", 15, 14)]),
];

// Latest-season profiles, as the pipeline stores them (an active player's is 2026-27,
// a retired player's is their final season).
FIXTURES[0].player.statProfiles!.current = {
  profileType: "current",
  seasonLabel: "2026-27",
  games: 15,
  ppg: 22,
  rpg: 5,
  apg: 5,
};
FIXTURES[3].player.statProfiles!.current = {
  profileType: "current",
  seasonLabel: "1992-93",
  games: 60,
  ppg: 24,
  rpg: 5,
  apg: 5,
};

// Last seasons for the two Mike Jameses ("Which Mike James?" lists the newest first).
FIXTURES[1].player.statProfiles!.current = { profileType: "current", seasonLabel: "1991-92" };
FIXTURES[2].player.statProfiles!.current = { profileType: "current", seasonLabel: "2023-24" };

const ALL_ROWS = [...LEAGUE_FILLER, ...FIXTURES.flatMap((fixture) => fixture.seasons)];

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock("../../components/supabase-players", () => ({
  getSupabasePlayerSlugIndex: async () =>
    FIXTURES.map(({ player }) => ({ id: player.id, name: player.name, nbaId: player.nbaId })),
  getSupabasePlayerById: async (id: number) =>
    structuredClone(FIXTURES.find(({ player }) => player.id === id)?.player ?? null),
  getSeasonStatRowsForPlayer: async (id: number) =>
    FIXTURES.find(({ player }) => player.id === id)?.seasons ?? [],
  getNewestSeasonFromSupabase: async () => "2026-27",
  // Same as the database query: longest single-team stint ("TOT" excluded).
  getSeasonMaxTeamGamesStrict: async (season: string) =>
    Math.max(
      0,
      ...ALL_ROWS.filter((row) => row.season === season && row.team !== "TOT").map(
        (row) => row.games ?? 0,
      ),
    ),
}));
vi.mock("./similar-players", () => ({ SimilarPlayers: () => null }));
const trackedEvents = vi.hoisted(() => [] as [string, unknown][]);
vi.mock("../../lib/analytics", () => ({
  track: (event: string, properties: unknown) => trackedEvents.push([event, properties]),
}));
// notFound() and permanentRedirect() throw in Next.js too; record where they'd send.
const { NotFoundSignal, RedirectSignal } = vi.hoisted(() => {
  class NotFoundSignal extends Error {}
  class RedirectSignal extends Error {
    constructor(readonly url: string) {
      super(`redirect ${url}`);
    }
  }

  return { NotFoundSignal, RedirectSignal };
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/players/test",
  notFound: () => {
    throw new NotFoundSignal();
  },
  permanentRedirect: (url: string) => {
    throw new RedirectSignal(url);
  },
}));
vi.mock("../../lib/use-auth-user", () => ({
  useAuthUser: () => ({ user: null, isLoadingUser: false }),
}));
// Controllable per test: the user's saved default stat mode, and whether it has loaded.
const userSettings = vi.hoisted(() => ({
  defaultStatMode: "career" as string,
  isLoadingSettings: true,
}));

vi.mock("../../lib/use-user-settings", () => ({
  useUserSettings: () => ({
    settings: { defaultStatMode: userSettings.defaultStatMode },
    isLoadingSettings: userSettings.isLoadingSettings,
    user: null,
    isLoadingUser: false,
  }),
}));
// The ranked description needs every player; treat that list as cold (unavailable).
vi.mock("../../components/player-data-source", () => ({
  getAppPlayerShareCardSources: () => Promise.reject(new Error("cold")),
}));
vi.mock("../../components/players/use-compare-slots", () => ({
  useCompareSlots: () => ({
    compareSlots: { left: null, right: null },
    updateCompareSlots: vi.fn(),
  }),
}));
vi.mock("../../components/players/use-favorite-players", () => ({
  useFavoritePlayers: () => ({ favorites: [], toggleFavorite: vi.fn() }),
}));
vi.mock("../../components/player-image", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_USE_SUPABASE_PLAYERS", "true");
  userSettings.defaultStatMode = "career";
  userSettings.isLoadingSettings = true;
});

const mapContext = createPeakContext(getMaxTeamGamesBySeason(ALL_ROWS));

describe("per-player peak", () => {
  it("matches the all-players peak map for every player", async () => {
    const { getPlayerForSlug } = await import("../../components/player-profile-source");

    for (const fixture of FIXTURES) {
      const mapPeak = findTwoSeasonPeak(fixture.player, fixture.seasons, mapContext);
      const slug = `${fixture.player.name.toLowerCase().replace(/ /g, "-")}-${fixture.player.nbaId}`;
      const { player } = await getPlayerForSlug(slug);

      expect(player?.id).toBe(fixture.player.id);
      expect(player?.statProfiles?.peak ?? null).toEqual(mapPeak);
    }
  });
});

async function renderPlayerPage(slug: string, mode?: string) {
  const { default: PlayerProfilePage } = await import("./page");

  render(
    await PlayerProfilePage({
      params: Promise.resolve({ slug }),
      searchParams: Promise.resolve(mode === undefined ? {} : { mode }),
    }),
  );
}

function selectedModeButton() {
  return screen
    .getAllByRole("button", { pressed: true })
    .find((button) => ["Career", "Peak", "Latest Season"].includes(button.textContent ?? ""));
}

function careerOvr(id: number) {
  const { player } = FIXTURES.find((fixture) => fixture.player.id === id)!;

  return getPlayerRating(player, "careerOverall", "career").toFixed(1);
}

describe("server-rendered player page", () => {
  it("shows a normal player's name, career OVR, stats and peak seasons", async () => {
    await renderPlayerPage("normal-guard");

    expect(screen.getAllByText("Normal Guard").length).toBeGreaterThan(0);
    expect(screen.getAllByText(careerOvr(1)).length).toBeGreaterThan(0);
    expect(screen.getAllByText("21.4").length).toBeGreaterThan(0);
    expect(screen.getByText("Peak seasons: 2024-25 to 2025-26")).toBeTruthy();
  });

  it("shows the right Mike James for each NBA ID URL", async () => {
    await renderPlayerPage("mike-james-2229");

    expect(screen.getAllByText("9.8").length).toBeGreaterThan(0);
    expect(screen.getByText("Peak seasons: 1990-91 to 1991-92")).toBeTruthy();
    expect(screen.queryByText("12.3")).toBeNull();
  });

  it("shows the other Mike James, whose peak uses his traded season's total", async () => {
    await renderPlayerPage("mike-james-1628455");

    expect(screen.getAllByText("12.3").length).toBeGreaterThan(0);
    expect(screen.getByText("Peak seasons: 2022-23 to 2023-24")).toBeTruthy();
    expect(screen.queryByText("9.8")).toBeNull();
  });

  it("shows a retired player's stats and peak", async () => {
    await renderPlayerPage("retired-legend");

    expect(screen.getAllByText("Retired Legend").length).toBeGreaterThan(0);
    expect(screen.getAllByText(careerOvr(4)).length).toBeGreaterThan(0);
    expect(screen.getAllByText("27.1").length).toBeGreaterThan(0);
    expect(screen.getByText("Peak seasons: 1990-91 to 1991-92")).toBeTruthy();
  });

  it("says a player without two qualifying seasons has no peak", async () => {
    await renderPlayerPage("one-season-rookie");

    expect(screen.getAllByText("One Season Rookie").length).toBeGreaterThan(0);
    expect(screen.getAllByText("14.2").length).toBeGreaterThan(0);
    expect(screen.getByText("Peak: needs 2 qualifying seasons")).toBeTruthy();
    expect(screen.queryByText(/2001-02 to 2003-04/)).toBeNull();
  });

});

describe("player slug routing", () => {
  async function renderOutcome(slug: string, query: Record<string, string> = {}) {
    const { default: PlayerProfilePage } = await import("./page");

    try {
      render(
        await PlayerProfilePage({
          params: Promise.resolve({ slug }),
          searchParams: Promise.resolve(query),
        }),
      );

      return "rendered";
    } catch (error) {
      if (error instanceof NotFoundSignal) return "not-found";
      if (error instanceof RedirectSignal) return `redirect ${error.url}`;
      throw error;
    }
  }

  it.each(["not-a-real-player", "%E0%A4%A", "---", "mike-james-9999"])(
    "calls notFound() for an unknown slug (%s)",
    async (slug) => {
      expect(await renderOutcome(slug)).toBe("not-found");
    },
  );

  it.each([
    ["Normal-Guard", "/players/normal-guard"],
    ["NORMAL-GUARD", "/players/normal-guard"],
    ["Normal%20Guard", "/players/normal-guard"],
    ["Normal Guard", "/players/normal-guard"],
    // ID suffix on a name nobody else has.
    ["normal-guard-1001", "/players/normal-guard"],
    ["Mike-James-2229", "/players/mike-james-2229"],
    ["MIKE-JAMES", "/players/mike-james"],
  ])("redirects %s to %s", async (slug, target) => {
    expect(await renderOutcome(slug)).toBe(`redirect ${target}`);
  });

  it("keeps the query string on the redirect", async () => {
    expect(
      await renderOutcome("Normal-Guard", { mode: "peak", utm_source: "reddit" }),
    ).toBe("redirect /players/normal-guard?mode=peak&utm_source=reddit");
  });

  it("renders canonical slugs without redirecting", async () => {
    expect(await renderOutcome("normal-guard")).toBe("rendered");
    expect(await renderOutcome("mike-james-1628455")).toBe("rendered");
  });

  it("lists every player for a shared name, newest first", async () => {
    expect(await renderOutcome("mike-james")).toBe("rendered");

    expect(screen.getByRole("heading", { name: "Which Mike James?" })).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: /Mike James/ }).map((link) => link.getAttribute("href")),
    ).toEqual(["/players/mike-james-1628455", "/players/mike-james-2229"]);
  });
});

describe("stat mode links (?mode=)", () => {
  it("renders the link's mode on the server", async () => {
    await renderPlayerPage("normal-guard", "peak");

    expect(selectedModeButton()?.textContent).toBe("Peak");
    // Peak mode shows the rule in the reserved line.
    expect(screen.getByText(/Peak = best 2 consecutive qualifying seasons/)).toBeTruthy();
  });

  it("lets the link's mode override the user's saved default", async () => {
    userSettings.defaultStatMode = "current";
    userSettings.isLoadingSettings = false;

    await renderPlayerPage("normal-guard", "peak");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(selectedModeButton()?.textContent).toBe("Peak");
  });

  it("applies the saved default when the link has no mode", async () => {
    userSettings.defaultStatMode = "current";
    userSettings.isLoadingSettings = false;

    await renderPlayerPage("normal-guard");

    await waitFor(() => expect(selectedModeButton()?.textContent).toBe("Latest Season"));
  });

  it("falls back to the usual behavior for an invalid mode", async () => {
    await renderPlayerPage("normal-guard", "PEAK");

    expect(selectedModeButton()?.textContent).toBe("Career");
  });

  it("tracks stat_mode_changed for a real change and never a $pageview", async () => {
    trackedEvents.length = 0;
    await renderPlayerPage("normal-guard");

    screen.getByRole("button", { name: "Career" }).click(); // already Career: no event
    screen.getByRole("button", { name: "Peak" }).click();
    await waitFor(() => expect(selectedModeButton()?.textContent).toBe("Peak"));

    expect(trackedEvents).toEqual([
      ["stat_mode_changed", { from: "career", to: "peak", page: "player", slug: "normal-guard" }],
    ]);
    expect(trackedEvents.some(([event]) => event === "$pageview")).toBe(false);
  });

  it("writes the mode into the address bar without a navigation", async () => {
    const replaceState = vi.spyOn(window.history, "replaceState");

    await renderPlayerPage("normal-guard");
    screen.getByRole("button", { name: "Peak" }).click();

    await waitFor(() => expect(selectedModeButton()?.textContent).toBe("Peak"));
    expect(replaceState).toHaveBeenCalledWith(window.history.state, "", expect.stringContaining("mode=peak"));
    replaceState.mockRestore();
  });
});

describe("player page metadata", () => {
  async function metadataFor(slug: string, mode?: string) {
    const { generateMetadata } = await import("./page");

    return generateMetadata({
      params: Promise.resolve({ slug }),
      searchParams: Promise.resolve(mode === undefined ? {} : { mode }),
    });
  }

  function imageUrl(images: unknown) {
    const [image] = images as ({ url: string } | string)[];

    return typeof image === "string" ? image : image.url;
  }

  it("doesn't throw for unknown slugs and marks them noindex", async () => {
    for (const slug of ["not-a-real-player", "%E0%A4%A", "---"]) {
      const metadata = await metadataFor(slug, "peak");

      expect(metadata.title).toBe("Player Not Found");
      expect(metadata.robots).toEqual({ index: false, follow: true });
      expect(metadata.openGraph).toBeUndefined();
    }
  });

  it("marks the shared-name page noindex", async () => {
    const metadata = await metadataFor("mike-james");

    expect(metadata.title).toBe("Which Mike James?");
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe("/players/mike-james");
  });

  it("never puts ?mode in the canonical URL", async () => {
    for (const mode of [undefined, "career", "peak", "current", "bogus"]) {
      const metadata = await metadataFor("normal-guard", mode);

      expect(metadata.alternates?.canonical).toBe("/players/normal-guard");
    }

    expect((await metadataFor("mike-james-1628455", "peak")).alternates?.canonical).toBe(
      "/players/mike-james-1628455",
    );
  });

  it("points og:image, twitter:image and og:url at the shared mode", async () => {
    for (const mode of ["career", "peak", "current"]) {
      const metadata = await metadataFor("normal-guard", mode);

      expect(imageUrl(metadata.openGraph?.images)).toBe(
        `/players/normal-guard/share-image?mode=${mode}`,
      );
      expect(imageUrl(metadata.twitter?.images)).toBe(
        `/players/normal-guard/share-image?mode=${mode}`,
      );
      expect(metadata.openGraph?.url).toBe(`/players/normal-guard?mode=${mode}`);
    }
  });

  it("uses the Peak card and the clean URL without a valid mode", async () => {
    for (const mode of [undefined, "Peak", "nope"]) {
      const metadata = await metadataFor("normal-guard", mode);

      expect(imageUrl(metadata.openGraph?.images)).toBe(
        "/players/normal-guard/share-image?mode=peak",
      );
      expect(metadata.openGraph?.url).toBe("/players/normal-guard");
    }
  });

  it("describes the shared mode", async () => {
    expect((await metadataFor("normal-guard", "peak")).description).toContain("peak (2024–26)");
    expect((await metadataFor("normal-guard", "current")).description).toContain(
      "current season (2026–27)",
    );
    expect((await metadataFor("retired-legend", "current")).description).toContain(
      "final season (1992–93)",
    );
    expect((await metadataFor("normal-guard", "career")).description).toMatch(
      /^Normal Guard's career: 21\.4 PPG/,
    );
  });
});
