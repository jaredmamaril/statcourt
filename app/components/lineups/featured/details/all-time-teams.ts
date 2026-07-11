import type { LineupDetail } from "../../shared/lineup-types";

export const allTimeTeamsLineups = {
  "All-Time Lakers": {
    players: {
      PG: "Magic Johnson",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Kareem Abdul-Jabbar",
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
      note: "Built as an all-time Lakers-style powerhouse",
    },
    archetype: "Star-Powered Contender",
    description:
      "A star-loaded lineup built around size, transition pressure, post dominance, and championship shot creation.",
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
    archetype: "Defensive Juggernaut",
    description:
      "A defense-first all-time lineup built around elite perimeter pressure, rebounding, and interior protection.",
    strengths: ["Defense", "Rebounding", "Wing pressure"],
    weaknesses: ["Spacing", "Traditional point creation"],
  },

  "All-Time Warriors": {
    players: {
      PG: "Stephen Curry",
      SG: "Klay Thompson",
      SF: "Kevin Durant",
      PF: "Draymond Green",
      C: "Wilt Chamberlain",
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
      note: "Built around Warriors-style shooting, movement, defense, and historic size",
    },
    archetype: "Balanced Core",
    description:
      "A balanced all-time Warriors lineup built around Curry's gravity, elite movement shooting, defensive communication, and historic interior force.",
    strengths: ["Shooting", "Defense", "Interior pressure"],
    weaknesses: ["Traditional half-court creation", "Free-throw pressure"],
  },

  "All-Time Spurs": {
    players: {
      PG: "Tony Parker",
      SG: "Manu Ginobili",
      SF: "Kawhi Leonard",
      PF: "Tim Duncan",
      C: "David Robinson",
    },
    overall: 96.1,
    ratings: {
      scoring: 91,
      shooting: 84,
      playmaking: 90,
      rebounding: 94,
      defense: 97,
    },
    achievements: {
      note: "Built around Spurs continuity, two-way discipline, and interior dominance",
    },
    archetype: "Two-Way Dynasty",
    description:
      "A franchise-defining lineup with guard creation, wing defense, and one of the strongest defensive frontcourts ever.",
    strengths: ["Two-way balance", "Interior defense", "Continuity"],
    weaknesses: ["Three-point volume", "Transition pace"],
  },

  "All-Time Celtics": {
    players: {
      PG: "Bob Cousy",
      SG: "John Havlicek",
      SF: "Larry Bird",
      PF: "Kevin Garnett",
      C: "Bill Russell",
    },
    overall: 96.4,
    ratings: {
      scoring: 92,
      shooting: 86,
      playmaking: 94,
      rebounding: 97,
      defense: 98,
    },
    achievements: {
      note: "Built around Celtics passing, defense, rebounding, and championship identity",
    },
    archetype: "Balanced Core",
    description:
      "An all-time Celtics lineup with elite passing, defensive range, frontcourt toughness, and historic championship structure.",
    strengths: ["Defense", "Passing", "Rebounding"],
    weaknesses: ["Modern spacing", "Rim pressure"],
  },
} satisfies Record<string, LineupDetail>;
