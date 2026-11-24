import { describe, expect, it } from "vitest";
import type { Player, PlayerStatProfile } from "../components/court-data";
import { buildPlayerShareCardSources } from "./player-share-card";
import { getRankingPool, rankPlayers } from "./player-rankings";
import {
  filterActivePlayers,
  filterCurrentSeasonPlayers,
  getCurrentNbaSeason,
  getCurrentRankingMinGames,
  isEligibleForCurrentRankings,
  getLatestSeasonLabel,
  hasFreshRosterStatus,
  isPlayerActive,
} from "./player-season";

const now = new Date("2026-11-24T12:00:00Z");
const freshImport = "2026-11-24T08:00:00Z";
const lastSeasonImport = "2026-06-26T20:08:22Z";

let nextId = 1;

function createPlayer(
  name: string,
  {
    ppg = 15,
    current,
    rosterStatus,
    importedAt = freshImport,
  }: {
    ppg?: number;
    current?: Partial<PlayerStatProfile> | null;
    rosterStatus?: Player["rosterStatus"];
    importedAt?: string | null;
  } = {},
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
    nbaId: 2000 + id,
    name,
    team: "BOS",
    position: "G",
    jerseyNumber: id,
    stats,
    ratings: { defense: 50, starPower: 50 },
    rosterStatus: rosterStatus ?? null,
    rosterStatusImportedAt: rosterStatus ? importedAt : null,
    statProfiles: {
      career: { profileType: "career", seasonLabel: "Career", ...stats },
      ...(current === null
        ? {}
        : {
            current: {
              profileType: "current",
              seasonLabel: "2026-27",
              games: 15,
              ...stats,
              ...current,
            },
          }),
    },
  } as Player;
}

describe("getCurrentNbaSeason", () => {
  it("keeps September in the previous season", () => {
    expect(getCurrentNbaSeason(new Date("2026-09-30T23:00:00Z"))).toBe(
      "2025-26",
    );
  });

  it("rolls over to the new season in October", () => {
    expect(getCurrentNbaSeason(new Date("2026-10-01T00:00:00Z"))).toBe(
      "2026-27",
    );
    expect(getCurrentNbaSeason(now)).toBe("2026-27");
  });

  it("stays in the same season across the calendar year boundary", () => {
    expect(getCurrentNbaSeason(new Date("2026-12-31T23:59:59Z"))).toBe(
      "2026-27",
    );
    expect(getCurrentNbaSeason(new Date("2027-01-01T00:00:00Z"))).toBe(
      "2026-27",
    );
  });

  it("formats the century rollover", () => {
    expect(getCurrentNbaSeason(new Date("2099-10-15T00:00:00Z"))).toBe(
      "2099-00",
    );
  });
});

describe("active player rule", () => {
  const activeStar = createPlayer("Active Star", {
    ppg: 30,
    rosterStatus: "active",
  });
  // On an active roster but hasn't played this season (injured): current profile is
  // still last season.
  const injuredActive = createPlayer("Injured Active", {
    ppg: 22,
    rosterStatus: "active",
    current: { seasonLabel: "2025-26", games: 70 },
  });
  const activeNoGames = createPlayer("Active No Games", {
    rosterStatus: "active",
    current: { games: 0 },
  });
  const retired = createPlayer("Retired", {
    ppg: 28,
    rosterStatus: "inactive",
    current: { seasonLabel: "2002-03" },
  });
  // Waived this season: played a few games, now off every roster.
  const waived = createPlayer("Waived", { rosterStatus: "inactive" });
  const noRosterPlayed = createPlayer("No Roster Played");
  const noRosterRetired = createPlayer("No Roster Retired", {
    current: { seasonLabel: "2019-20" },
  });
  const staleActive = createPlayer("Stale Active", {
    rosterStatus: "active",
    importedAt: lastSeasonImport,
    current: { seasonLabel: "2024-25" },
  });
  const players = [
    retired,
    injuredActive,
    noRosterRetired,
    activeStar,
    waived,
    staleActive,
    activeNoGames,
    noRosterPlayed,
  ];

  it("includes injured players who are on an active roster", () => {
    expect(isPlayerActive(injuredActive, 2026, now)).toBe(true);
    expect(isPlayerActive(activeNoGames, 2026, now)).toBe(true);
  });

  it("excludes retired and waived players", () => {
    expect(isPlayerActive(retired, 2026, now)).toBe(false);
    expect(isPlayerActive(waived, 2026, now)).toBe(false);
  });

  it("falls back to games in the newest season when roster status is missing", () => {
    expect(isPlayerActive(noRosterPlayed, 2026, now)).toBe(true);
    expect(isPlayerActive(noRosterRetired, 2026, now)).toBe(false);
  });

  it("treats roster status imported before this season as stale", () => {
    expect(hasFreshRosterStatus(staleActive, now)).toBe(false);
    expect(hasFreshRosterStatus(activeStar, now)).toBe(true);
    // Stale "active" doesn't count; their latest season is old, so they're out.
    expect(isPlayerActive(staleActive, 2026, now)).toBe(false);
    expect(
      hasFreshRosterStatus(
        { ...activeStar, rosterStatusImportedAt: "2026-10-20T00:00:00Z" },
        new Date("2026-11-15T00:00:00Z"),
      ),
    ).toBe(true);
    expect(
      hasFreshRosterStatus(activeStar, new Date("2027-01-15T00:00:00Z")),
    ).toBe(false);
  });

  it("filters active players with the rule", () => {
    expect(
      filterActivePlayers(players, now).map((player) => player.name),
    ).toEqual([
      "Injured Active",
      "Active Star",
      "Active No Games",
      "No Roster Played",
    ]);
  });

  it("reads the season label from the data", () => {
    expect(getLatestSeasonLabel(players)).toBe("2026-27");
    expect(getLatestSeasonLabel([retired, staleActive])).toBe("2024-25");
    expect(getLatestSeasonLabel([createPlayer("No Data", { current: null })])).toBeNull();
  });
});

describe("Current Season rankings eligibility", () => {
  // Fresh roster status relative to the real clock, because the share cards and the
  // ranking pool use the current time.
  const realNow = new Date().toISOString();
  const onRoster = (name: string, ppg: number, current?: Partial<PlayerStatProfile> | null) =>
    createPlayer(name, { ppg, rosterStatus: "active", importedAt: realNow, current });

  // The season leader has 20 games, so the minimum is ceil(20 * 0.25) = 5.
  const leader = onRoster("Season Leader", 29, { games: 20 });
  const atMinimum = onRoster("At Minimum", 18, { games: 5 });
  const belowMinimum = onRoster("Below Minimum", 26, { games: 4 });
  // On an active roster but hasn't played this season: current profile is last season.
  const injuredStar = onRoster("Injured Star", 31, { seasonLabel: "2025-26", games: 70 });
  const rookieNoGames = onRoster("Rookie No Games", 10, { games: 0 });
  const rookieNoProfile = onRoster("Rookie No Profile", 10, null);
  const retiredLegend = createPlayer("Retired Legend", {
    ppg: 32,
    rosterStatus: "inactive",
    importedAt: realNow,
    current: { seasonLabel: "2002-03", games: 82 },
  });
  const players = [
    retiredLegend,
    injuredStar,
    belowMinimum,
    leader,
    rookieNoGames,
    atMinimum,
    rookieNoProfile,
  ];

  it("scales the minimum with the season leader's games", () => {
    expect(getCurrentRankingMinGames(players)).toBe(5);
    expect(getCurrentRankingMinGames([onRoster("Opening Night", 20, { games: 1 })])).toBe(1);
    expect(getCurrentRankingMinGames([onRoster("Week Two", 20, { games: 3 })])).toBe(1);
    expect(getCurrentRankingMinGames([onRoster("Week Three", 20, { games: 5 })])).toBe(2);
    expect(getCurrentRankingMinGames([onRoster("Season End", 20, { games: 82 })])).toBe(21);
  });

  it("includes players at the minimum and excludes players one game below it", () => {
    expect(isEligibleForCurrentRankings(atMinimum, 2026, 5)).toBe(true);
    expect(isEligibleForCurrentRankings(belowMinimum, 2026, 5)).toBe(false);
  });

  it("excludes an injured active player from rankings but keeps them active", () => {
    expect(isPlayerActive(injuredStar, 2026)).toBe(true);
    expect(isEligibleForCurrentRankings(injuredStar, 2026, 5)).toBe(false);

    const card = buildPlayerShareCardSources(players, "current").find(
      (source) => source.name === "Injured Star",
    );

    expect(card).toMatchObject({ rank: null, isFinalSeason: false });
  });

  it("excludes rookies who haven't played", () => {
    expect(isPlayerActive(rookieNoGames, 2026)).toBe(true);
    expect(isEligibleForCurrentRankings(rookieNoGames, 2026, 1)).toBe(false);
    expect(isEligibleForCurrentRankings(rookieNoProfile, 2026, 1)).toBe(false);
  });

  it("never ranks stats from an older season", () => {
    const pool = filterCurrentSeasonPlayers(players);

    expect(pool.map((player) => player.name)).toEqual(["Season Leader", "At Minimum"]);
    expect(
      pool.every((player) => player.statProfiles?.current?.seasonLabel === "2026-27"),
    ).toBe(true);
  });

  it("gives share cards the same ranks as the rankings", () => {
    const sources = buildPlayerShareCardSources(players, "current");
    const cardOrder = sources
      .filter((source) => source.rank !== null)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((source) => source.name);
    const rankingOrder = rankPlayers(
      getRankingPool(players, "current"),
      "currentOverall",
      "current",
    ).map((player) => player.name);

    expect(cardOrder).toEqual(rankingOrder);
    expect(rankingOrder).toEqual(["Season Leader", "At Minimum"]);
    expect(
      sources.find((source) => source.name === "Retired Legend"),
    ).toMatchObject({ rank: null, isFinalSeason: true });
  });
});
