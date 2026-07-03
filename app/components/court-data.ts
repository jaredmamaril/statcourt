// This file contains the data and types related to players and their stats for the different pages.

// Global components

// Types for player positions and teams
export type Position = "G" | "F" | "C";
export type LineupSlot = "PG" | "SG" | "SF" | "PF" | "C";

export type Team =
  | "FA"
  | "ATL"
  | "BKN"
  | "BOS"
  | "CHA"
  | "CHI"
  | "CLE"
  | "DAL"
  | "DEN"
  | "DET"
  | "GSW"
  | "HOU"
  | "IND"
  | "LAC"
  | "LAL"
  | "MEM"
  | "MIA"
  | "MIL"
  | "MIN"
  | "NOP"
  | "NYK"
  | "OKC"
  | "ORL"
  | "PHI"
  | "PHX"
  | "POR"
  | "SAC"
  | "SAS"
  | "TOR"
  | "UTA"
  | "WAS";

export const teamCodeAliases: Record<string, Team> = {
  // Lakers
  MNL: "LAL",
  // Warriors
  PHW: "GSW",
  SFW: "GSW",
  // Hawks
  STL: "ATL",
  MLH: "ATL",
  TRI: "ATL",
  // Kings
  ROC: "SAC",
  CIN: "SAC",
  KCO: "SAC",
  KCK: "SAC",
  // Thunder
  SEA: "OKC",
  // Nets
  NJN: "BKN",
  NYN: "BKN",
  // Pelicans
  NOH: "NOP",
  NOK: "NOP",
  // Hornets
  CHH: "CHA",
  // Grizzlies
  VAN: "MEM",
  // Wizards
  BAL: "WAS",
  CAP: "WAS",
  WSB: "WAS",
  // Clippers
  BUF: "LAC",
  SDC: "LAC",
  // Pistons
  FTW: "DET",
  // 76ers
  SYR: "PHI",
  // Jazz
  NOJ: "UTA",
  BLT: "WAS", // Baltimore Bullets
  GOS: "GSW", // Golden State Warriors old code
  MIH: "ATL", // Milwaukee Hawks
  SDR: "HOU", // San Diego Rockets
  // Defunct/no current franchise
  BOM: "FA", // St. Louis Bombers, defunct
  INO: "FA",
  AND: "FA",
  SHE: "FA",
  WAT: "FA",
  CLR: "FA",
  PIT: "FA",
  PRO: "FA",
  CHS: "FA",
  STB: "FA",
};

export const teamColors: Record<Team, string> = {
  FA: "#94A3B8",
  ATL: "#e03a3e",
  BKN: "#000000",
  BOS: "#007a33",
  CHA: "#1d1160",
  CHI: "#a80f35",
  CLE: "#860038",
  DAL: "#00538c",
  DEN: "#d89f12",
  DET: "#c8102e",
  GSW: "#1d428a",
  HOU: "#ce1141",
  IND: "#002d62",
  LAC: "#c8102e",
  LAL: "#552583",
  MEM: "#002b5c",
  MIA: "#98002e",
  MIL: "#00471b",
  MIN: "#0c2340",
  NOP: "#0c2340",
  NYK: "#003da5",
  OKC: "#007ac1",
  ORL: "#0077c8",
  PHI: "#006bb6",
  PHX: "#e56020",
  POR: "#e03a3e",
  SAC: "#5a2d82",
  SAS: "#c4ced4",
  TOR: "#ce1141",
  UTA: "#002b5c",
  WAS: "#002b5c",
};

export const historicTeamColors: Record<string, string> = {
  BAL: "#002b5c",
  BLT: "#002b5c",
  BOM: "#c8102e",
  BUF: "#e85d04",
  CHH: "#1d1160",
  CHS: "#ce1141",
  CIN: "#c8102e",
  FTW: "#c8102e",
  GOS: "#1d428a",
  INO: "#94A3B8",
  KCK: "#5a2d82",
  MIH: "#e03a3e",
  MNL: "#552583",
  NJN: "#002a60",
  NOH: "#00778b",
  NOK: "#00778b",
  PHW: "#1d428a",
  ROC: "#5a2d82",
  SDC: "#c8102e",
  SDR: "#ce1141",
  SEA: "#00653a",
  SFW: "#1d428a",
  STL: "#c8102e",
  VAN: "#00a3ad",
};

export function normalizeTeamCode(team: string): Team {
  if (!team) return "FA";

  if (team in teamColors) {
    return team as Team;
  }

  return teamCodeAliases[team] ?? "FA";
}

export const teamLogos: Record<Team, string> = {
  FA: "/team-logos/blank-logo.png",
  ATL: "/team-logos/current/atl.svg",
  BKN: "/team-logos/current/bkn.svg",
  BOS: "/team-logos/current/bos.svg",
  CHA: "/team-logos/current/cha.svg",
  CHI: "/team-logos/current/chi.svg",
  CLE: "/team-logos/current/cle.svg",
  DAL: "/team-logos/current/dal.svg",
  DEN: "/team-logos/current/den.svg",
  DET: "/team-logos/current/det.svg",
  GSW: "/team-logos/current/gsw.svg",
  HOU: "/team-logos/current/hou.svg",
  IND: "/team-logos/current/ind.svg",
  LAC: "/team-logos/current/lac.svg",
  LAL: "/team-logos/current/lal.svg",
  MEM: "/team-logos/current/mem.svg",
  MIA: "/team-logos/current/mia.svg",
  MIL: "/team-logos/current/mil.svg",
  MIN: "/team-logos/current/min.svg",
  NOP: "/team-logos/current/nop.svg",
  NYK: "/team-logos/current/nyk.svg",
  OKC: "/team-logos/current/okc.svg",
  ORL: "/team-logos/current/orl.svg",
  PHI: "/team-logos/current/phi.svg",
  PHX: "/team-logos/current/phx.svg",
  POR: "/team-logos/current/por.svg",
  SAC: "/team-logos/current/sac.svg",
  SAS: "/team-logos/current/sas.svg",
  TOR: "/team-logos/current/tor.svg",
  UTA: "/team-logos/current/uta.svg",
  WAS: "/team-logos/current/was.svg",
};

export const historicTeamLogos: Record<string, string> = {
  BAL: "/team-logos/historic/bal.png",
  BLT: "/team-logos/historic/bal.png",
  BOM: "/team-logos/historic/bom.webp",
  BUF: "/team-logos/historic/buf.png",
  CHH: "/team-logos/historic/chh.png",
  CHS: "/team-logos/historic/chs.png",
  CIN: "/team-logos/historic/cin.png",
  FTW: "/team-logos/historic/ftw.png",
  GOS: "/team-logos/historic/gos.png",
  INO: "/team-logos/historic/ino.png",
  KCK: "/team-logos/historic/kck.png",
  MIH: "/team-logos/historic/mih.png",
  MNL: "/team-logos/historic/mnl.png",
  NJN: "/team-logos/historic/njn.png",
  NOH: "/team-logos/historic/noh.png",
  NOK: "/team-logos/historic/noh.png",
  PHW: "/team-logos/historic/phw.png",
  ROC: "/team-logos/historic/roc.png",
  SDC: "/team-logos/historic/sdc.png",
  SDR: "/team-logos/historic/sdr.png",
  SEA: "/team-logos/historic/sea.png",
  SFW: "/team-logos/historic/sfw.png",
  STL: "/team-logos/historic/stl.png",
  VAN: "/team-logos/historic/van.png",
};

export function getTeamColor(team: string) {
  return historicTeamColors[team] ?? teamColors[normalizeTeamCode(team)];
}

const readableTeamColors: Partial<Record<Team, string>> = {
  BKN: "#F8FAFC",
  NOP: "#C6A15B",
  WAS: "#E31837",
  DAL: "#38BDF8",
  ORL: "#38BDF8",
  SAS: "#CBD5E1",
  MEM: "#7DD3FC",
  IND: "#FACC15",
  MIN: "#78BE20",
  UTA: "#A855F7",
  CHA: "#00B2A9",
};

export function getReadableTeamColor(team: string) {
  const normalizedTeam = normalizeTeamCode(team);

  return (
    readableTeamColors[normalizedTeam] ??
    historicTeamColors[team] ??
    teamColors[normalizedTeam]
  );
}

export function getTeamLogo(team: string) {
  return historicTeamLogos[team] ?? teamLogos[normalizeTeamCode(team)];
}

type CorePlayerStatKey =
  | "ppg"
  | "rpg"
  | "apg"
  | "fgPercent"
  | "threePercent"
  | "ftPercent";

// Career per-game averages and career shooting percentages
export type PlayerStats = {
  games?: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg?: number;
  bpg?: number;
  fgPercent: number;
  threePercent: number;
  ftPercent: number;
};

export type PlayerRatings = {
  defense: number;
  starPower: number;
  careerLegacy?: number;
};

// Future: adding more stats or player attributes as needed, such as player position, team, or career highlights, to enhance the user experience and provide more comprehensive information about each player.
export type Player = {
  id: number;
  nbaId?: number; // for NBA CDN headshots
  name: string;
  fallbackImage?: string; // Local fallback if CDN headshot is unavailable
  team: Team;
  position: Position;
  jerseyNumber: number;
  ratings: PlayerRatings;
  stats: PlayerStats;
};

// Fallback player dataset. Stats should use career averages, not peak season or current-season stats.
export const players: Player[] = [
  {
    id: 1,
    nbaId: 2544,
    name: "LeBron James",
    fallbackImage: "/players/headshots/lebron-james.png",
    team: "LAL",
    position: "F",
    jerseyNumber: 23,
    ratings: {
      defense: 89,
      starPower: 100,
    },
    stats: {
      ppg: 27.0,
      rpg: 7.4,
      apg: 8.3,
      fgPercent: 50.4,
      threePercent: 34.5,
      ftPercent: 73.4,
    },
  },

  {
    id: 2,
    nbaId: 893,
    name: "Michael Jordan",
    fallbackImage: "/players/headshots/michael-jordan.png",
    team: "CHI",
    position: "G",
    jerseyNumber: 23,
    ratings: {
      defense: 96,
      starPower: 100,
    },
    stats: {
      ppg: 30.1,
      rpg: 6.2,
      apg: 3.4,
      fgPercent: 49.7,
      threePercent: 37.9,
      ftPercent: 83.5,
    },
  },

  {
    id: 3,
    nbaId: 977,
    name: "Kobe Bryant",
    fallbackImage: "/players/headshots/kobe-bryant.png",
    team: "LAL",
    position: "G",
    jerseyNumber: 24,
    ratings: {
      defense: 91,
      starPower: 97,
    },
    stats: {
      ppg: 25.0,
      rpg: 5.2,
      apg: 4.7,
      fgPercent: 44.7,
      threePercent: 32.9,
      ftPercent: 83.7,
    },
  },

  {
    id: 4,
    nbaId: 201939,
    name: "Stephen Curry",
    fallbackImage: "/players/headshots/stephen-curry.png",
    team: "GSW",
    position: "G",
    jerseyNumber: 30,
    ratings: {
      defense: 72,
      starPower: 98,
    },
    stats: {
      ppg: 24.2,
      rpg: 4.6,
      apg: 6.5,
      fgPercent: 47.7,
      threePercent: 43.3,
      ftPercent: 90.6,
    },
  },

  {
    id: 5,
    nbaId: 201142,
    name: "Kevin Durant",
    team: "PHX",
    position: "F",
    jerseyNumber: 35,
    ratings: {
      defense: 82,
      starPower: 96,
    },
    stats: {
      ppg: 27.3,
      rpg: 7.0,
      apg: 4.4,
      fgPercent: 50.1,
      threePercent: 38.7,
      ftPercent: 88.4,
    },
  },

  {
    id: 6,
    nbaId: 406,
    name: "Shaquille O'Neal",
    team: "LAL",
    position: "C",
    jerseyNumber: 34,
    ratings: {
      defense: 88,
      starPower: 97,
    },
    stats: {
      ppg: 23.7,
      rpg: 10.9,
      apg: 2.5,
      fgPercent: 58.2,
      threePercent: 4.5,
      ftPercent: 52.7,
    },
  },

  {
    id: 7,
    nbaId: 77142,
    name: "Magic Johnson",
    team: "LAL",
    position: "G",
    jerseyNumber: 32,
    ratings: {
      defense: 78,
      starPower: 98,
    },
    stats: {
      ppg: 19.5,
      rpg: 7.2,
      apg: 11.2,
      fgPercent: 52.0,
      threePercent: 30.3,
      ftPercent: 84.8,
    },
  },

  {
    id: 8,
    nbaId: 1449,
    name: "Larry Bird",
    team: "BOS",
    position: "F",
    jerseyNumber: 33,
    ratings: {
      defense: 82,
      starPower: 97,
    },
    stats: {
      ppg: 24.3,
      rpg: 10.0,
      apg: 6.3,
      fgPercent: 49.6,
      threePercent: 37.6,
      ftPercent: 88.6,
    },
  },

  {
    id: 9,
    nbaId: 1495,
    name: "Tim Duncan",
    team: "SAS",
    position: "F",
    jerseyNumber: 21,
    ratings: {
      defense: 97,
      starPower: 94,
    },
    stats: {
      ppg: 19.0,
      rpg: 10.8,
      apg: 3.0,
      fgPercent: 50.6,
      threePercent: 17.9,
      ftPercent: 69.6,
    },
  },

  {
    id: 10,
    nbaId: 165,
    name: "Hakeem Olajuwon",
    team: "HOU",
    position: "C",
    jerseyNumber: 34,
    ratings: {
      defense: 98,
      starPower: 94,
    },
    stats: {
      ppg: 21.8,
      rpg: 11.1,
      apg: 2.5,
      fgPercent: 51.2,
      threePercent: 20.2,
      ftPercent: 71.2,
    },
  },

  {
    id: 11,
    nbaId: 76375,
    name: "Wilt Chamberlain",
    team: "LAL",
    position: "C",
    jerseyNumber: 13,
    ratings: {
      defense: 93,
      starPower: 98,
    },
    stats: {
      ppg: 30.1,
      rpg: 22.9,
      apg: 4.4,
      fgPercent: 54.0,
      threePercent: 0.0,
      ftPercent: 51.1,
    },
  },

  {
    id: 12,
    nbaId: 203507,
    name: "Giannis Antetokounmpo",
    team: "MIL",
    position: "F",
    jerseyNumber: 34,
    ratings: {
      defense: 94,
      starPower: 94,
    },
    stats: {
      ppg: 23.4,
      rpg: 9.8,
      apg: 4.9,
      fgPercent: 54.5,
      threePercent: 28.7,
      ftPercent: 70.0,
    },
  },

  {
    id: 13,
    nbaId: 203999,
    name: "Nikola Jokic",
    team: "DEN",
    position: "C",
    jerseyNumber: 15,
    ratings: {
      defense: 75,
      starPower: 95,
    },
    stats: {
      ppg: 21.1,
      rpg: 10.8,
      apg: 6.9,
      fgPercent: 55.7,
      threePercent: 35.0,
      ftPercent: 83.0,
    },
  },
];

// Future: these max values could be dynamically calculated based on the player data or fetched from an API to ensure they remain accurate and relevant as new players are added or stats are updated.
export const statMaxValues: Record<CorePlayerStatKey, number> = {
  ppg: 35,
  rpg: 15,
  apg: 12,
  fgPercent: 65,
  threePercent: 45,
  ftPercent: 95,
};

// Normalizes a stat value to a percentage based on the maximum value for that stat, ensuring that all stats can be compared on a common scale for the radar chart.
export function normalizeStat(value: number, max: number) {
  return Math.min((value / max) * 100, 100);
}

// Get player insights based on their stats per game

/* Different types of insights
 *  Core = Main statistic(s) about the player
 *  Supporting = Additional statistic(s) to identify the player
 *  Bonus = Fun fact(s) or other cool information about the player
 *  Weakness = Points of players' game where they are not as good */
type InsightTier = "core" | "supporting" | "bonus" | "weakness";
/* Rarity of insights based on score
 *  Gold = Generational / all-time
 *  Purple = Historic / rare dominance
 *  Blue = Elite / high-end star skill
 *  Gray = Strong / supporting / bonus
 *  Red = weakness */
type InsightRarity = "gold" | "purple" | "blue" | "gray" | "red";

// Insight requirements
type Insight = {
  label: string;
  score: number;
  tier: InsightTier;
  rarity: InsightRarity;
  description: string;
};

// Requirements for insight results
export type PlayerInsightDisplay = {
  label: string;
  rarity: InsightRarity;
  description: string;
};
// Insight results
export type PlayerInsightResult = {
  archetype: PlayerInsightDisplay | null;
  traits: PlayerInsightDisplay[];
};

// Main function to get player insights
export function getPlayerInsights(player: Player): PlayerInsightResult {
  const insights: Insight[] = [];

  function addInsight(
    label: string,
    score: number,
    tier: InsightTier,
    rarity: InsightRarity,
    description: string,
  ) {
    insights.push({ label, score, tier, rarity, description });
  }

  // Derived values
  const scoringLoad =
    player.stats.ppg / (player.stats.apg + player.stats.rpg + 1);
  const isPreThreeEra = player.stats.threePercent < 10;

  // Archetype rules
  const isPrimaryScoringEngine = player.stats.ppg >= 24 && player.stats.apg < 6;
  const isTwoWayThreat = player.stats.ppg >= 22 && player.stats.rpg >= 7;
  const isFloorGeneral = player.stats.apg >= 8 && player.stats.fgPercent >= 48;
  const isPaintDominator =
    player.stats.rpg >= 10 && player.stats.fgPercent >= 50;
  const isStretchBig = player.stats.rpg >= 8 && player.stats.threePercent >= 33;
  const isTripleDoubleMachine =
    player.stats.ppg >= 20 && player.stats.rpg >= 7 && player.stats.apg >= 7;
  const isBalancedStar =
    player.stats.ppg >= 18 &&
    player.stats.rpg >= 5 &&
    player.stats.apg >= 4 &&
    player.stats.fgPercent >= 48 &&
    player.stats.ftPercent >= 75;
  const isVolumeScorer = player.stats.ppg >= 25 && player.stats.fgPercent < 46;
  const isPostUpSpecialist =
    player.stats.fgPercent >= 50 &&
    player.stats.threePercent < 25 &&
    player.stats.rpg >= 8;
  const isPurePointGuard = player.stats.apg >= 8 && player.stats.ppg < 18;
  const isInteriorAnchor =
    player.stats.rpg >= 10 &&
    player.stats.fgPercent >= 50 &&
    player.stats.threePercent < 25;
  const isGenerationalShooter =
    player.stats.threePercent >= 42 && player.stats.ppg >= 20;

  const isGuard = player.position === "G";
  const isForward = player.position === "F";
  const isCenter = player.position === "C";
  const isBig = isForward || isCenter;
  const isLeadGuard =
    isGuard && player.stats.ppg >= 20 && player.stats.apg >= 5;

  const isRimPressureGuard =
    isGuard &&
    player.stats.ppg >= 20 &&
    player.stats.fgPercent >= 45 &&
    player.stats.threePercent < 37;

  const isScoringLeadGuard =
    isGuard &&
    player.stats.ppg >= 22 &&
    player.stats.apg >= 4 &&
    player.stats.apg < 8;

  const isTwoWayWing =
    isForward && player.stats.ppg >= 18 && player.ratings.defense >= 82;

  const isWingShotCreator =
    isForward &&
    player.stats.ppg >= 20 &&
    player.stats.apg >= 3 &&
    player.stats.fgPercent >= 45;

  const isClutchCreator =
    isGuard &&
    player.stats.ppg >= 22 &&
    player.stats.apg >= 5 &&
    player.stats.fgPercent >= 46;

  const isTwoWayConnector =
    isForward &&
    player.stats.ppg >= 16 &&
    player.stats.rpg >= 5 &&
    player.stats.apg >= 4 &&
    player.ratings.defense >= 82;

  const isCraftScoringGuard =
    isGuard &&
    player.stats.ppg >= 16 &&
    player.stats.apg >= 4 &&
    player.stats.fgPercent >= 46;

  if (isTripleDoubleMachine)
    addInsight(
      "Triple-Double Machine",
      1.0,
      "core",
      "purple",
      "Rare all-around production across scoring, rebounding, and playmaking.",
    );
  if (isPaintDominator)
    addInsight(
      "Paint Dominator",
      0.97,
      "core",
      "blue",
      "Controls the interior with strong rebounding and efficient finishing.",
    );
  if (isPrimaryScoringEngine)
    addInsight(
      "Primary Scoring Engine",
      0.95,
      "core",
      "blue",
      "Leads the offense mainly through high-level scoring volume.",
    );
  if (isTwoWayThreat)
    addInsight(
      "Two-Way Threat",
      0.93,
      "core",
      "blue",
      "Pairs star scoring with major rebounding impact.",
    );
  if (isFloorGeneral)
    addInsight(
      "Floor General",
      0.92,
      "core",
      "blue",
      "Runs the offense with elite passing and efficient decision-making.",
    );
  if (isBalancedStar)
    addInsight(
      "Balanced Star",
      0.91,
      "core",
      "blue",
      "Contributes strongly across scoring, boards, passing, and efficiency.",
    );
  if (isPostUpSpecialist)
    addInsight(
      "Post-Up Specialist",
      0.9,
      "core",
      "blue",
      "Interior-focused scorer with strong finishing and rebounding.",
    );
  if (isStretchBig)
    addInsight(
      "Stretch Big",
      0.89,
      "core",
      "blue",
      "Big-man profile with rebounding and floor-spacing shooting.",
    );
  if (isVolumeScorer)
    addInsight(
      "Volume Scorer",
      0.88,
      "core",
      "blue",
      "Carries a heavy scoring load even without elite efficiency.",
    );
  if (isPurePointGuard)
    addInsight(
      "Pure Point Guard",
      0.87,
      "core",
      "blue",
      "Pass-first creator whose main value comes from running offense.",
    );
  if (isInteriorAnchor)
    addInsight(
      "Interior Anchor",
      0.94,
      "core",
      "purple",
      "Rare big-man profile built on boards, interior efficiency, and paint presence.",
    );
  if (isGenerationalShooter)
    addInsight(
      "Generational Shooter",
      0.98,
      "core",
      "gold",
      "Top 1% shooting profile with elite scoring volume and perimeter accuracy.",
    );
  if (isRimPressureGuard)
    addInsight(
      "Rim Pressure Guard",
      0.9,
      "core",
      "blue",
      "Lead guard who bends defenses with downhill scoring and paint pressure.",
    );

  if (isScoringLeadGuard)
    addInsight(
      "Scoring Lead Guard",
      0.89,
      "core",
      "blue",
      "Primary ball handler who creates offense through scoring pressure.",
    );

  if (isLeadGuard)
    addInsight(
      "Lead Creator",
      0.88,
      "core",
      "blue",
      "Runs offense as a primary guard through scoring and playmaking.",
    );

  if (scoringLoad > 3.5)
    addInsight(
      "High-Usage Offensive Focus",
      0.88,
      "supporting",
      "gray",
      "Scoring makes up a large share of this player's overall production.",
    );
  if (player.stats.ppg >= 24 && player.stats.fgPercent >= 44)
    addInsight(
      "Elite Shot Creator",
      0.9,
      "core",
      "blue",
      "Creates high-level scoring chances while maintaining solid efficiency.",
    );
  if (isPreThreeEra && player.stats.ppg >= 20)
    addInsight(
      "Pre-3PT Era Dominant Big",
      0.86,
      "supporting",
      "purple",
      "Dominant scoring profile from an era or role with little three-point volume.",
    );
  if (isTwoWayWing)
    addInsight(
      "Two-Way Wing",
      0.91,
      "core",
      "blue",
      "Wing profile built around scoring pressure and strong defensive value.",
    );

  if (isWingShotCreator)
    addInsight(
      "Wing Shot Creator",
      0.9,
      "core",
      "blue",
      "Creates offense from the wing with scoring volume and reliable efficiency.",
    );

  if (isClutchCreator)
    addInsight(
      "Clutch Creator",
      0.89,
      "core",
      "blue",
      "Lead guard who creates efficient offense as a primary scoring option.",
    );

  if (isTwoWayConnector)
    addInsight(
      "Two-Way Connector",
      0.88,
      "core",
      "blue",
      "Versatile forward who links scoring, passing, rebounding, and defense.",
    );
  if (isCraftScoringGuard)
    addInsight(
      "Craft Scoring Guard",
      0.87,
      "core",
      "blue",
      "Lead guard who creates efficient offense through scoring craft and ball control.",
    );

  // Position-aware rules
  if (isBig) {
    if (player.stats.apg >= 4)
      addInsight(
        "Passing Big",
        0.85,
        "supporting",
        "gray",
        "Frontcourt player with above-average passing and offensive feel.",
      );
    if (player.stats.threePercent >= 35)
      addInsight(
        "Floor-Spacing Big",
        0.84,
        "supporting",
        "gray",
        "Big-man profile that can stretch defenses from the perimeter.",
      );
  }

  if (isGuard) {
    if (player.stats.rpg >= 6)
      addInsight(
        "Rebounding Guard",
        0.84,
        "supporting",
        "gray",
        "Guard profile with unusual impact on the glass.",
      );
    if (player.stats.ppg >= 22 && player.stats.apg >= 6)
      addInsight(
        "Scoring Point Guard",
        0.86,
        "supporting",
        "blue",
        "Point guard who blends scoring pressure with playmaking volume.",
      );
  }

  if (isForward) {
    if (player.stats.apg >= 6 && player.stats.ppg >= 20)
      addInsight(
        "Wing Playmaker",
        0.85,
        "supporting",
        "gray",
        "Wing scorer with meaningful passing and creation ability.",
      );
    if (player.stats.rpg >= 8 && player.stats.ppg >= 20)
      addInsight(
        "Versatile Wing",
        0.84,
        "supporting",
        "gray",
        "Wing profile with strong scoring and rebounding versatility.",
      );
  }

  // Role player / lower tier rules
  if (player.stats.ppg >= 15 && player.stats.ppg < 20)
    addInsight(
      "Consistent Contributor",
      0.5,
      "bonus",
      "gray",
      "Provides steady scoring without reaching primary star volume.",
    );
  if (player.stats.ppg >= 10 && player.stats.ppg < 15)
    addInsight(
      "Reliable Role Player",
      0.35,
      "bonus",
      "gray",
      "Contributes useful production in a smaller offensive role.",
    );
  if (player.stats.rpg >= 6 && player.stats.rpg < 7)
    addInsight(
      "Active on the Boards",
      0.4,
      "bonus",
      "gray",
      "Adds value with consistent rebounding activity.",
    );
  if (player.stats.apg >= 4 && player.stats.apg < 5)
    addInsight(
      "Capable Ball Handler",
      0.38,
      "bonus",
      "gray",
      "Shows useful passing and handling for their role.",
    );
  if (player.stats.fgPercent >= 48 && player.stats.fgPercent < 52)
    addInsight(
      "Solid Efficiency",
      0.42,
      "bonus",
      "gray",
      "Scores with dependable efficiency from the field.",
    );
  if (player.stats.threePercent >= 35 && player.stats.threePercent < 38)
    addInsight(
      "Reliable from Deep",
      0.4,
      "bonus",
      "gray",
      "Provides dependable three-point shooting value.",
    );
  if (player.stats.ftPercent >= 80 && player.stats.ftPercent < 85)
    addInsight(
      "Steady at the Line",
      0.38,
      "bonus",
      "gray",
      "Converts free throws at a reliable rate.",
    );

  // Stat-based strengths
  if (player.stats.ppg >= 28)
    addInsight(
      "Generational Scorer",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "core",
      "gold",
      "All-time scoring profile with top-tier points-per-game production.",
    );
  else if (player.stats.ppg >= 25)
    addInsight(
      "Elite Scorer",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "core",
      "blue",
      "High-end scoring profile with star-level points-per-game volume.",
    );
  else if (player.stats.ppg >= 20)
    addInsight(
      "Reliable Offensive Threat",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "supporting",
      "gray",
      "Strong scoring profile that consistently pressures defenses.",
    );

  if (player.stats.rpg >= 15)
    addInsight(
      "Historic Rebounding",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "core",
      "purple",
      "Rare rebounding profile with historically high board production.",
    );
  else if (player.stats.rpg >= 10)
    addInsight(
      "Dominant Rebounder",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "supporting",
      "blue",
      "Controls possessions with elite rebounding volume.",
    );
  else if (player.stats.rpg >= 7)
    addInsight(
      "Strong Rebounding Impact",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "supporting",
      "gray",
      "Adds strong value through rebounding for their role.",
    );

  if (player.stats.apg >= 10)
    addInsight(
      "Generational Creator",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "core",
      "gold",
      "All-time playmaking profile with elite assist production.",
    );
  else if (player.stats.apg >= 7)
    addInsight(
      "Elite Playmaker",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "supporting",
      "blue",
      "Creates a high volume of scoring chances for teammates.",
    );
  else if (player.stats.apg >= 5)
    addInsight(
      "Strong Playmaking Ability",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "supporting",
      "gray",
      "Provides meaningful passing and offensive creation.",
    );

  if (player.stats.fgPercent >= 57)
    addInsight(
      "Exceptional Efficiency",
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "blue",
      "Finishes possessions with elite field-goal efficiency.",
    );
  else if (player.stats.fgPercent >= 52)
    addInsight(
      "Highly Efficient Scorer",
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "gray",
      "Scores efficiently from the field for their role.",
    );

  if (player.stats.threePercent >= 42)
    addInsight(
      "Elite Perimeter Shooter",
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "blue",
      "Elite perimeter shooting profile from three-point range.",
    );
  else if (player.stats.threePercent >= 38)
    addInsight(
      "High-Level Shooter",
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "gray",
      "Strong three-point shooting profile that stretches defenses.",
    );

  if (player.stats.ftPercent >= 90)
    addInsight(
      "Automatic at the Line",
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
      "Near-perfect free-throw profile with elite line efficiency.",
    );
  else if (player.stats.ftPercent >= 85)
    addInsight(
      "Elite Free Throw Shooter",
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
      "Excellent free-throw shooter who reliably converts at the line.",
    );

  // Weaknesses
  if (player.stats.ftPercent < 60)
    addInsight(
      "FT Liability",
      -0.1,
      "weakness",
      "red",
      "Free-throw percentage is a notable weakness in this profile.",
    );
  if (player.stats.threePercent < 25 && !isPreThreeEra)
    addInsight(
      "Limited Range",
      -0.1,
      "weakness",
      "red",
      "Three-point shooting does not meaningfully stretch defenses.",
    );

  // Ranks for each type of label
  const tierRank: Record<InsightTier, number> = {
    core: 3,
    supporting: 2,
    bonus: 1,
    weakness: 0,
  };

  // Get archetype by highest score of core insight
  const archetype = insights
    .filter((insight) => insight.tier === "core")
    .sort((a, b) => b.score - a.score)[0];

  // Get remaining traits
  const traits = insights
    .filter((insight) => insight.label !== archetype?.label)
    .sort((a, b) => tierRank[b.tier] - tierRank[a.tier] || b.score - a.score)
    .slice(0, 3);

  return {
    archetype: archetype
      ? {
          label: archetype.label,
          rarity: archetype.rarity,
          description: archetype.description,
        }
      : null,
    traits: traits.map((insight) => ({
      label: insight.label,
      rarity: insight.rarity,
      description: insight.description,
    })),
  };
}

// Function to weigh positions differently, so players in similar positions get matched evenly and display more accurate similarities on function getSimilarPlayers
function getPositionWeights(
  position: Position,
): Record<CorePlayerStatKey, number> {
  if (position === "G") {
    return {
      ppg: 1.25,
      rpg: 0.7,
      apg: 1.55,
      fgPercent: 0.8,
      threePercent: 1.25,
      ftPercent: 0.7,
    };
  }

  if (position === "F") {
    return {
      ppg: 1.35,
      rpg: 1.15,
      apg: 1.0,
      fgPercent: 0.95,
      threePercent: 1.05,
      ftPercent: 0.7,
    };
  }

  return {
    ppg: 1.0,
    rpg: 1.7,
    apg: 0.75,
    fgPercent: 1.45,
    threePercent: 0.45,
    ftPercent: 0.55,
  };
}

// Position similarity
function getPositionSimilarity(
  playerPosition: Position,
  otherPosition: Position,
) {
  if (playerPosition === otherPosition) {
    return 100;
  }

  const isFrontcourtMatch =
    (playerPosition === "F" || playerPosition === "C") &&
    (otherPosition === "F" || otherPosition === "C");

  if (isFrontcourtMatch) {
    return 70;
  }

  return 35;
}

// Archetype similarity
function getArchetypeSimilarity(player: Player, otherPlayer: Player) {
  const playerArchetype = getPlayerInsights(player).archetype;
  const otherArchetype = getPlayerInsights(otherPlayer).archetype;

  // If no archetypes
  if (!playerArchetype || !otherArchetype) {
    return 50;
  }

  // Same archetype = 100% match, else 40%
  return playerArchetype === otherArchetype ? 100 : 40;
}

// Get confidence score of similar player match result
export type SimilarPlayerResult = {
  player: Player;
  matchScore: number;
};

// Function to display players similar to current player on card (max 3 players)
export function getSimilarPlayers(
  player: Player,
  limit = 3,
): SimilarPlayerResult[] {
  const weights = getPositionWeights(player.position);
  const totalWeight = Object.values(weights).reduce(
    (total, weight) => total + weight,
    0,
  );

  return players
    .filter((otherPlayer) => otherPlayer.id !== player.id)
    .map((otherPlayer) => {
      const weightedDifference =
        Math.abs(
          normalizeStat(player.stats.ppg, statMaxValues.ppg) -
            normalizeStat(otherPlayer.stats.ppg, statMaxValues.ppg),
        ) *
          weights.ppg +
        Math.abs(
          normalizeStat(player.stats.rpg, statMaxValues.rpg) -
            normalizeStat(otherPlayer.stats.rpg, statMaxValues.rpg),
        ) *
          weights.rpg +
        Math.abs(
          normalizeStat(player.stats.apg, statMaxValues.apg) -
            normalizeStat(otherPlayer.stats.apg, statMaxValues.apg),
        ) *
          weights.apg +
        Math.abs(
          normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent) -
            normalizeStat(otherPlayer.stats.fgPercent, statMaxValues.fgPercent),
        ) *
          weights.fgPercent +
        Math.abs(
          normalizeStat(player.stats.threePercent, statMaxValues.threePercent) -
            normalizeStat(
              otherPlayer.stats.threePercent,
              statMaxValues.threePercent,
            ),
        ) *
          weights.threePercent +
        Math.abs(
          normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent) -
            normalizeStat(otherPlayer.stats.ftPercent, statMaxValues.ftPercent),
        ) *
          weights.ftPercent;

      const averageStatDifference = weightedDifference / totalWeight;
      const statSimilarity = Math.max(0, 100 - averageStatDifference);
      const positionSimilarity = getPositionSimilarity(
        player.position,
        otherPlayer.position,
      );
      const archetypeSimilarity = getArchetypeSimilarity(player, otherPlayer);

      const matchScore = Math.round(
        statSimilarity * 0.7 +
          positionSimilarity * 0.2 +
          archetypeSimilarity * 0.1,
      );

      return {
        player: otherPlayer,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

// Future: this type can be expanded to include more stats or player attributes as needed, and can be used to structure the data for the radar chart or other visualizations on the court page.
// Labels for the radar display
export type RadarStatRow = {
  stat: string;
  playerOne: number;
  playerTwo: number;
  playerOneActual: number;
  playerTwoActual: number;
};

// All unique teams in data
export const teams: Team[] = Array.from(
  new Set(players.map((player) => player.team)),
).sort();
// All unique positions in data
const positionOrder: Position[] = ["G", "F", "C"];
export const positions = positionOrder.filter((position) =>
  players.some((player) => player.position === position),
);

// Options to sort data from
export type SortValue =
  | ""
  | "first-name"
  | "last-name"
  | "careerOverall"
  | "peakOverall"
  | CorePlayerStatKey;
export type SortDirection = "primary" | "reverse";
export const sortOptions: { label: string; value: SortValue }[] = [
  { label: "First Name", value: "first-name" },
  { label: "Last Name", value: "last-name" },
  { label: "Career Rating", value: "careerOverall" },
  { label: "Peak Rating", value: "peakOverall" },
  { label: "PPG", value: "ppg" },
  { label: "RPG", value: "rpg" },
  { label: "APG", value: "apg" },
  { label: "Field Goal %", value: "fgPercent" },
  { label: "3 Point %", value: "threePercent" },
  { label: "Free Throw %", value: "ftPercent" },
];

// Slots of player currently being compared on court page
export type CompareSlots = {
  left: string;
  right: string;
};
