import { describe, expect, it } from "vitest";
import type { Player } from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import {
  buildPlayerShareCardSources,
  formatSeasonWindow,
  getPlayerInitials,
  getPlayerShareCard,
  getPlayerShareDescription,
} from "./player-share-card";

function createTestPlayer(overrides: Partial<Player>): Player {
  return {
    id: 1,
    nbaId: 2544,
    name: "LeBron James",
    team: "LAL",
    position: "F",
    jerseyNumber: 23,
    stats: {
      ppg: 27,
      rpg: 7.5,
      apg: 7.4,
      spg: 1.5,
      bpg: 0.8,
      fgPercent: 50.6,
      threePercent: 34.8,
      ftPercent: 73.6,
    },
    ratings: { defense: 80, starPower: 95 },
    ...overrides,
  } as Player;
}

const lebron = createTestPlayer({
  statProfiles: {
    peak: {
      profileType: "peak",
      seasonLabel: "2007-08 to 2009-10",
      ppg: 29.3,
      rpg: 7.6,
      apg: 7.7,
      fgPercent: 49.2,
    },
    career: {
      profileType: "career",
      seasonLabel: "Career",
      ppg: 27,
      rpg: 7.5,
      apg: 7.4,
      fgPercent: 50.6,
    },
  },
});

const rolePlayer = createTestPlayer({
  id: 2,
  nbaId: 1,
  name: "Role Player Jr.",
  team: "BOS",
  position: "G",
  stats: {
    ppg: 6.1,
    rpg: 2.2,
    apg: 1.4,
    spg: 0.5,
    bpg: 0.1,
    fgPercent: 41,
    threePercent: 33,
    ftPercent: 75,
  },
  ratings: { defense: 40, starPower: 10 },
});

describe("getPlayerShareCard", () => {
  it("returns null for an unknown slug so the image renders the fallback card", () => {
    const players = buildPlayerShareCardSources([lebron]);

    expect(getPlayerShareCard(players, "not-a-real-player")).toBeNull();
    expect(getPlayerShareCard([], "lebron-james")).toBeNull();
  });

  it("returns null instead of throwing on a malformed slug", () => {
    const players = buildPlayerShareCardSources([lebron]);

    expect(getPlayerShareCard(players, "%E0%A4%A")).toBeNull();
  });

  it("defaults to the 3-Year Peak profile with rating, rank and FG PCT", () => {
    const players = buildPlayerShareCardSources([rolePlayer, lebron]);

    expect(getPlayerShareCard(players, "lebron-james")).toEqual({
      name: "LeBron James",
      initials: "LJ",
      team: null,
      position: "F",
      profileLabel: "3-Year Peak · 2007-08 to 2009-10",
      overall: Math.round(
        getPlayerRating(lebron, "peakOverall", "peak"),
      ).toString(),
      rankLabel: "#1 BEST PEAK EVER",
      stats: [
        { label: "PPG", value: "29.3" },
        { label: "RPG", value: "7.6" },
        { label: "APG", value: "7.7" },
        { label: "FG PCT", value: "49.2" },
      ],
    });
  });

  it("shows OVR as a whole number in every mode", () => {
    for (const mode of ["peak", "career", "current"] as const) {
      const card = getPlayerShareCard(
        buildPlayerShareCardSources([rolePlayer, lebron], mode),
        "lebron-james",
        mode,
      );

      expect(card?.overall).toMatch(/^\d+$/);
    }
  });

  it("picks the label, stats, rating and rank for the requested mode", () => {
    const players = buildPlayerShareCardSources([rolePlayer, lebron], "career");
    const card = getPlayerShareCard(players, "lebron-james", "career");

    expect(card?.profileLabel).toBe("Career");
    expect(card?.team).toBeNull();
    expect(card?.rankLabel).toBe("#1 BEST CAREER EVER");
    expect(card?.overall).toBe(
      Math.round(getPlayerRating(lebron, "careerOverall", "career")).toString(),
    );
    expect(card?.stats.map((stat) => stat.value)).toEqual([
      "27.0",
      "7.5",
      "7.4",
      "50.6",
    ]);
  });

  it("labels the card Career when the mode's own profile is missing", () => {
    const players = buildPlayerShareCardSources([rolePlayer, lebron], "current");
    const card = getPlayerShareCard(players, "Role%20Player%20Jr.", "current");

    expect(card?.profileLabel).toBe("Career");
    expect(card?.team).toBe("BOS");
    // No current profile means no season to rank against, so the rank is hidden.
    expect(card?.rankLabel).toBeNull();
    expect(card?.stats[0].value).toBe("6.1");
  });

  it("ranks players in the same order as the rankings page", () => {
    const players = [rolePlayer, lebron];
    const sources = buildPlayerShareCardSources(players, "peak");
    const expectedOrder = [...players]
      .sort(
        (a, b) =>
          getPlayerRating(b, "peakOverall", "peak") -
          getPlayerRating(a, "peakOverall", "peak"),
      )
      .map((player) => player.name);

    expect(
      [...sources]
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
        .map((source) => source.name),
    ).toEqual(expectedOrder);
  });
});

describe("getPlayerInitials", () => {
  it("uses first and last name initials and skips suffixes", () => {
    expect(getPlayerInitials("LeBron James")).toBe("LJ");
    expect(getPlayerInitials("Jaren Jackson Jr.")).toBe("JJ");
    expect(getPlayerInitials("Robert Williams III")).toBe("RW");
    expect(getPlayerInitials("De'Aaron Fox")).toBe("DF");
    expect(getPlayerInitials("Nenê")).toBe("N");
  });
});

describe("formatSeasonWindow", () => {
  it("shortens multi-season and single-season labels", () => {
    expect(formatSeasonWindow("2007-08 to 2009-10")).toBe("2007–10");
    expect(formatSeasonWindow("2017-18")).toBe("2017–18");
    expect(formatSeasonWindow("Career")).toBe("Career");
  });
});

describe("getPlayerShareDescription", () => {
  const players = buildPlayerShareCardSources([rolePlayer, lebron]);

  it("summarises the 3-year peak with stats and rank", () => {
    expect(getPlayerShareDescription(players, "lebron-james")).toBe(
      "LeBron James's 3-year peak (2007–10): 29.3 PPG, 7.6 RPG, 7.7 APG, and the #1 best peak ever. Compare players and build lineups on StatCourt.",
    );
  });

  it("describes career stats without a season window when the peak profile is missing", () => {
    expect(getPlayerShareDescription(players, "role-player-jr")).toBe(
      "Role Player Jr.'s career: 6.1 PPG, 2.2 RPG, 1.4 APG, and the #2 best peak ever. Compare players and build lineups on StatCourt.",
    );
  });

  it("stays within 160 characters by dropping the call to action for long names", () => {
    const longName = createTestPlayer({
      ...lebron,
      name: "Extraordinarily Longnamed Basketballplayer-Surname",
    });
    const description = getPlayerShareDescription(
      buildPlayerShareCardSources([longName]),
      "extraordinarily-longnamed-basketballplayer-surname",
    );

    expect(description).not.toContain("Compare players");
    expect(description?.length).toBeLessThanOrEqual(160);
  });

  it("returns null for unknown or malformed slugs so the page uses its generic copy", () => {
    expect(getPlayerShareDescription(players, "not-a-real-player")).toBeNull();
    expect(getPlayerShareDescription(players, "%E0%A4%A")).toBeNull();
  });
});

describe("current-season cards", () => {
  function withCurrentSeason(
    name: string,
    nbaId: number,
    seasonLabel: string,
    ppg: number,
  ) {
    return createTestPlayer({
      name,
      nbaId,
      team: "LAL",
      statProfiles: {
        current: {
          profileType: "current",
          seasonLabel,
          games: 70,
          ppg,
          rpg: 5,
          apg: 5,
          fgPercent: 48,
        },
      },
    });
  }

  const activeStar = withCurrentSeason("Active Star", 10, "2025-26", 31);
  const activeBench = withCurrentSeason("Active Bench", 11, "2025-26", 4);
  const retiredLegend = withCurrentSeason("Retired Legend", 12, "2002-03", 20);
  const retiredPeer = withCurrentSeason("Retired Peer", 13, "2002-03", 25);
  const players = buildPlayerShareCardSources(
    [retiredLegend, activeBench, retiredPeer, activeStar],
    "current",
  );

  it("ranks an active player only among players from this season", () => {
    const card = getPlayerShareCard(players, "active-bench", "current");

    expect(card?.profileLabel).toBe("Current · 2025-26");
    expect(card?.rankLabel).toBe("#2 IN THE NBA THIS SEASON");
    expect(card?.team).toBe("LAL");
    expect(
      getPlayerShareDescription(players, "active-star", "current"),
    ).toContain("ranked #1 in the NBA this season");
  });

  it("labels a retired player's final season and hides the rank", () => {
    const card = getPlayerShareCard(players, "retired-legend", "current");

    expect(card?.profileLabel).toBe("Final Season · 2002–03");
    expect(card?.rankLabel).toBeNull();
    expect(card?.stats[0].value).toBe("20.0");

    const description = getPlayerShareDescription(
      players,
      "retired-legend",
      "current",
    );

    expect(description).toBe(
      "Retired Legend's final season (2002–03): 20.0 PPG, 5.0 RPG, 5.0 APG. Compare players and build lineups on StatCourt.",
    );
  });

  it("keeps peak and career ranks across all players", () => {
    const peakPlayers = buildPlayerShareCardSources(
      [retiredLegend, activeBench, retiredPeer, activeStar],
      "peak",
    );

    expect(peakPlayers.map((player) => player.rank).sort()).toEqual([
      1, 2, 3, 4,
    ]);
    expect(peakPlayers.every((player) => !player.isFinalSeason)).toBe(true);
  });
});

describe("rank visibility", () => {
  const [source] = buildPlayerShareCardSources([lebron]);

  it("shows the rank on the card and in the description for the top 100", () => {
    const players = [{ ...source, rank: 100 }];

    expect(getPlayerShareCard(players, "lebron-james")?.rankLabel).toBe(
      "#100 BEST PEAK EVER",
    );
    expect(getPlayerShareDescription(players, "lebron-james")).toContain(
      "and the #100 best peak ever.",
    );
  });

  it("drops the rank from the card and description outside the top 100", () => {
    const players = [{ ...source, rank: 101 }];

    expect(getPlayerShareCard(players, "lebron-james")?.rankLabel).toBeNull();
    expect(getPlayerShareDescription(players, "lebron-james")).toBe(
      "LeBron James's 3-year peak (2007–10): 29.3 PPG, 7.6 RPG, 7.7 APG. Compare players and build lineups on StatCourt.",
    );
  });
});
