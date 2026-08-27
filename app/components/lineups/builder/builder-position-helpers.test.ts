import { describe, expect, it } from "vitest";
import type { Player } from "../../court-data";
import {
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  getPositionPenalty,
} from "./builder-position-helpers";

function createTestPlayer(overrides: Partial<Player>): Player {
  const player: Player = {
    id: 1,
    name: "Test Player",
    team: "FA",
    position: "G",
    jerseyNumber: 0,
    heightInches: 75,
    weightPounds: 190,
    apiPosition: "Guard",
    stats: {
      games: 800,
      ppg: 18,
      rpg: 4,
      apg: 5,
      spg: 1,
      bpg: 0.2,
      fgPercent: 45,
      threePercent: 36,
      ftPercent: 80,
      threeAttemptsPerGame: 4,
    },
    statProfiles: {
      career: {
        profileType: "career",
        games: 800,
        ppg: 18,
        rpg: 4,
        apg: 5,
        spg: 1,
        bpg: 0.2,
        fgPercent: 45,
        threePercent: 36,
        ftPercent: 80,
        threeAttemptsPerGame: 4,
      },
    },
    ratings: {
      defense: 75,
      starPower: 75,
      careerLegacy: 70,
    },
    ...overrides,
  };

  if (!overrides.statProfiles) {
    player.statProfiles = {
      career: {
        profileType: "career",
        ...player.stats,
      },
    };
  }

  return player;
}

describe("builder position fit", () => {
  it("keeps lead guards natural at guard slots", () => {
    const curry = createTestPlayer({
      name: "Stephen Curry",
      team: "GSW",
      position: "G",
      heightInches: 74,
      weightPounds: 185,
      apiPosition: "Guard",
      stats: {
        games: 950,
        ppg: 24.8,
        rpg: 4.7,
        apg: 6.4,
        spg: 1.5,
        bpg: 0.2,
        fgPercent: 47.1,
        threePercent: 42.4,
        ftPercent: 91,
        threeAttemptsPerGame: 9.4,
      },
    });

    expect(getPositionFit(curry, "PG")).toBe("natural");
    expect(getPositionFit(curry, "SG")).toBe("natural");
    expect(getPositionFit(curry, "C")).toBe("mismatch");
  });

  it("treats Dirk as a natural power forward with center flexibility", () => {
    const dirk = createTestPlayer({
      name: "Dirk Nowitzki",
      team: "DAL",
      position: "F",
      heightInches: 84,
      weightPounds: 245,
      apiPosition: "Forward-Center",
      stats: {
        games: 1522,
        ppg: 20.7,
        rpg: 7.5,
        apg: 2.4,
        spg: 0.8,
        bpg: 0.8,
        fgPercent: 47.1,
        threePercent: 38,
        ftPercent: 87.9,
        threeAttemptsPerGame: 3.4,
      },
      ratings: {
        defense: 70,
        starPower: 95,
        careerLegacy: 95,
      },
    });

    expect(getPositionFit(dirk, "PF")).toBe("natural");
    expect(getPositionFit(dirk, "C")).toBe("flex");
    expect(getPositionFit(dirk, "PG")).toBe("mismatch");
  });

  it("keeps dominant centers natural at center while allowing power forward flex", () => {
    const embiid = createTestPlayer({
      name: "Joel Embiid",
      team: "PHI",
      position: "C",
      heightInches: 84,
      weightPounds: 280,
      apiPosition: "Center",
      stats: {
        games: 520,
        ppg: 27.7,
        rpg: 11,
        apg: 3.7,
        spg: 0.9,
        bpg: 1.7,
        fgPercent: 50.4,
        threePercent: 34.1,
        ftPercent: 82.7,
        threeAttemptsPerGame: 3.4,
      },
      ratings: {
        defense: 88,
        starPower: 96,
        careerLegacy: 82,
      },
    });

    expect(getPositionFit(embiid, "C")).toBe("natural");
    expect(getPositionFit(embiid, "PF")).toBe("flex");
    expect(getPositionFit(embiid, "SF")).toBe("mismatch");
  });

  it("does not treat jumbo playmakers as natural center fits", () => {
    const lebron = createTestPlayer({
      name: "LeBron James",
      team: "LAL",
      position: "F",
      heightInches: 81,
      weightPounds: 250,
      apiPosition: "Forward",
      stats: {
        games: 1500,
        ppg: 27,
        rpg: 7.4,
        apg: 8.3,
        spg: 1.5,
        bpg: 0.7,
        fgPercent: 50.4,
        threePercent: 34.5,
        ftPercent: 73.4,
        threeAttemptsPerGame: 4.6,
      },
      ratings: {
        defense: 89,
        starPower: 100,
        careerLegacy: 100,
      },
    });

    expect(getPositionFit(lebron, "SF")).toBe("natural");
    expect(getPositionFit(lebron, "PF")).toBe("natural");
    expect(getPositionFit(lebron, "PG")).toBe("flex");
    expect(getPositionFit(lebron, "C")).toBe("reach");
  });

  it("applies the position-fit penalty to builder ratings", () => {
    const player = createTestPlayer({
      stats: {
        games: 800,
        ppg: 20,
        rpg: 5,
        apg: 5,
        spg: 1,
        bpg: 0.2,
        fgPercent: 46,
        threePercent: 37,
        ftPercent: 82,
        threeAttemptsPerGame: 5,
      },
    });

    const naturalRating = getBuilderPlayerRatingForPosition(
      player,
      "PG",
      "career",
    );
    const mismatchRating = getBuilderPlayerRatingForPosition(
      player,
      "C",
      "career",
    );

    expect(getPositionPenalty("natural")).toBe(0);
    expect(getPositionPenalty("mismatch")).toBe(10);
    expect(naturalRating - mismatchRating).toBe(10);
  });
});
