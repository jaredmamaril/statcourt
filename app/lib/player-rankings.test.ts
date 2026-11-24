import { describe, expect, it } from "vitest";
import type { Player, PlayerStatProfile } from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import { buildPlayerShareCardSources } from "./player-share-card";
import { getRankingPool, rankPlayers } from "./player-rankings";
import { filterCurrentSeasonPlayers } from "./player-season";

let nextId = 1;

function createPlayer(
  name: string,
  ppg: number,
  current?: Partial<PlayerStatProfile> | null,
  overrides: Partial<Player> = {},
): Player {
  const id = nextId++;
  const stats = {
    ppg,
    rpg: 5,
    apg: 4,
    spg: 1,
    bpg: 0.5,
    fgPercent: 47,
    threePercent: 35,
    ftPercent: 78,
  };

  return {
    id,
    nbaId: 1000 + id,
    name,
    team: "BOS",
    position: "G",
    jerseyNumber: id,
    stats,
    ratings: { defense: 50, starPower: 50 },
    statProfiles: {
      career: { profileType: "career", seasonLabel: "Career", ...stats },
      peak: { profileType: "peak", seasonLabel: "2000-01", ...stats },
      ...(current === null
        ? {}
        : {
            current: {
              profileType: "current",
              seasonLabel: "2025-26",
              games: 60,
              ...stats,
              ...current,
            },
          }),
    },
    ...overrides,
  } as Player;
}

const activeStar = createPlayer("Active Star", 30);
const activeStarter = createPlayer("Active Starter", 20);
const activeBench = createPlayer("Active Bench", 8);
const retiredLegend = createPlayer("Retired Legend", 32, {
  seasonLabel: "2002-03",
});
const recentlyRetired = createPlayer("Recently Retired", 25, {
  seasonLabel: "2024-25",
});
const noCurrentProfile = createPlayer("No Current Profile", 15, null);
const noGamesThisSeason = createPlayer("No Games Yet", 18, { games: 0 });
// Two players named Mike James: one active, one retired (NBA ID slug suffixes).
const mikeJamesActive = createPlayer("Mike James", 12, {}, { nbaId: 1628455 });
const mikeJamesRetired = createPlayer(
  "Mike James",
  14,
  { seasonLabel: "2008-09" },
  { nbaId: 2229 },
);

const allPlayers = [
  retiredLegend,
  activeBench,
  recentlyRetired,
  activeStar,
  noCurrentProfile,
  mikeJamesRetired,
  noGamesThisSeason,
  activeStarter,
  mikeJamesActive,
];

describe("getRankingPool", () => {
  it("keeps only players from the newest season in Current mode", () => {
    const pool = getRankingPool(allPlayers, "current");

    expect(pool.map((player) => player.name)).toEqual([
      "Active Bench",
      "Active Star",
      "Active Starter",
      "Mike James",
    ]);
    expect(pool).not.toContain(retiredLegend);
    expect(pool).not.toContain(recentlyRetired);
    expect(pool).not.toContain(noCurrentProfile);
    expect(pool).not.toContain(noGamesThisSeason);
  });

  it("keeps the active player when a retired player shares the name", () => {
    const pool = getRankingPool(allPlayers, "current");

    expect(pool).toContain(mikeJamesActive);
    expect(pool).not.toContain(mikeJamesRetired);
  });

  it("keeps every player, retired included, in Peak and Career modes", () => {
    expect(getRankingPool(allPlayers, "peak")).toHaveLength(allPlayers.length);
    expect(getRankingPool(allPlayers, "career")).toHaveLength(allPlayers.length);
    expect(getRankingPool(allPlayers, "peak")).toContain(retiredLegend);
  });

  it("returns the list unchanged when no player has season data", () => {
    const withoutSeasons = [
      createPlayer("Fallback A", 20, null),
      createPlayer("Fallback B", 10, null),
    ];

    expect(getRankingPool(withoutSeasons, "current")).toEqual(withoutSeasons);
  });
});

describe("rankPlayers after filtering", () => {
  it("orders active players by Current rating with no gaps in numbering", () => {
    const ranked = rankPlayers(
      getRankingPool(allPlayers, "current"),
      "currentOverall",
      "current",
    );
    const ratings = ranked.map((player) =>
      getPlayerRating(player, "currentOverall", "current"),
    );

    expect(ranked.map((player) => player.name)).toEqual([
      "Active Star",
      "Active Starter",
      "Mike James",
      "Active Bench",
    ]);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    // The page numbers players by position (#index + 1), so ranks are 1..n.
    expect(ranked.map((_, index) => index + 1)).toEqual([1, 2, 3, 4]);
  });

  it("still ranks retired players in Peak mode", () => {
    const ranked = rankPlayers(
      getRankingPool(allPlayers, "peak"),
      "peakOverall",
      "peak",
    );

    expect(ranked).toHaveLength(allPlayers.length);
    expect(ranked[0]).toBe(retiredLegend);
  });
});

describe("share cards use the same active-player rule", () => {
  it("ranks the same players as Current-mode rankings", () => {
    const sources = buildPlayerShareCardSources(allPlayers, "current");
    const rankedOnCards = sources
      .filter((source) => source.rank !== null)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((source) => source.nbaId);
    const rankedOnPage = rankPlayers(
      filterCurrentSeasonPlayers(allPlayers),
      "currentOverall",
      "current",
    ).map((player) => player.nbaId);

    expect(rankedOnCards).toEqual(rankedOnPage);
  });
});
