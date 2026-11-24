import { render, screen } from "@testing-library/react";
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
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/players/test",
}));
vi.mock("../../lib/use-auth-user", () => ({
  useAuthUser: () => ({ user: null, isLoadingUser: false }),
}));
vi.mock("../../lib/use-user-settings", () => ({
  useUserSettings: () => ({
    settings: { defaultStatMode: "career" },
    isLoadingSettings: true,
    user: null,
    isLoadingUser: false,
  }),
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

async function renderPlayerPage(slug: string) {
  const { default: PlayerProfilePage } = await import("./page");

  render(await PlayerProfilePage({ params: Promise.resolve({ slug }) }));
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

  it("shows Player Not Found for an unknown slug", async () => {
    await renderPlayerPage("not-a-real-player");

    expect(screen.getByText("Player Not Found")).toBeTruthy();
  });
});
