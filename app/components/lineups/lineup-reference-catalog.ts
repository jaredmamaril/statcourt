export type LineupReferenceTier =
  | "elite"
  | "strong"
  | "balanced"
  | "flawed"
  | "bad";

export type LineupReferenceScores = {
  offense: number;
  defense: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  starPower: number;
  overall: number;
};

export type LineupReference = {
  name: string;
  tier: LineupReferenceTier;
  archetype: string;
  description: string;
  scores: LineupReferenceScores;
  traits: string[];
};

export const lineupReferenceCatalog: LineupReference[] = [
  {
    name: "2017 Warriors",
    tier: "elite",
    archetype: "Floor Spacing Machine",
    description: "Elite spacing, shooting gravity, and offensive flow.",
    scores: {
      offense: 96,
      defense: 86,
      shooting: 99,
      playmaking: 92,
      rebounding: 78,
      starPower: 96,
      overall: 97,
    },
    traits: ["Spacing", "Playmaking", "Star Power"],
  },
  {
    name: "1986 Celtics",
    tier: "elite",
    archetype: "Balanced Core",
    description: "High-IQ passing, frontcourt skill, and connected offense.",
    scores: {
      offense: 91,
      defense: 88,
      shooting: 84,
      playmaking: 92,
      rebounding: 90,
      starPower: 93,
      overall: 96,
    },
    traits: ["Passing", "Size", "Balance"],
  },
  {
    name: "2013 Heat",
    tier: "elite",
    archetype: "Transition Attack",
    description:
      "Downhill pressure, transition attacks, and elite athletic creation.",
    scores: {
      offense: 92,
      defense: 90,
      shooting: 78,
      playmaking: 86,
      rebounding: 76,
      starPower: 95,
      overall: 96,
    },
    traits: ["Transition", "Defense", "Star Power"],
  },
  {
    name: "2001 Lakers",
    tier: "elite",
    archetype: "Paint Control Unit",
    description:
      "Interior dominance paired with elite perimeter shot creation.",
    scores: {
      offense: 90,
      defense: 84,
      shooting: 65,
      playmaking: 72,
      rebounding: 95,
      starPower: 94,
      overall: 95,
    },
    traits: ["Paint Pressure", "Rebounding", "Star Power"],
  },
  {
    name: "1996 Bulls",
    tier: "elite",
    archetype: "Defensive Juggernaut",
    description: "Elite defense, rebounding, and physical control.",
    scores: {
      offense: 89,
      defense: 97,
      shooting: 76,
      playmaking: 82,
      rebounding: 92,
      starPower: 96,
      overall: 98,
    },
    traits: ["Defense", "Rebounding", "Pressure"],
  },
  {
    name: "All-Time Lakers",
    tier: "elite",
    archetype: "Star-Powered Contender",
    description: "Legendary top-end talent across every position.",
    scores: {
      offense: 94,
      defense: 88,
      shooting: 75,
      playmaking: 90,
      rebounding: 94,
      starPower: 99,
      overall: 97,
    },
    traits: ["Stars", "Size", "Creation"],
  },
  {
    name: "Modern Five-Out",
    tier: "strong",
    archetype: "Floor Spacing Machine",
    description: "Strong shooting and creation with enough size to stay viable.",
    scores: {
      offense: 88,
      defense: 74,
      shooting: 91,
      playmaking: 82,
      rebounding: 68,
      starPower: 78,
      overall: 82,
    },
    traits: ["Spacing", "Creation", "Small Ball"],
  },
  {
    name: "Point-Center Hub",
    tier: "strong",
    archetype: "Point-Center Offense",
    description: "Frontcourt passing anchors a balanced half-court offense.",
    scores: {
      offense: 84,
      defense: 78,
      shooting: 72,
      playmaking: 88,
      rebounding: 82,
      starPower: 76,
      overall: 81,
    },
    traits: ["Frontcourt Passing", "Size", "Half-Court Offense"],
  },
  {
    name: "Switchable Defense",
    tier: "strong",
    archetype: "Defensive Powerhouse",
    description: "Long, versatile defenders cover weak points across the floor.",
    scores: {
      offense: 74,
      defense: 90,
      shooting: 68,
      playmaking: 70,
      rebounding: 84,
      starPower: 70,
      overall: 80,
    },
    traits: ["Defense", "Switching", "Rebounding"],
  },
  {
    name: "Balanced Playoff Core",
    tier: "balanced",
    archetype: "Balanced Core",
    description: "Solid across every category without one elite pressure point.",
    scores: {
      offense: 78,
      defense: 78,
      shooting: 76,
      playmaking: 76,
      rebounding: 76,
      starPower: 68,
      overall: 76,
    },
    traits: ["Balance", "Depth", "No Major Weakness"],
  },
  {
    name: "Defense-First Grind",
    tier: "balanced",
    archetype: "Defensive Powerhouse",
    description: "Defense and rebounding keep the team stable despite limited offense.",
    scores: {
      offense: 66,
      defense: 86,
      shooting: 58,
      playmaking: 62,
      rebounding: 84,
      starPower: 60,
      overall: 72,
    },
    traits: ["Defense", "Rebounding", "Limited Creation"],
  },
  {
    name: "Guard Creation Unit",
    tier: "balanced",
    archetype: "Playmaking Engine",
    description: "Backcourt creation drives the offense, but size is a concern.",
    scores: {
      offense: 80,
      defense: 60,
      shooting: 76,
      playmaking: 84,
      rebounding: 50,
      starPower: 68,
      overall: 70,
    },
    traits: ["Guards", "Playmaking", "Undersized"],
  },
  {
    name: "Rim Pressure Group",
    tier: "balanced",
    archetype: "Rim Pressure Unit",
    description: "Paint pressure creates easy offense while shooting stays uneven.",
    scores: {
      offense: 78,
      defense: 74,
      shooting: 55,
      playmaking: 68,
      rebounding: 82,
      starPower: 66,
      overall: 72,
    },
    traits: ["Rim Pressure", "Size", "Weak Spacing"],
  },
  {
    name: "Oversized Frontcourt",
    tier: "flawed",
    archetype: "Size Over Skill",
    description: "Great size and rebounding, but weak guard play and spacing.",
    scores: {
      offense: 64,
      defense: 78,
      shooting: 42,
      playmaking: 45,
      rebounding: 91,
      starPower: 58,
      overall: 67,
    },
    traits: ["Size", "Rebounding", "Poor Spacing"],
  },
  {
    name: "All Bigs Lineup",
    tier: "flawed",
    archetype: "Size Over Skill",
    description:
      "Massive interior advantage with major ball-handling and spacing problems.",
    scores: {
      offense: 60,
      defense: 82,
      shooting: 35,
      playmaking: 40,
      rebounding: 96,
      starPower: 70,
      overall: 65,
    },
    traits: ["Size", "No Guards", "Poor Spacing"],
  },
  {
    name: "Small Guard Overload",
    tier: "flawed",
    archetype: "Guard Creation Overload",
    description:
      "Plenty of handling and shot creation, but weak defensive size and rebounding.",
    scores: {
      offense: 88,
      defense: 42,
      shooting: 88,
      playmaking: 94,
      rebounding: 28,
      starPower: 84,
      overall: 64,
    },
    traits: ["Guards", "Creation", "No Size"],
  },
  {
    name: "Five Scorers No Defense",
    tier: "flawed",
    archetype: "One-Way Offense",
    description:
      "Scoring talent is real, but defensive resistance and rebounding lag behind.",
    scores: {
      offense: 88,
      defense: 45,
      shooting: 82,
      playmaking: 66,
      rebounding: 48,
      starPower: 78,
      overall: 66,
    },
    traits: ["Scoring", "Weak Defense", "Weak Rebounding"],
  },
  {
    name: "No Primary Creator",
    tier: "flawed",
    archetype: "Balanced Core",
    description: "Decent role balance with no clear advantage creator.",
    scores: {
      offense: 58,
      defense: 72,
      shooting: 68,
      playmaking: 42,
      rebounding: 70,
      starPower: 45,
      overall: 61,
    },
    traits: ["Role Players", "Limited Creation", "Average Balance"],
  },
  {
    name: "No Spacing Frontcourt",
    tier: "bad",
    archetype: "Size Over Skill",
    description:
      "Interior bodies clog the floor and make half-court offense difficult.",
    scores: {
      offense: 52,
      defense: 68,
      shooting: 24,
      playmaking: 45,
      rebounding: 86,
      starPower: 48,
      overall: 55,
    },
    traits: ["Crowded Paint", "No Spacing", "Rebounding"],
  },
  {
    name: "Undersized Defense",
    tier: "bad",
    archetype: "Guard Creation Overload",
    description:
      "Speed and handling are present, but the lineup gives up too much size.",
    scores: {
      offense: 66,
      defense: 35,
      shooting: 72,
      playmaking: 78,
      rebounding: 28,
      starPower: 50,
      overall: 52,
    },
    traits: ["Speed", "Small Guards", "No Interior Defense"],
  },
  {
    name: "Rebounding Only",
    tier: "bad",
    archetype: "Size Over Skill",
    description:
      "The lineup controls missed shots but lacks creation, spacing, and pace.",
    scores: {
      offense: 42,
      defense: 64,
      shooting: 28,
      playmaking: 30,
      rebounding: 92,
      starPower: 36,
      overall: 49,
    },
    traits: ["Rebounding", "No Creation", "No Shooting"],
  },
  {
    name: "Low Star Power Unit",
    tier: "bad",
    archetype: "Balanced Core",
    description:
      "The shape is passable, but there is not enough top-end talent to pressure elite teams.",
    scores: {
      offense: 55,
      defense: 58,
      shooting: 57,
      playmaking: 54,
      rebounding: 58,
      starPower: 25,
      overall: 50,
    },
    traits: ["Depth", "Low Star Power", "Limited Ceiling"],
  },
  {
    name: "One-Way Offense",
    tier: "flawed",
    archetype: "One-Way Offense",
    description:
      "The scoring profile is dangerous, but the defense leaves too many openings.",
    scores: {
      offense: 84,
      defense: 40,
      shooting: 80,
      playmaking: 70,
      rebounding: 52,
      starPower: 68,
      overall: 62,
    },
    traits: ["Offense", "Shooting", "Weak Defense"],
  },
  {
    name: "Development Bench Group",
    tier: "bad",
    archetype: "Development Core",
    description:
      "Young or low-impact players create a low-floor lineup without a clear identity.",
    scores: {
      offense: 44,
      defense: 44,
      shooting: 46,
      playmaking: 42,
      rebounding: 46,
      starPower: 28,
      overall: 43,
    },
    traits: ["Low Sample", "Low Ceiling", "Developmental"],
  },
];
