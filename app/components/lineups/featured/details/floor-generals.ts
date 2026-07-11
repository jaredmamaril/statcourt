import type { LineupDetail } from "../../shared/lineup-types";

export const floorGeneralsLineups = {
  "Pass First Legends": {
    players: {
      PG: "Magic Johnson",
      SG: "Stephen Curry",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokić",
    },
    overall: 96.1,
    ratings: {
      scoring: 92,
      shooting: 94,
      playmaking: 99,
      rebounding: 86,
      defense: 82,
    },
    achievements: {
      note: "Built from elite passers and offensive organizers",
    },
    archetype: "Playmaking Engine",
    description:
      "A creation-heavy lineup where every major player can pass, read the floor, and generate efficient looks.",
    strengths: ["Playmaking", "Court vision", "Offensive flow"],
    weaknesses: ["Point-of-attack defense", "Rim protection"],
  },

  "Point God Lineup": {
    players: {
      PG: "Chris Paul",
      SG: "Steve Nash",
      SF: "Magic Johnson",
      PF: "LeBron James",
      C: "Nikola Jokić",
    },
    overall: 96.4,
    ratings: {
      scoring: 93,
      shooting: 94,
      playmaking: 100,
      rebounding: 87,
      defense: 81,
    },
    achievements: {
      note: "Built from elite point guards and oversized offensive organizers",
    },
    archetype: "Playmaking Engine",
    description:
      "A lineup where multiple elite floor generals can organize possessions, control tempo, and generate high-value looks.",
    strengths: ["Playmaking", "Tempo control", "Decision-making"],
    weaknesses: ["Point-of-attack size", "Rim protection"],
  },

  "Five-Man Creation": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokić",
    },
    overall: 95.8,
    ratings: {
      scoring: 95,
      shooting: 95,
      playmaking: 96,
      rebounding: 84,
      defense: 78,
    },
    achievements: {
      note: "Built around five players who can score, pass, or create advantages",
    },
    archetype: "Positionless Basketball",
    description:
      "A fluid offensive lineup with shooting, passing, and creation coming from every spot on the floor.",
    strengths: ["Offensive flow", "Spacing", "Versatility"],
    weaknesses: ["Interior defense", "Physical rebounding"],
  },

  "Tempo Controllers": {
    players: {
      PG: "Chris Paul",
      SG: "Luka Doncic",
      SF: "LeBron James",
      PF: "Draymond Green",
      C: "Nikola Jokić",
    },
    overall: 96.0,
    ratings: {
      scoring: 91,
      shooting: 88,
      playmaking: 100,
      rebounding: 86,
      defense: 86,
    },
    achievements: {
      note: "Built around elite tempo control and five-man decision-making",
    },
    archetype: "Playmaking Engine",
    description:
      "A control-heavy lineup with multiple initiators who can slow the game down, punish rotations, and organize every possession.",
    strengths: ["Tempo control", "Playmaking", "Decision-making"],
    weaknesses: ["Vertical spacing", "Traditional rim protection"],
  },

  "Jumbo Playmakers": {
    players: {
      PG: "Magic Johnson",
      SG: "Luka Doncic",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokić",
    },
    overall: 96.5,
    ratings: {
      scoring: 94,
      shooting: 92,
      playmaking: 100,
      rebounding: 87,
      defense: 80,
    },
    achievements: {
      note: "Built around oversized creators at every position",
    },
    archetype: "Positionless Basketball",
    description:
      "A jumbo creation lineup where size, passing, and mismatch reads replace traditional positional roles.",
    strengths: ["Size", "Playmaking", "Mismatch creation"],
    weaknesses: ["Point-of-attack defense", "Rim protection"],
  },
} satisfies Record<string, LineupDetail>;
