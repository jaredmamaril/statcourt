import type { LineupDetail } from "../../shared/lineup-types";

export const splashSquadsLineups = {
  "Spacing Nightmare": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokic",
    },
    overall: 95.6,
    ratings: {
      scoring: 96,
      shooting: 99,
      playmaking: 91,
      rebounding: 82,
      defense: 76,
    },
    achievements: {
      note: "Built from elite shooters, passers, and floor spacers",
    },
    archetype: "Floor Spacing Machine",
    description:
      "A shooting-heavy lineup that stretches the floor with elite range, passing, and shot-making at nearly every spot.",
    strengths: ["Shooting", "Spacing", "Offensive versatility"],
    weaknesses: ["Interior defense", "Rebounding physicality"],
  },

  "Splash Brothers Core": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokic",
    },
    overall: 95.5,
    ratings: {
      scoring: 96,
      shooting: 100,
      playmaking: 90,
      rebounding: 81,
      defense: 75,
    },
    achievements: {
      note: "Built around elite shooting gravity and perimeter shot-making",
    },
    archetype: "Shooting Gravity",
    description:
      "A perimeter-first lineup built to bend defenses with deep range, off-ball movement, and elite shot-making.",
    strengths: ["Three-point shooting", "Spacing", "Off-ball gravity"],
    weaknesses: ["Interior defense", "Physicality"],
  },

  "Five-Out Firepower": {
    players: {
      PG: "Stephen Curry",
      SG: "Michael Jordan",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokic",
    },
    overall: 95.9,
    ratings: {
      scoring: 97,
      shooting: 98,
      playmaking: 93,
      rebounding: 83,
      defense: 78,
    },
    achievements: {
      note: "Built around five players who can score or pass from spaced alignments",
    },
    archetype: "Five-Out Attack",
    description:
      "A spacing-heavy lineup where every player can punish help defense through shooting, passing, or shot creation.",
    strengths: ["Spacing", "Shot creation", "Playmaking"],
    weaknesses: ["Rim protection", "Defensive physicality"],
  },
} satisfies Record<string, LineupDetail>;
