import type { LineupDetail } from "../../shared/lineup-types";

export const splashSquadsLineups = {
  "Spacing Nightmare": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokić",
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
      SG: "Klay Thompson",
      SF: "Ray Allen",
      PF: "Kevin Durant",
      C: "Nikola Jokić",
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
      note: "Built around elite movement shooting and floor spacing",
    },
    archetype: "Floor Spacing Machine",
    description:
      "A perimeter-first lineup built to bend defenses with deep range, off-ball movement, and frontcourt passing.",
    strengths: ["Three-point shooting", "Spacing", "Off-ball movement"],
    weaknesses: ["Point-of-attack size", "Interior defense"],
  },

  "Five-Out Firepower": {
    players: {
      PG: "Stephen Curry",
      SG: "Michael Jordan",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokić",
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
    archetype: "Floor Spacing Machine",
    description:
      "A spacing-heavy lineup where every player can punish help defense through shooting, passing, or shot creation.",
    strengths: ["Spacing", "Shot creation", "Playmaking"],
    weaknesses: ["Rim protection", "Defensive physicality"],
  },

  "Three-Point Legends": {
    players: {
      PG: "Stephen Curry",
      SG: "Klay Thompson",
      SF: "Reggie Miller",
      PF: "Larry Bird",
      C: "Dirk Nowitzki",
    },
    overall: 96.0,
    ratings: {
      scoring: 94,
      shooting: 100,
      playmaking: 88,
      rebounding: 80,
      defense: 74,
    },
    achievements: {
      note: "Built from historic shooters and off-ball spacing threats",
    },
    archetype: "Floor Spacing Machine",
    description:
      "A shooting-first lineup that floods the floor with range, movement, and impossible closeout decisions.",
    strengths: ["Three-point shooting", "Spacing", "Off-ball movement"],
    weaknesses: ["Interior defense", "Rim pressure"],
  },

  "Five-Out Creators": {
    players: {
      PG: "Steve Nash",
      SG: "Ray Allen",
      SF: "Kevin Durant",
      PF: "Dirk Nowitzki",
      C: "Nikola Jokić",
    },
    overall: 95.8,
    ratings: {
      scoring: 93,
      shooting: 99,
      playmaking: 95,
      rebounding: 83,
      defense: 76,
    },
    achievements: {
      note: "Built around five-out spacing with elite passing and shooting",
    },
    archetype: "Floor Spacing Machine",
    description:
      "A five-out lineup where every player can shoot, pass, or punish a rotation from the perimeter.",
    strengths: ["Five-out spacing", "Shooting", "Passing"],
    weaknesses: ["Point-of-attack defense", "Physicality"],
  },
} satisfies Record<string, LineupDetail>;
