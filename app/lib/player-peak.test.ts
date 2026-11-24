import { describe, expect, it } from "vitest";
import type { Player } from "../components/court-data";
import { buildPlayerShareCardSources } from "./player-share-card";
import {
  combinePeakSeasons,
  consolidateSeasons,
  createPeakContext,
  filterPeakPlayers,
  findTwoSeasonPeak,
  getMaxTeamGamesBySeason,
  getSeasonMinGames,
  withTwoSeasonPeak,
  type SeasonStatRow,
} from "./player-peak";
import { getRankingPool, rankPlayers } from "./player-rankings";

let nextId = 1;

function createPlayer(name: string): Player {
  const id = nextId++;

  return {
    id,
    nbaId: 3000 + id,
    name,
    team: "BOS",
    position: "G",
    jerseyNumber: id,
    stats: {
      ppg: 10,
      rpg: 4,
      apg: 3,
      spg: 1,
      bpg: 0.5,
      fgPercent: 45,
      threePercent: 35,
      ftPercent: 78,
    },
    ratings: { defense: 60, starPower: 60 },
  } as Player;
}

function season(
  label: string,
  games: number,
  ppg: number,
  extra: Partial<SeasonStatRow> = {},
): SeasonStatRow {
  return {
    season: label,
    team: "BOS",
    games,
    ppg,
    rpg: 5,
    apg: 5,
    spg: 1,
    bpg: 0.5,
    fgPercent: 47,
    threePercent: 36,
    ftPercent: 80,
    ...extra,
  };
}

// 82-game completed seasons (41 to qualify) and a 2026-27 season at 20 team games
// (Current Season rule: 25% rounded up = 5 to qualify).
const leagueRows: SeasonStatRow[] = [
  ...[
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
    "2021-22",
    "2022-23",
    "2023-24",
    "2024-25",
    "2025-26",
  ].map((label) => season(label, 82, 10, { team: "IRN" })),
  season("2026-27", 20, 10, { team: "IRN" }),
];
const context = createPeakContext(getMaxTeamGamesBySeason(leagueRows));

describe("qualifying seasons", () => {
  it("needs half the team games in completed seasons and the Current Season rule now", () => {
    expect(context.currentSeason).toBe("2026-27");
    expect(getSeasonMinGames("2024-25", context)).toBe(41);
    expect(getSeasonMinGames("2026-27", context)).toBe(5);
  });
});

describe("two-season peak selection", () => {
  it("picks the best pair of back-to-back seasons", () => {
    const peak = findTwoSeasonPeak(
      createPlayer("Back To Back"),
      [
        season("2019-20", 70, 15),
        season("2020-21", 72, 28),
        season("2021-22", 75, 30),
        season("2022-23", 70, 18),
      ],
      context,
    );

    expect(peak?.seasonLabel).toBe("2020-21 to 2021-22");
    expect(peak?.games).toBe(147);
  });

  it("pairs across one missed season and labels it with &", () => {
    const peak = findTwoSeasonPeak(
      createPlayer("Missed Season"),
      [season("2013-14", 81, 32), season("2015-16", 72, 28)],
      createPeakContext([
        ["2013-14", 82],
        ["2014-15", 82],
        ["2015-16", 82],
        ["2026-27", 20],
      ]),
    );

    expect(peak?.seasonLabel).toBe("2013-14 & 2015-16");
  });

  it("treats a season below the minimum like a missed one", () => {
    const peak = findTwoSeasonPeak(
      createPlayer("Injured Season"),
      [
        season("2020-21", 70, 25),
        season("2021-22", 20, 35),
        season("2022-23", 70, 27),
      ],
      context,
    );

    expect(peak?.seasonLabel).toBe("2020-21 & 2022-23");
  });

  it("doesn't pair across two skipped seasons", () => {
    const peak = findTwoSeasonPeak(
      createPlayer("Long Gap"),
      [
        season("2021-22", 75, 20),
        season("2022-23", 36, 25),
        season("2023-24", 22, 26),
        season("2024-25", 70, 24),
      ],
      context,
    );

    expect(peak).toBeNull();
  });

  it("combines the two seasons with games-weighted averages", () => {
    const [first, second] = consolidateSeasons([
      season("2023-24", 80, 30),
      season("2024-25", 20, 10),
    ]);
    const peak = combinePeakSeasons(first, second);

    // (80 * 30 + 20 * 10) / 100 = 26.0, not the plain average of 20.0.
    expect(peak.ppg).toBe(26);
    expect(peak.games).toBe(100);
  });

  it("uses a traded player's combined TOT season, not each team's partial stats", () => {
    const seasons = consolidateSeasons([
      season("2023-24", 30, 30, { team: "LAL" }),
      season("2023-24", 40, 20, { team: "MIA" }),
      season("2023-24", 70, 24, { team: "TOT" }),
      season("2024-25", 75, 26),
    ]);

    expect(seasons).toHaveLength(2);
    expect(seasons[0]).toMatchObject({ season: "2023-24", games: 70, ppg: 24 });

    // Neither team stint reaches 41 games, but the 70-game total qualifies.
    expect(
      findTwoSeasonPeak(createPlayer("Traded"), [
        season("2023-24", 30, 30, { team: "LAL" }),
        season("2023-24", 40, 20, { team: "MIA" }),
        season("2023-24", 70, 24, { team: "TOT" }),
        season("2024-25", 75, 26),
      ], context)?.seasonLabel,
    ).toBe("2023-24 to 2024-25");
  });

  it("includes the current season once it meets the Current Season rule", () => {
    const peak = findTwoSeasonPeak(
      createPlayer("Second Year"),
      [season("2025-26", 70, 18), season("2026-27", 6, 30)],
      context,
    );

    expect(peak?.seasonLabel).toBe("2025-26 to 2026-27");
    expect(
      findTwoSeasonPeak(
        createPlayer("Too Few Games"),
        [season("2025-26", 70, 18), season("2026-27", 4, 30)],
        context,
      ),
    ).toBeNull();
  });
});

describe("one qualifying season", () => {
  const rookie = withTwoSeasonPeak(
    {
      ...createPlayer("One Season"),
      statProfiles: {
        peak: { profileType: "peak", seasonLabel: "2026-27", ppg: 20 },
      },
    },
    [season("2026-27", 15, 20)],
    context,
  );
  const veteran = withTwoSeasonPeak(
    createPlayer("Two Seasons"),
    [season("2024-25", 70, 22), season("2025-26", 72, 24)],
    context,
  );

  it("has no peak, replacing any stored single-season peak", () => {
    expect(rookie.statProfiles?.peak).toBeUndefined();
    expect(veteran.statProfiles?.peak?.seasonLabel).toBe("2024-25 to 2025-26");
  });

  it("is excluded from Peak rankings", () => {
    expect(filterPeakPlayers([rookie, veteran])).toEqual([veteran]);
    expect(getRankingPool([rookie, veteran], "peak")).toEqual([veteran]);
    expect(getRankingPool([rookie, veteran], "career")).toHaveLength(2);
  });

  it("leaves fallback data without any peaks unchanged", () => {
    const fallback = [createPlayer("Fallback A"), createPlayer("Fallback B")];

    expect(filterPeakPlayers(fallback)).toEqual(fallback);
  });
});

describe("share cards and Peak rankings", () => {
  it("give the same players the same ranks", () => {
    const players = [
      withTwoSeasonPeak(
        createPlayer("Scorer"),
        [season("2015-16", 80, 31), season("2016-17", 78, 29)],
        context,
      ),
      withTwoSeasonPeak(createPlayer("Rookie"), [season("2026-27", 15, 25)], context),
      withTwoSeasonPeak(
        createPlayer("Role Player"),
        [season("2018-19", 70, 9), season("2019-20", 65, 10)],
        context,
      ),
      withTwoSeasonPeak(
        createPlayer("All-Star"),
        [season("2020-21", 72, 24), season("2022-23", 70, 26)],
        context,
      ),
    ];
    const sources = buildPlayerShareCardSources(players, "peak");
    const cardOrder = sources
      .filter((source) => source.rank !== null)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((source) => source.name);
    const rankingOrder = rankPlayers(
      getRankingPool(players, "peak"),
      "peakOverall",
      "peak",
    ).map((player) => player.name);

    expect(cardOrder).toEqual(rankingOrder);
    expect(rankingOrder).toEqual(["Scorer", "All-Star", "Role Player"]);
    expect(sources.find((source) => source.name === "Rookie")?.rank).toBeNull();
  });
});
