import type { LineupDetail } from "../../shared/lineup-types";

export const lockdownSquadsLineups = {
  "All-Defense Unit": {
    players: {
      PG: "Michael Jordan",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Tim Duncan",
      C: "Hakeem Olajuwon",
    },
    overall: 95.8,
    ratings: {
      scoring: 91,
      shooting: 78,
      playmaking: 82,
      rebounding: 91,
      defense: 99,
    },
    achievements: {
      note: "Built from elite defenders across every level of the floor",
    },
    archetype: "Lockdown Unit",
    description:
      "A defense-first lineup with elite wing pressure, physicality, and dominant back-line rim protection.",
    strengths: ["Defense", "Rim protection", "Physicality"],
    weaknesses: ["Spacing consistency", "Traditional playmaking"],
  },

  "Rim Protection Wall": {
    players: {
      PG: "Michael Jordan",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Tim Duncan",
      C: "Hakeem Olajuwon",
    },
    overall: 95.6,
    ratings: {
      scoring: 90,
      shooting: 76,
      playmaking: 82,
      rebounding: 94,
      defense: 100,
    },
    achievements: {
      note: "Built around elite back-line defense and physical interior control",
    },
    archetype: "Interior Fortress",
    description:
      "A defense-heavy lineup built to erase drives, dominate the glass, and protect the paint with elite size and timing.",
    strengths: ["Rim protection", "Rebounding", "Paint defense"],
    weaknesses: ["Spacing", "Offensive tempo"],
  },

  "Switch Everything": {
    players: {
      PG: "Kobe Bryant",
      SG: "Michael Jordan",
      SF: "Kevin Durant",
      PF: "LeBron James",
      C: "Giannis Antetokounmpo",
    },
    overall: 95.2,
    ratings: {
      scoring: 95,
      shooting: 84,
      playmaking: 86,
      rebounding: 88,
      defense: 97,
    },
    achievements: {
      note: "Built around length, athleticism, and defensive versatility",
    },
    archetype: "Switching Nightmare",
    description:
      "A long, athletic lineup designed to switch across positions, pressure ball handlers, and erase mismatches.",
    strengths: ["Switchability", "Wing defense", "Transition pressure"],
    weaknesses: ["True center size", "Half-court spacing"],
  },
} satisfies Record<string, LineupDetail>;
