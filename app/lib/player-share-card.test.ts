import { describe, expect, it } from "vitest";
import type { Player } from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import {
  buildPlayerShareCardSources,
  getPlayerInitials,
  getPlayerShareCard,
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
      overall: getPlayerRating(lebron, "peakOverall", "peak").toFixed(1),
      rankLabel: "#1 3-Year Peak All-Time",
      stats: [
        { label: "PPG", value: "29.3" },
        { label: "RPG", value: "7.6" },
        { label: "APG", value: "7.7" },
        { label: "FG PCT", value: "49.2" },
      ],
    });
  });

  it("picks the label, stats, rating and rank for the requested mode", () => {
    const players = buildPlayerShareCardSources([rolePlayer, lebron], "career");
    const card = getPlayerShareCard(players, "lebron-james", "career");

    expect(card?.profileLabel).toBe("Career");
    expect(card?.team).toBeNull();
    expect(card?.rankLabel).toBe("#1 Career All-Time");
    expect(card?.overall).toBe(
      getPlayerRating(lebron, "careerOverall", "career").toFixed(1),
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
    expect(card?.rankLabel).toBe("#2 Current Season");
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
      [...sources].sort((a, b) => a.rank - b.rank).map((source) => source.name),
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
