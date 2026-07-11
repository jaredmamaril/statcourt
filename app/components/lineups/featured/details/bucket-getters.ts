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
    archetype: "Iso Superteam",
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
    archetype: "Offensive Superteam",
    description:
      "A scoring-heavy lineup with elite rim pressure, midrange shot creation, deep shooting, and late-clock bailout options.",
    strengths: ["Scoring", "Shot creation", "Late-clock offense"],
    weaknesses: ["Defensive balance", "Ball sharing"],
  },

  "Wing Assassins": {
    players: {
      PG: "LeBron James",
      SG: "Tracy McGrady",
      SF: "Kevin Durant",
      PF: "Kawhi Leonard",
      C: "Giannis Antetokounmpo",
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
      note: "Built around oversized creators, long wings, and two-way pressure",
    },
    archetype: "Two-Way Dynasty",
    description:
      "A wing-driven lineup built around length, physical mismatches, isolation scoring, and defensive versatility.",
    strengths: ["Wing scoring", "Switchability", "Rim pressure"],
    weaknesses: ["Traditional spacing", "Pure point guard play"],
  },

  "Midrange Masters": {
    players: {
      PG: "Chris Paul",
      SG: "Michael Jordan",
      SF: "Kawhi Leonard",
      PF: "Kevin Durant",
      C: "Dirk Nowitzki",
    },
    overall: 95.7,
    ratings: {
      scoring: 98,
      shooting: 92,
      playmaking: 88,
      rebounding: 82,
      defense: 87,
    },
    achievements: {
      note: "Built from elite pull-up scorers and half-court shot makers",
    },
    archetype: "Iso Superteam",
    description:
      "A half-court scoring lineup loaded with midrange creators who can punish switches and generate clean looks late in the clock.",
    strengths: ["Midrange scoring", "Shot creation", "Late-clock offense"],
    weaknesses: ["Rim protection", "Pace"],
  },

  "Paint Punishers": {
    players: {
      PG: "Luka Doncic",
      SG: "Dwyane Wade",
      SF: "LeBron James",
      PF: "Giannis Antetokounmpo",
      C: "Shaquille O'Neal",
    },
    overall: 96.0,
    ratings: {
      scoring: 98,
      shooting: 78,
      playmaking: 91,
      rebounding: 92,
      defense: 86,
    },
    achievements: {
      note: "Built around downhill pressure and constant paint collapse",
    },
    archetype: "Rim Pressure Unit",
    description:
      "A power-heavy lineup built to attack the rim, overwhelm help defense, and force rotations from every angle.",
    strengths: ["Rim pressure", "Free-throw pressure", "Physical scoring"],
    weaknesses: ["Spacing", "Perimeter volume"],
  },
} satisfies Record<string, LineupDetail>;
