import type { LineupDetail } from "../../shared/lineup-types";

export const floorGeneralsLineups = {
  "Pass First Legends": {
    players: {
      PG: "Magic Johnson",
      SG: "Stephen Curry",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokic",
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
      PG: "Magic Johnson",
      SG: "Stephen Curry",
      SF: "LeBron James",
      PF: "Larry Bird",
      C: "Nikola Jokic",
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
      note: "Built from elite primary creators and pass-first stars",
    },
    archetype: "Creation Overload",
    description:
      "A lineup where every possession can be organized by multiple elite passers, creating constant defensive stress.",
    strengths: ["Playmaking", "Decision-making", "Spacing"],
    weaknesses: ["Point-of-attack defense", "Rim protection"],
  },

  "Five-Man Creation": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokic",
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
    archetype: "Positionless Creation",
    description:
      "A fluid offensive lineup with shooting, passing, and creation coming from every spot on the floor.",
    strengths: ["Offensive flow", "Spacing", "Versatility"],
    weaknesses: ["Interior defense", "Physical rebounding"],
  },
} satisfies Record<string, LineupDetail>;
