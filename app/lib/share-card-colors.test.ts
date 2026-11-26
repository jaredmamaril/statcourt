import { describe, expect, it } from "vitest";
import { getTeamColor } from "../components/court-data";
import {
  getContrastRatio,
  getMonogramColors,
  MIN_MONOGRAM_CONTRAST,
} from "./share-card-colors";
import { statcourtThemes } from "./themes";

const card = {
  background: statcourtThemes.courtDark.background,
  accent: statcourtThemes.courtDark.accent,
};

const TEAMS = [
  "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
  "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
  "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
];

describe("getContrastRatio", () => {
  it("matches the WCAG extremes", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(getContrastRatio("#08111f", "#08111f")).toBe(1);
  });
});

describe("getMonogramColors", () => {
  it("uses the accent on Peak and Career cards (no team)", () => {
    expect(getMonogramColors(null, card)).toMatchObject({
      fill: card.accent,
      ring: card.accent,
      source: "accent",
    });
  });

  it("keeps a team primary color that already has enough contrast", () => {
    // SAS silver and DEN gold are already light on the dark card.
    expect(getMonogramColors("SAS", card)).toMatchObject({
      fill: getTeamColor("SAS"),
      source: "primary",
    });
    expect(getMonogramColors("DEN", card).source).toBe("primary");
  });

  it("swaps a dark primary for the team's lighter readable color", () => {
    // MIN navy (LaMelo Ball), BKN black, UTA navy.
    expect(getMonogramColors("MIN", card)).toMatchObject({ fill: "#78BE20", source: "readable" });
    expect(getMonogramColors("BKN", card)).toMatchObject({ fill: "#F8FAFC", source: "readable" });
    expect(getMonogramColors("UTA", card)).toMatchObject({ fill: "#A855F7", source: "readable" });
  });

  it("adds an accent ring when the team has no light color", () => {
    // LAL purple has no lighter alternative.
    expect(getMonogramColors("LAL", card)).toMatchObject({
      fill: getTeamColor("LAL"),
      ring: card.accent,
      source: "accent-ring",
    });
  });

  it("always gives the circle enough contrast on the card, for every team", () => {
    for (const team of TEAMS) {
      const { fill, ring } = getMonogramColors(team, card);
      const circleContrast = Math.max(
        getContrastRatio(fill, card.background),
        getContrastRatio(ring, card.background),
      );

      expect(circleContrast, team).toBeGreaterThanOrEqual(MIN_MONOGRAM_CONTRAST);
    }
  });

  it("picks the more readable initials color for the fill", () => {
    for (const team of TEAMS) {
      const { fill, text } = getMonogramColors(team, card);
      const other = text === "#ffffff" ? card.background : "#ffffff";

      expect(getContrastRatio(fill, text), team).toBeGreaterThanOrEqual(
        getContrastRatio(fill, other),
      );
    }

    // White circle (BKN) gets dark initials.
    expect(getMonogramColors("BKN", card).text).toBe(card.background);
  });
});
