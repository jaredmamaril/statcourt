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
    archetype: "Defensive Juggernaut",
    description:
      "A defense-first lineup with elite wing pressure, physicality, and dominant back-line rim protection.",
    strengths: ["Defense", "Rim protection", "Physicality"],
    weaknesses: ["Spacing consistency", "Traditional playmaking"],
  },

  "Rim Protection Wall": {
    players: {
      PG: "Gary Payton",
      SG: "Michael Jordan",
      SF: "Bill Russell",
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
      note: "Built around perimeter disruption, legendary help defense, and interior control",
    },
    archetype: "Defensive Powerhouse",
    description:
      "A defense-heavy lineup built to erase drives, control the glass, and protect the paint with historic timing and physicality.",
    strengths: ["Rim protection", "Help defense", "Paint control"],
    weaknesses: ["Spacing", "Shot creation"],
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
    archetype: "Defensive Powerhouse",
    description:
      "A long, athletic lineup designed to switch across positions, pressure ball handlers, and erase mismatches.",
    strengths: ["Switchability", "Wing defense", "Transition pressure"],
    weaknesses: ["True center size", "Half-court spacing"],
  },

  "Perimeter Clamps": {
    players: {
      PG: "Gary Payton",
      SG: "Michael Jordan",
      SF: "Kawhi Leonard",
      PF: "Scottie Pippen",
      C: "Tim Duncan",
    },
    overall: 95.9,
    ratings: {
      scoring: 88,
      shooting: 80,
      playmaking: 84,
      rebounding: 90,
      defense: 100,
    },
    achievements: {
      note: "Built from elite perimeter stoppers and back-line discipline",
    },
    archetype: "Defensive Juggernaut",
    description:
      "A pressure-heavy defensive lineup built to erase ball handlers, shrink passing lanes, and funnel drives into Duncan.",
    strengths: ["Perimeter defense", "Defensive IQ", "Help coverage"],
    weaknesses: ["Spacing", "Half-court creation"],
  },

  "Switch Wall": {
    players: {
      PG: "Jrue Holiday",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Giannis Antetokounmpo",
      C: "Kevin Garnett",
    },
    overall: 95.4,
    ratings: {
      scoring: 90,
      shooting: 80,
      playmaking: 86,
      rebounding: 91,
      defense: 99,
    },
    achievements: {
      note: "Built around switchable size, pressure defense, and physical coverage",
    },
    archetype: "Defensive Powerhouse",
    description:
      "A switch-heavy lineup with enough length and mobility to cover every action without giving up paint protection.",
    strengths: ["Switchability", "Physical defense", "Transition pressure"],
    weaknesses: ["Three-point volume", "Pure spacing"],
  },
} satisfies Record<string, LineupDetail>;
