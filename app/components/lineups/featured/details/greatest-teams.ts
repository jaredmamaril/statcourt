import type { LineupDetail } from "../../shared/lineup-types";

export const greatestTeamsLineups = {
  "1996 Bulls": {
    players: {
      PG: "Ron Harper",
      SG: "Michael Jordan",
      SF: "Scottie Pippen",
      PF: "Dennis Rodman",
      C: "Luc Longley",
    },
    overall: 98.2,
    ratings: {
      scoring: 94,
      shooting: 78,
      playmaking: 86,
      rebounding: 96,
      defense: 99,
    },
    achievements: {
      record: "72-10",
      result: "NBA Champions",
      playoffs: "15-3",
    },
    archetype: "Championship Dynasty",
    description:
      "A defense-first championship lineup built around Jordan's scoring, Pippen's versatility, and Rodman's rebounding pressure.",
    strengths: ["Defense", "Rebounding", "Transition scoring"],
    weaknesses: ["Spacing", "Bench creation"],
  },

  "2017 Warriors": {
    players: {
      PG: "Stephen Curry",
      SG: "Klay Thompson",
      SF: "Kevin Durant",
      PF: "Draymond Green",
      C: "Zaza Pachulia",
    },
    overall: 97.4,
    ratings: {
      scoring: 98,
      shooting: 99,
      playmaking: 94,
      rebounding: 84,
      defense: 88,
    },
    achievements: {
      record: "67-15",
      result: "NBA Champions",
      playoffs: "16-1",
    },
    archetype: "Spacing Dynasty",
    description:
      "A historic shooting and spacing lineup built around Curry's gravity, Durant's scoring, and elite ball movement.",
    strengths: ["Shooting", "Spacing", "Ball movement"],
    weaknesses: ["Interior size", "Traditional rim pressure"],
  },

  "1986 Celtics": {
    players: {
      PG: "Dennis Johnson",
      SG: "Danny Ainge",
      SF: "Larry Bird",
      PF: "Kevin McHale",
      C: "Robert Parish",
    },
    overall: 96.8,
    ratings: {
      scoring: 94,
      shooting: 88,
      playmaking: 92,
      rebounding: 93,
      defense: 91,
    },
    achievements: {
      record: "67-15",
      result: "NBA Champions",
      playoffs: "15-3",
    },
    archetype: "Balanced Dynasty",
    description:
      "A complete championship lineup with elite frontcourt skill, passing, rebounding, and half-court execution.",
    strengths: ["Frontcourt skill", "Passing", "Rebounding"],
    weaknesses: ["Pace", "Guard athleticism"],
  },
} satisfies Record<string, LineupDetail>;
