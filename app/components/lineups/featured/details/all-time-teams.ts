import type { LineupDetail } from "../../shared/lineup-types";

export const allTimeTeamsLineups = {
  "All-Time Lakers": {
    players: {
      PG: "Magic Johnson",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Tim Duncan",
      C: "Shaquille O'Neal",
    },
    overall: 96.7,
    ratings: {
      scoring: 97,
      shooting: 76,
      playmaking: 93,
      rebounding: 94,
      defense: 91,
    },
    achievements: {
      note: "Built as a current-pool version of an all-time Lakers-style powerhouse",
    },
    archetype: "Franchise Powerhouse",
    description:
      "A star-loaded lineup built around size, transition pressure, post dominance, and elite shot creation.",
    strengths: ["Star power", "Interior scoring", "Transition offense"],
    weaknesses: ["Three-point volume", "Role balance"],
  },

  "All-Time Bulls": {
    players: {
      PG: "Michael Jordan",
      SG: "Kobe Bryant",
      SF: "Scottie Pippen",
      PF: "Dennis Rodman",
      C: "Hakeem Olajuwon",
    },
    overall: 95.7,
    ratings: {
      scoring: 92,
      shooting: 76,
      playmaking: 82,
      rebounding: 96,
      defense: 99,
    },
    achievements: {
      note: "Built around Bulls-style defense, wing pressure, and rebounding control",
    },
    archetype: "Defensive Dynasty",
    description:
      "A defense-first all-time lineup built around elite perimeter pressure, rebounding, and interior protection.",
    strengths: ["Defense", "Rebounding", "Wing pressure"],
    weaknesses: ["Spacing", "Traditional point creation"],
  },

  "All-Time Warriors": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokic",
    },
    overall: 96.0,
    ratings: {
      scoring: 97,
      shooting: 99,
      playmaking: 93,
      rebounding: 84,
      defense: 78,
    },
    achievements: {
      note: "Built around Warriors-style shooting, movement, and offensive spacing",
    },
    archetype: "Franchise Spacing Core",
    description:
      "A shooting-heavy all-time lineup built around Curry's gravity, elite wings, and playmaking from the frontcourt.",
    strengths: ["Shooting", "Spacing", "Offensive creation"],
    weaknesses: ["Interior defense", "Physical rebounding"],
  },
} satisfies Record<string, LineupDetail>;
