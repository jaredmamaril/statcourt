import type { LineupDetail } from "../../shared/lineup-types";

export const bucketGettersLineups = {
  "Isolation Killers": {
    players: {
      PG: "Kobe Bryant",
      SG: "Michael Jordan",
      SF: "Kevin Durant",
      PF: "LeBron James",
      C: "Hakeem Olajuwon",
    },
    overall: 95.4,
    ratings: {
      scoring: 99,
      shooting: 88,
      playmaking: 84,
      rebounding: 82,
      defense: 88,
    },
    achievements: {
      note: "Built from elite isolation scorers",
    },
    archetype: "Shot Creation Core",
    description:
      "A lineup built around elite one-on-one scorers who can create difficult shots without needing much setup.",
    strengths: ["Shot creation", "Clutch scoring", "Mismatch hunting"],
    weaknesses: ["Ball movement", "Off-ball balance"],
  },

  "Pure Scorers": {
    players: {
      PG: "Stephen Curry",
      SG: "Michael Jordan",
      SF: "Kobe Bryant",
      PF: "Kevin Durant",
      C: "Shaquille O'Neal",
    },
    overall: 96.2,
    ratings: {
      scoring: 99,
      shooting: 91,
      playmaking: 84,
      rebounding: 84,
      defense: 84,
    },
    achievements: {
      note: "Built from elite volume scorers across every scoring zone",
    },
    archetype: "Three-Level Scoring Core",
    description:
      "A scoring-heavy lineup with elite rim pressure, midrange shot creation, deep shooting, and late-clock bailout options.",
    strengths: ["Scoring", "Shot creation", "Late-clock offense"],
    weaknesses: ["Defensive balance", "Ball sharing"],
  },

  "Wing Assassins": {
    players: {
      PG: "LeBron James",
      SG: "Michael Jordan",
      SF: "Kobe Bryant",
      PF: "Kevin Durant",
      C: "Hakeem Olajuwon",
    },
    overall: 95.9,
    ratings: {
      scoring: 98,
      shooting: 86,
      playmaking: 88,
      rebounding: 86,
      defense: 91,
    },
    achievements: {
      note: "Built around oversized creators and two-way wing pressure",
    },
    archetype: "Two-Way Shot Creation",
    description:
      "A wing-driven lineup built around elite isolation scoring, physical mismatches, and defensive versatility.",
    strengths: ["Wing scoring", "Switchability", "Mismatch hunting"],
    weaknesses: ["Traditional spacing", "Pure point guard play"],
  },
} satisfies Record<string, LineupDetail>;
