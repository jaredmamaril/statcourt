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

export type StatProfileType = "career" | "peak" | "current";

export type PlayerStatProfile = {
  profileType: StatProfileType;
  seasonLabel?: string | null;
  games?: number | null;
  minutesPerGame?: number | null;
  ppg?: number | null;
  rpg?: number | null;
  apg?: number | null;
  spg?: number | null;
  bpg?: number | null;
  fgPercent?: number | null;
  threePercent?: number | null;
  ftPercent?: number | null;
};

export type PlayerStatProfiles = Partial<
  Record<StatProfileType, PlayerStatProfile>
>;

export type Player = {
  id: number;
  nbaId?: number;
  name: string;
  heightInches?: number | null;
  weightPounds?: number | null;
  team: Team;
  position: Position;
  jerseyNumber: number;
  image?: string;
  fallbackImage?: string | null;
  stats: PlayerStats;
  statProfiles?: PlayerStatProfiles;
  ratings: PlayerRatings;
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

export type StatMode = "career" | "peak" | "current";

function getStatsByMode(player: Player, statMode: StatMode): PlayerStats {
  const profile =
    statMode === "peak"
      ? (player.statProfiles?.peak ?? player.statProfiles?.career)
      : statMode === "current"
        ? (player.statProfiles?.current ?? player.statProfiles?.career)
        : player.statProfiles?.career;

  return {
    games: profile?.games ?? player.stats.games,
    ppg: profile?.ppg ?? player.stats.ppg,
    rpg: profile?.rpg ?? player.stats.rpg,
    apg: profile?.apg ?? player.stats.apg,
    spg: profile?.spg ?? player.stats.spg,
    bpg: profile?.bpg ?? player.stats.bpg,
    fgPercent: profile?.fgPercent ?? player.stats.fgPercent,
    threePercent: profile?.threePercent ?? player.stats.threePercent,
    ftPercent: profile?.ftPercent ?? player.stats.ftPercent,
  };
}

// Main function to get player insights
export function getPlayerInsights(
  player: Player,
  statMode: StatMode = "career",
): PlayerInsightResult {
  const stats = getStatsByMode(player, statMode);
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
  const scoringLoad = stats.ppg / (stats.apg + stats.rpg + 1);
  const isPreThreeEra = stats.threePercent < 10;

  // Archetype rules
  const isPrimaryScoringEngine = stats.ppg >= 24 && stats.apg < 6;
  const isTwoWayThreat = stats.ppg >= 22 && stats.rpg >= 7;
  const isFloorGeneral = stats.apg >= 8 && stats.fgPercent >= 48;
  const isPaintDominator = stats.rpg >= 10 && stats.fgPercent >= 50;
  const isStretchBig = stats.rpg >= 8 && stats.threePercent >= 33;
  const isTripleDoubleMachine =
    stats.ppg >= 20 && stats.rpg >= 7 && stats.apg >= 7;
  const isBalancedStar =
    stats.ppg >= 18 &&
    stats.rpg >= 5 &&
    stats.apg >= 4 &&
    stats.fgPercent >= 48 &&
    stats.ftPercent >= 75;
  const isVolumeScorer = stats.ppg >= 25 && stats.fgPercent < 46;
  const isPostUpSpecialist =
    stats.fgPercent >= 50 && stats.threePercent < 25 && stats.rpg >= 8;
  const isPurePointGuard = stats.apg >= 8 && stats.ppg < 18;
  const isInteriorAnchor =
    stats.rpg >= 10 && stats.fgPercent >= 50 && stats.threePercent < 25;
  const isGenerationalShooter = stats.threePercent >= 42 && stats.ppg >= 20;

  const isGuard = player.position === "G";
  const isForward = player.position === "F";
  const isCenter = player.position === "C";
  const isBig = isForward || isCenter;
  const isLeadGuard = isGuard && stats.ppg >= 20 && stats.apg >= 5;

  const isRimPressureGuard =
    isGuard &&
    stats.ppg >= 20 &&
    stats.fgPercent >= 45 &&
    stats.threePercent < 37;

  const isScoringLeadGuard =
    isGuard && stats.ppg >= 22 && stats.apg >= 4 && stats.apg < 8;

  const isTwoWayWing =
    isForward && stats.ppg >= 18 && player.ratings.defense >= 82;

  const isWingShotCreator =
    isForward && stats.ppg >= 20 && stats.apg >= 3 && stats.fgPercent >= 45;

  const isClutchCreator =
    isGuard && stats.ppg >= 22 && stats.apg >= 5 && stats.fgPercent >= 46;

  const isTwoWayConnector =
    isForward &&
    stats.ppg >= 16 &&
    stats.rpg >= 5 &&
    stats.apg >= 4 &&
    player.ratings.defense >= 82;

  const isCraftScoringGuard =
    isGuard && stats.ppg >= 16 && stats.apg >= 4 && stats.fgPercent >= 46;

  const isThreeLevelScorer =
    stats.ppg >= 22 &&
    stats.fgPercent >= 47 &&
    stats.threePercent >= 36 &&
    stats.ftPercent >= 80;

  const isOffensiveHub =
    stats.ppg >= 20 && stats.apg >= 6 && stats.fgPercent >= 48;

  const isPlaymakingBig =
    isBig && stats.ppg >= 15 && stats.rpg >= 7 && stats.apg >= 5;

  const isPointForward =
    isForward && stats.ppg >= 16 && stats.rpg >= 5 && stats.apg >= 5;

  const isTwoWaySuperstar =
    stats.ppg >= 22 &&
    player.ratings.defense >= 88 &&
    player.ratings.starPower >= 88;

  const isDefensiveAnchor =
    isBig && player.ratings.defense >= 90 && stats.rpg >= 8;

  if (isTwoWaySuperstar)
    addInsight(
      "Two-Way Superstar",
      0.99,
      "core",
      "gold",
      "Elite star profile that combines high-level scoring with major defensive value.",
    );

  if (isOffensiveHub)
    addInsight(
      "Offensive Hub",
      0.96,
      "core",
      "purple",
      "Central offensive engine who blends scoring, creation, and efficiency.",
    );

  if (isThreeLevelScorer)
    addInsight(
      "Three-Level Scorer",
      0.94,
      "core",
      "blue",
      "Scoring profile that threatens defenses at the rim, from midrange, and beyond the arc.",
    );

  if (isPlaymakingBig)
    addInsight(
      "Playmaking Big",
      0.93,
      "core",
      "blue",
      "Frontcourt creator who combines size, scoring, rebounding, and passing.",
    );

  if (isPointForward)
    addInsight(
      "Point Forward",
      0.91,
      "core",
      "blue",
      "Forward profile that creates offense with scoring, size, and passing.",
    );

  if (isDefensiveAnchor)
    addInsight(
      "Defensive Anchor",
      0.9,
      "core",
      "blue",
      "Frontcourt defender who provides high-level interior presence and rebounding support.",
    );

  if (isTripleDoubleMachine)
    addInsight(
      "Triple-Double Machine",
      0.97,
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
  if (stats.ppg >= 24 && stats.fgPercent >= 44)
    addInsight(
      "Elite Shot Creator",
      0.9,
      "core",
      "blue",
      "Creates high-level scoring chances while maintaining solid efficiency.",
    );
  if (isPreThreeEra && stats.ppg >= 20)
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
    if (stats.apg >= 4)
      addInsight(
        "Passing Big",
        0.85,
        "supporting",
        "gray",
        "Frontcourt player with above-average passing and offensive feel.",
      );
    if (stats.threePercent >= 35)
      addInsight(
        "Floor-Spacing Big",
        0.84,
        "supporting",
        "gray",
        "Big-man profile that can stretch defenses from the perimeter.",
      );
  }

  if (isGuard) {
    if (stats.rpg >= 6)
      addInsight(
        "Rebounding Guard",
        0.84,
        "supporting",
        "gray",
        "Guard profile with unusual impact on the glass.",
      );
    if (stats.ppg >= 22 && stats.apg >= 6)
      addInsight(
        "Scoring Point Guard",
        0.86,
        "supporting",
        "blue",
        "Point guard who blends scoring pressure with playmaking volume.",
      );
  }

  if (isForward) {
    if (stats.apg >= 6 && stats.ppg >= 20)
      addInsight(
        "Wing Playmaker",
        0.85,
        "supporting",
        "gray",
        "Wing scorer with meaningful passing and creation ability.",
      );
    if (stats.rpg >= 8 && stats.ppg >= 20)
      addInsight(
        "Versatile Wing",
        0.84,
        "supporting",
        "gray",
        "Wing profile with strong scoring and rebounding versatility.",
      );
  }

  // Role player / lower tier rules
  if (stats.ppg >= 15 && stats.ppg < 20)
    addInsight(
      "Consistent Contributor",
      0.5,
      "bonus",
      "gray",
      "Provides steady scoring without reaching primary star volume.",
    );
  if (stats.ppg >= 10 && stats.ppg < 15)
    addInsight(
      "Reliable Role Player",
      0.35,
      "bonus",
      "gray",
      "Contributes useful production in a smaller offensive role.",
    );
  if (stats.rpg >= 6 && stats.rpg < 7)
    addInsight(
      "Active on the Boards",
      0.4,
      "bonus",
      "gray",
      "Adds value with consistent rebounding activity.",
    );
  if (stats.apg >= 4 && stats.apg < 5)
    addInsight(
      "Capable Ball Handler",
      0.38,
      "bonus",
      "gray",
      "Shows useful passing and handling for their role.",
    );
  if (stats.fgPercent >= 48 && stats.fgPercent < 52)
    addInsight(
      "Solid Efficiency",
      0.42,
      "bonus",
      "gray",
      "Scores with dependable efficiency from the field.",
    );
  if (stats.threePercent >= 35 && stats.threePercent < 38)
    addInsight(
      "Reliable from Deep",
      0.4,
      "bonus",
      "gray",
      "Provides dependable three-point shooting value.",
    );
  if (stats.ftPercent >= 80 && stats.ftPercent < 85)
    addInsight(
      "Steady at the Line",
      0.38,
      "bonus",
      "gray",
      "Converts free throws at a reliable rate.",
    );

  // Stat-based strengths
  if (stats.ppg >= 28)
    addInsight(
      "Generational Scorer",
      normalizeStat(stats.ppg, statMaxValues.ppg),
      "core",
      "gold",
      "All-time scoring profile with top-tier points-per-game production.",
    );
  else if (stats.ppg >= 25)
    addInsight(
      "Elite Scorer",
      normalizeStat(stats.ppg, statMaxValues.ppg),
      "core",
      "blue",
      "High-end scoring profile with star-level points-per-game volume.",
    );
  else if (stats.ppg >= 20)
    addInsight(
      "Reliable Offensive Threat",
      normalizeStat(stats.ppg, statMaxValues.ppg),
      "supporting",
      "gray",
      "Strong scoring profile that consistently pressures defenses.",
    );

  if (stats.rpg >= 15)
    addInsight(
      "Historic Rebounding",
      normalizeStat(stats.rpg, statMaxValues.rpg),
      "core",
      "purple",
      "Rare rebounding profile with historically high board production.",
    );
  else if (stats.rpg >= 10)
    addInsight(
      "Dominant Rebounder",
      normalizeStat(stats.rpg, statMaxValues.rpg),
      "supporting",
      "blue",
      "Controls possessions with elite rebounding volume.",
    );
  else if (stats.rpg >= 7)
    addInsight(
      "Strong Rebounding Impact",
      normalizeStat(stats.rpg, statMaxValues.rpg),
      "supporting",
      "gray",
      "Adds strong value through rebounding for their role.",
    );

  if (stats.apg >= 10)
    addInsight(
      "Generational Creator",
      normalizeStat(stats.apg, statMaxValues.apg),
      "core",
      "gold",
      "All-time playmaking profile with elite assist production.",
    );
  else if (stats.apg >= 7)
    addInsight(
      "Elite Playmaker",
      normalizeStat(stats.apg, statMaxValues.apg),
      "supporting",
      "blue",
      "Creates a high volume of scoring chances for teammates.",
    );
  else if (stats.apg >= 5)
    addInsight(
      "Strong Playmaking Ability",
      normalizeStat(stats.apg, statMaxValues.apg),
      "supporting",
      "gray",
      "Provides meaningful passing and offensive creation.",
    );

  if (stats.fgPercent >= 57)
    addInsight(
      "Exceptional Efficiency",
      normalizeStat(stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "blue",
      "Finishes possessions with elite field-goal efficiency.",
    );
  else if (stats.fgPercent >= 52)
    addInsight(
      "Highly Efficient Scorer",
      normalizeStat(stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "gray",
      "Scores efficiently from the field for their role.",
    );

  if (stats.threePercent >= 42)
    addInsight(
      "Elite Perimeter Shooter",
      normalizeStat(stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "blue",
      "Elite perimeter shooting profile from three-point range.",
    );
  else if (stats.threePercent >= 38)
    addInsight(
      "High-Level Shooter",
      normalizeStat(stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "gray",
      "Strong three-point shooting profile that stretches defenses.",
    );

  if (stats.ftPercent >= 90)
    addInsight(
      "Automatic at the Line",
      normalizeStat(stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
      "Near-perfect free-throw profile with elite line efficiency.",
    );
  else if (stats.ftPercent >= 85)
    addInsight(
      "Elite Free Throw Shooter",
      normalizeStat(stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
      "Excellent free-throw shooter who reliably converts at the line.",
    );

  // Fallback archetypes for players who miss the main core rules
  const hasCoreArchetype = insights.some((insight) => insight.tier === "core");

  const isLowSample =
    statMode === "career"
      ? (stats.games ?? 0) > 0 && (stats.games ?? 0) < 20
      : statMode === "peak"
        ? (stats.games ?? 0) > 0 && (stats.games ?? 0) < 25
        : (stats.games ?? 0) > 0 && (stats.games ?? 0) < 10;

  if (!hasCoreArchetype) {
    if (isLowSample) {
      addInsight(
        "Small Sample Player",
        0.3,
        "core",
        "gray",
        "Limited sample makes this profile harder to classify confidently.",
      );
    } else if (isGuard && stats.ppg >= 12 && stats.apg >= 3.5) {
      addInsight(
        "Combo Guard",
        0.58,
        "core",
        "gray",
        "Backcourt profile that blends scoring with secondary playmaking.",
      );
    } else if (isGuard && stats.apg >= 4.5) {
      addInsight(
        "Reserve Playmaker",
        0.55,
        "core",
        "gray",
        "Guard profile that adds value through passing and offensive organization.",
      );
    } else if (isGuard && stats.ppg >= 10) {
      addInsight(
        "Bench Scorer",
        0.54,
        "core",
        "gray",
        "Backcourt scorer who provides useful offense in a rotation role.",
      );
    } else if (isGuard && stats.threePercent >= 35 && stats.ppg >= 5) {
      addInsight(
        "Spot-Up Guard",
        0.52,
        "core",
        "gray",
        "Guard profile that spaces the floor with reliable perimeter shooting.",
      );
    } else if (isGuard && stats.apg >= 3) {
      addInsight(
        "Backup Ball Handler",
        0.5,
        "core",
        "gray",
        "Backcourt profile that provides secondary handling and passing.",
      );
    } else if (isGuard && stats.ppg >= 7) {
      addInsight(
        "Reserve Scoring Guard",
        0.49,
        "core",
        "gray",
        "Guard profile that contributes scoring in a smaller offensive role.",
      );
    } else if (isGuard && stats.rpg >= 3.5) {
      addInsight(
        "Rebounding Guard",
        0.48,
        "core",
        "gray",
        "Guard profile with useful rebounding activity for the backcourt.",
      );
    } else if (isGuard && stats.threePercent >= 32 && stats.ppg >= 3.5) {
      addInsight(
        "Low-Usage Shooter",
        0.46,
        "core",
        "gray",
        "Low-usage guard profile with some floor-spacing value.",
      );
    } else if (isGuard && stats.apg >= 2) {
      addInsight(
        "Depth Ball Handler",
        0.45,
        "core",
        "gray",
        "Guard profile that provides basic handling and passing in limited minutes.",
      );
    } else if (isGuard && stats.ppg >= 4.5) {
      addInsight(
        "Low-Minute Scoring Guard",
        0.44,
        "core",
        "gray",
        "Backcourt profile that adds occasional scoring in a smaller role.",
      );
    } else if (isGuard) {
      addInsight(
        "Depth Guard",
        0.42,
        "core",
        "gray",
        "Backcourt depth profile with limited but useful production.",
      );
    } else if (isForward && stats.ppg >= 12 && stats.rpg >= 4) {
      addInsight(
        "Rotation Wing",
        0.56,
        "core",
        "gray",
        "Wing profile with enough scoring and rebounding to fit regular rotation minutes.",
      );
    } else if (isForward && stats.threePercent >= 35 && stats.ppg >= 6) {
      addInsight(
        "Floor-Spacing Forward",
        0.54,
        "core",
        "gray",
        "Forward profile that provides value by stretching defenses from the perimeter.",
      );
    } else if (isForward && stats.rpg >= 5.5) {
      addInsight(
        "Rebounding Forward",
        0.53,
        "core",
        "gray",
        "Forward profile that contributes through rebounding and possession work.",
      );
    } else if (isForward && player.ratings.defense >= 78) {
      addInsight(
        "Defensive Wing",
        0.52,
        "core",
        "gray",
        "Wing profile with defensive value and supporting production.",
      );
    } else if (isForward && stats.ppg >= 7) {
      addInsight(
        "Reserve Wing Scorer",
        0.5,
        "core",
        "gray",
        "Wing profile that adds scoring in a smaller rotation role.",
      );
    } else if (isForward && stats.rpg >= 4) {
      addInsight(
        "Energy Forward",
        0.49,
        "core",
        "gray",
        "Forward profile that contributes through rebounding, activity, and physical play.",
      );
    } else if (isForward && stats.threePercent >= 33 && stats.ppg >= 4) {
      addInsight(
        "Spot-Up Wing",
        0.48,
        "core",
        "gray",
        "Wing profile that provides spacing and supporting perimeter value.",
      );
    } else if (isForward && stats.threePercent >= 30 && stats.ppg >= 3.5) {
      addInsight(
        "Low-Usage Stretch Wing",
        0.46,
        "core",
        "gray",
        "Low-usage wing profile with some perimeter spacing value.",
      );
    } else if (isForward && stats.rpg >= 3) {
      addInsight(
        "Activity Forward",
        0.45,
        "core",
        "gray",
        "Forward profile that contributes through activity, size, and rebounding support.",
      );
    } else if (isForward && stats.ppg >= 4.5) {
      addInsight(
        "Low-Minute Wing Scorer",
        0.44,
        "core",
        "gray",
        "Wing profile that provides occasional scoring in limited minutes.",
      );
    } else if (isForward) {
      addInsight(
        "Depth Wing",
        0.42,
        "core",
        "gray",
        "Wing depth profile with limited but useful production.",
      );
    } else if (isCenter && stats.rpg >= 7 && stats.fgPercent >= 50) {
      addInsight(
        "Rim-Running Big",
        0.56,
        "core",
        "gray",
        "Center profile built around finishing, rebounding, and interior activity.",
      );
    } else if (isCenter && stats.rpg >= 6) {
      addInsight(
        "Glass-Cleaning Big",
        0.54,
        "core",
        "gray",
        "Big-man profile that adds value through rebounding and physical interior play.",
      );
    } else if (isCenter && stats.bpg && stats.bpg >= 0.8) {
      addInsight(
        "Rim Protector",
        0.53,
        "core",
        "gray",
        "Frontcourt profile that adds value through shot-blocking and interior defense.",
      );
    } else if (isCenter && player.ratings.defense >= 80) {
      addInsight(
        "Defensive Big",
        0.52,
        "core",
        "gray",
        "Frontcourt profile built around defensive presence and interior support.",
      );
    } else if (isCenter && stats.fgPercent >= 52 && stats.ppg >= 4) {
      addInsight(
        "Interior Finisher",
        0.51,
        "core",
        "gray",
        "Big-man profile built around efficient finishing near the basket.",
      );
    } else if (isCenter && stats.rpg >= 4.5) {
      addInsight(
        "Backup Big",
        0.5,
        "core",
        "gray",
        "Frontcourt profile that contributes size, rebounding, and interior minutes.",
      );
    } else if (isCenter && stats.ppg >= 5) {
      addInsight(
        "Reserve Interior Scorer",
        0.49,
        "core",
        "gray",
        "Center profile that provides scoring in a smaller frontcourt role.",
      );
    } else if (isCenter) {
      addInsight(
        "Depth Big",
        0.42,
        "core",
        "gray",
        "Frontcourt depth profile with limited but useful production.",
      );
    } else {
      addInsight(
        "Depth Contributor",
        0.4,
        "core",
        "gray",
        "General depth profile with limited statistical production.",
      );
    }
  }

  // Weaknesses
  if (stats.ftPercent < 60)
    addInsight(
      "FT Liability",
      -0.1,
      "weakness",
      "red",
      "Free-throw percentage is a notable weakness in this profile.",
    );
  if (stats.threePercent < 25 && !isPreThreeEra)
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

  // Get archetype by highest available insight tier
  const archetype =
    insights
      .filter((insight) => insight.tier === "core")
      .sort((a, b) => b.score - a.score)[0] ??
    insights
      .filter((insight) => insight.tier === "supporting")
      .sort((a, b) => b.score - a.score)[0] ??
    insights
      .filter((insight) => insight.tier === "bonus")
      .sort((a, b) => b.score - a.score)[0] ??
    null;

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

function getSimilarityWeights(
  player: Player,
  statMode: StatMode,
): Record<CorePlayerStatKey, number> {
  const stats = getStatsByMode(player, statMode);
  const archetype = getPlayerInsights(player, statMode).archetype?.label;

  // Jokic, Sabonis, Walton, big creators
  if (
    archetype === "Playmaking Big" ||
    archetype === "Offensive Hub" ||
    (player.position === "C" && stats.apg >= 5)
  ) {
    return {
      ppg: 1.15,
      rpg: 1.35,
      apg: 1.75,
      fgPercent: 1.25,
      threePercent: 0.75,
      ftPercent: 0.65,
    };
  }

  // Magic, LeBron, Bird-style jumbo creators
  if (
    archetype === "Point Forward" ||
    archetype === "Floor General" ||
    archetype === "Triple-Double Machine" ||
    stats.apg >= 7
  ) {
    return {
      ppg: 1.05,
      rpg: 1.1,
      apg: 1.85,
      fgPercent: 1.0,
      threePercent: 0.75,
      ftPercent: 0.55,
    };
  }

  // Jordan, Kobe, KD-style scorers
  if (
    archetype === "Primary Scoring Engine" ||
    archetype === "Three-Level Scorer" ||
    archetype === "Elite Shot Creator" ||
    stats.ppg >= 24
  ) {
    return {
      ppg: 1.75,
      rpg: 0.75,
      apg: 0.95,
      fgPercent: 1.05,
      threePercent: 0.85,
      ftPercent: 0.65,
    };
  }

  // Curry, Ray, Dame-style shooters
  if (archetype === "Generational Shooter" || stats.threePercent >= 40) {
    return {
      ppg: 1.45,
      rpg: 0.45,
      apg: 1.05,
      fgPercent: 0.85,
      threePercent: 1.85,
      ftPercent: 1.0,
    };
  }

  // Hakeem, Shaq, Duncan, Wilt-style interior bigs
  if (
    archetype === "Paint Dominator" ||
    archetype === "Interior Anchor" ||
    archetype === "Defensive Anchor" ||
    player.position === "C"
  ) {
    return {
      ppg: 1.05,
      rpg: 1.65,
      apg: 0.65,
      fgPercent: 1.35,
      threePercent: 0.35,
      ftPercent: 0.45,
    };
  }

  return getPositionWeights(player.position);
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
function getArchetypeSimilarity(
  player: Player,
  otherPlayer: Player,
  statMode: StatMode,
) {
  const playerArchetype = getPlayerInsights(player, statMode).archetype?.label;
  const otherArchetype = getPlayerInsights(otherPlayer, statMode).archetype
    ?.label;

  if (!playerArchetype || !otherArchetype) {
    return 50;
  }

  if (playerArchetype === otherArchetype) {
    return 100;
  }

  const creatorArchetypes = [
    "Offensive Hub",
    "Playmaking Big",
    "Point Forward",
    "Floor General",
    "Triple-Double Machine",
    "Lead Creator",
    "Pure Point Guard",
  ];

  const scorerArchetypes = [
    "Primary Scoring Engine",
    "Three-Level Scorer",
    "Elite Shot Creator",
    "Volume Scorer",
    "Scoring Lead Guard",
    "Wing Shot Creator",
    "Generational Scorer",
    "Elite Scorer",
  ];

  const interiorArchetypes = [
    "Paint Dominator",
    "Interior Anchor",
    "Defensive Anchor",
    "Post-Up Specialist",
    "Rim-Running Big",
    "Glass-Cleaning Big",
  ];

  const shooterArchetypes = [
    "Generational Shooter",
    "Three-Level Scorer",
    "High-Level Shooter",
    "Elite Perimeter Shooter",
    "Spot-Up Guard",
    "Spot-Up Wing",
    "Floor-Spacing Forward",
    "Stretch Big",
  ];

  const twoWayArchetypes = [
    "Two-Way Superstar",
    "Two-Way Threat",
    "Two-Way Wing",
    "Two-Way Connector",
    "Defensive Anchor",
    "Defensive Wing",
    "Defensive Big",
  ];

  const groups = [
    creatorArchetypes,
    scorerArchetypes,
    interiorArchetypes,
    shooterArchetypes,
    twoWayArchetypes,
  ];

  const sameGroup = groups.some(
    (group) =>
      group.includes(playerArchetype) && group.includes(otherArchetype),
  );

  return sameGroup ? 78 : 42;
}

function getPlaystyleSimilarity(
  player: Player,
  otherPlayer: Player,
  statMode: StatMode,
) {
  const stats = getStatsByMode(player, statMode);
  const otherStats = getStatsByMode(otherPlayer, statMode);

  let score = 100;

  const assistDifference = Math.abs(stats.apg - otherStats.apg);
  const reboundDifference = Math.abs(stats.rpg - otherStats.rpg);
  const scoringDifference = Math.abs(stats.ppg - otherStats.ppg);
  const shootingDifference = Math.abs(
    stats.threePercent - otherStats.threePercent,
  );

  score -= assistDifference * 5;
  score -= reboundDifference * 2.5;
  score -= scoringDifference * 1.4;
  score -= shootingDifference * 0.3;

  const playerIsJumboCreator =
    stats.apg >= 6.5 && stats.rpg >= 6 && player.position !== "G";

  const otherIsJumboCreator =
    otherStats.apg >= 6.5 &&
    otherStats.rpg >= 6 &&
    otherPlayer.position !== "G";

  const playerIsOversizedGuard =
    player.position === "G" && stats.apg >= 7 && stats.rpg >= 5.5;

  const otherIsOversizedGuard =
    otherPlayer.position === "G" &&
    otherStats.apg >= 7 &&
    otherStats.rpg >= 5.5;

  const playerIsPureScorer = stats.ppg >= 24 && stats.apg < 6;

  const otherIsPureScorer = otherStats.ppg >= 24 && otherStats.apg < 6;

  if (playerIsJumboCreator && otherIsJumboCreator) score += 12;
  if (playerIsOversizedGuard && otherIsOversizedGuard) score += 12;

  if (
    (playerIsJumboCreator && otherIsOversizedGuard) ||
    (playerIsOversizedGuard && otherIsJumboCreator)
  ) {
    score += 10;
  }

  if (playerIsPureScorer && otherIsPureScorer) score += 8;

  if ((playerIsJumboCreator || playerIsOversizedGuard) && otherIsPureScorer) {
    score -= 10;
  }

  if (playerIsPureScorer && (otherIsJumboCreator || otherIsOversizedGuard)) {
    score -= 10;
  }

  return Math.max(0, Math.min(score, 100));
}

// Confidence score of similar player match result
export type SimilarPlayerResult = {
  player: Player;
  matchScore: number;
};

// Function to display players similar to current player on card (max 3 players)
export function getSimilarPlayers(
  player: Player,
  playerPool: Player[],
  limit = 3,
  statMode: StatMode = "career",
): SimilarPlayerResult[] {
  const weights = getSimilarityWeights(player, statMode);
  const totalWeight = Object.values(weights).reduce(
    (total, weight) => total + weight,
    0,
  );
  const playerStats = getStatsByMode(player, statMode);

  return playerPool
    .filter((otherPlayer) => {
      const otherStats = getStatsByMode(otherPlayer, statMode);

      const isSamePlayer =
        otherPlayer.id === player.id ||
        otherPlayer.nbaId === player.nbaId ||
        otherPlayer.name === player.name;

      if (isSamePlayer) return false;

      if (statMode === "career") {
        const playerGames = playerStats.games ?? 0;
        const otherGames = otherStats.games ?? 0;

        const isEstablishedPlayer =
          playerGames >= 500 || player.ratings.starPower >= 88;

        return isEstablishedPlayer ? otherGames >= 400 : otherGames >= 150;
      }

      return true;
    })
    .map((otherPlayer) => {
      const otherStats = getStatsByMode(otherPlayer, statMode);
      const weightedDifference =
        Math.abs(
          normalizeStat(playerStats.ppg, statMaxValues.ppg) -
            normalizeStat(otherStats.ppg, statMaxValues.ppg),
        ) *
          weights.ppg +
        Math.abs(
          normalizeStat(playerStats.rpg, statMaxValues.rpg) -
            normalizeStat(otherStats.rpg, statMaxValues.rpg),
        ) *
          weights.rpg +
        Math.abs(
          normalizeStat(playerStats.apg, statMaxValues.apg) -
            normalizeStat(otherStats.apg, statMaxValues.apg),
        ) *
          weights.apg +
        Math.abs(
          normalizeStat(playerStats.fgPercent, statMaxValues.fgPercent) -
            normalizeStat(otherStats.fgPercent, statMaxValues.fgPercent),
        ) *
          weights.fgPercent +
        Math.abs(
          normalizeStat(playerStats.threePercent, statMaxValues.threePercent) -
            normalizeStat(otherStats.threePercent, statMaxValues.threePercent),
        ) *
          weights.threePercent +
        Math.abs(
          normalizeStat(playerStats.ftPercent, statMaxValues.ftPercent) -
            normalizeStat(otherStats.ftPercent, statMaxValues.ftPercent),
        ) *
          weights.ftPercent;

      const averageStatDifference = weightedDifference / totalWeight;
      const statSimilarity = Math.max(0, 100 - averageStatDifference);
      const positionSimilarity = getPositionSimilarity(
        player.position,
        otherPlayer.position,
      );
      const archetypeSimilarity = getArchetypeSimilarity(
        player,
        otherPlayer,
        statMode,
      );

      const defenseDifference = Math.abs(
        player.ratings.defense - otherPlayer.ratings.defense,
      );

      const defenseSimilarity = Math.max(0, 100 - defenseDifference);

      const playstyleSimilarity = getPlaystyleSimilarity(
        player,
        otherPlayer,
        statMode,
      );

      const playerIsHighAssistCreator = playerStats.apg >= 7;
      const otherIsHighAssistCreator = otherStats.apg >= 7;

      const playerIsScoringFirst = playerStats.ppg >= 24 && playerStats.apg < 6;
      const otherIsScoringFirst = otherStats.ppg >= 24 && otherStats.apg < 6;

      const creatorScorerPenalty =
        (playerIsHighAssistCreator && otherIsScoringFirst) ||
        (playerIsScoringFirst && otherIsHighAssistCreator)
          ? 6
          : 0;

      const isGuardForwardMismatch =
        (player.position === "G" && otherPlayer.position === "F") ||
        (player.position === "F" && otherPlayer.position === "G");

      const isGuardCenterMismatch =
        (player.position === "G" && otherPlayer.position === "C") ||
        (player.position === "C" && otherPlayer.position === "G");

      const isForwardCenterMismatch =
        (player.position === "F" && otherPlayer.position === "C") ||
        (player.position === "C" && otherPlayer.position === "F");

      const mismatchPenalty = isGuardCenterMismatch
        ? 12
        : isGuardForwardMismatch
          ? 7
          : isForwardCenterMismatch
            ? 3
            : 0;

      const playerIsPerimeterScorer =
        playerStats.ppg >= 22 && playerStats.threePercent >= 34;

      const otherIsPerimeterScorer =
        otherStats.ppg >= 22 && otherStats.threePercent >= 34;

      const playerIsInteriorScorer =
        playerStats.ppg >= 22 &&
        playerStats.fgPercent >= 50 &&
        playerStats.threePercent < 32;

      const otherIsInteriorScorer =
        otherStats.ppg >= 22 &&
        otherStats.fgPercent >= 50 &&
        otherStats.threePercent < 32;

      const scoringStylePenalty =
        (playerIsPerimeterScorer && otherIsInteriorScorer) ||
        (playerIsInteriorScorer && otherIsPerimeterScorer)
          ? 8
          : 0;

      const playerIsWingCreator =
        player.position === "F" &&
        playerStats.ppg >= 18 &&
        playerStats.apg >= 2.5 &&
        playerStats.rpg < 8;

      const otherIsWingCreator =
        otherPlayer.position === "F" &&
        otherStats.ppg >= 18 &&
        otherStats.apg >= 2.5 &&
        otherStats.rpg < 8;

      const playerIsRimProtectorBig =
        player.position === "C" ||
        ((playerStats.bpg ?? 0) >= 1.2 &&
          playerStats.rpg >= 5 &&
          player.ratings.defense >= 84);

      const otherIsRimProtectorBig =
        otherPlayer.position === "C" ||
        ((otherStats.bpg ?? 0) >= 1.2 &&
          otherStats.rpg >= 5 &&
          otherPlayer.ratings.defense >= 84);

      const wingBigRolePenalty =
        (playerIsWingCreator && otherIsRimProtectorBig) ||
        (playerIsRimProtectorBig && otherIsWingCreator)
          ? 24
          : 0;

      const playerIsJumboForwardCreator =
        player.position === "F" && playerStats.apg >= 6 && playerStats.rpg >= 6;

      const otherIsJumboForwardCreator =
        otherPlayer.position === "F" &&
        otherStats.apg >= 6 &&
        otherStats.rpg >= 6;

      const playerIsBallDominantGuard =
        player.position === "G" && playerStats.apg >= 6 && playerStats.rpg < 6;

      const otherIsBallDominantGuard =
        otherPlayer.position === "G" &&
        otherStats.apg >= 6 &&
        otherStats.rpg < 6;

      const jumboGuardPenalty =
        (playerIsJumboForwardCreator && otherIsBallDominantGuard) ||
        (playerIsBallDominantGuard && otherIsJumboForwardCreator)
          ? 6
          : 0;

      const playerIsTallPerimeterScorer =
        player.position === "F" &&
        playerStats.ppg >= 22 &&
        playerStats.threePercent >= 34 &&
        playerStats.apg >= 3;

      const otherIsTallPerimeterScorer =
        otherPlayer.position === "F" &&
        otherStats.ppg >= 22 &&
        otherStats.threePercent >= 34 &&
        otherStats.apg >= 3;

      const playerIsInteriorStarBig =
        (player.position === "C" || playerStats.threePercent < 32) &&
        playerStats.ppg >= 22 &&
        playerStats.rpg >= 8 &&
        playerStats.fgPercent >= 48;

      const otherIsInteriorStarBig =
        (otherPlayer.position === "C" || otherStats.threePercent < 32) &&
        otherStats.ppg >= 22 &&
        otherStats.rpg >= 8 &&
        otherStats.fgPercent >= 48;

      const perimeterInteriorStarPenalty =
        (playerIsTallPerimeterScorer && otherIsInteriorStarBig) ||
        (playerIsInteriorStarBig && otherIsTallPerimeterScorer)
          ? 22
          : 0;

      const playerIsPerimeterForward =
        player.position === "F" &&
        playerStats.ppg >= 20 &&
        playerStats.threePercent >= 34 &&
        playerStats.apg >= 3;

      const otherIsPerimeterForward =
        otherPlayer.position === "F" &&
        otherStats.ppg >= 20 &&
        otherStats.threePercent >= 34 &&
        otherStats.apg >= 3;

      const playerIsCenterScorer =
        player.position === "C" &&
        playerStats.ppg >= 20 &&
        playerStats.rpg >= 8;

      const otherIsCenterScorer =
        otherPlayer.position === "C" &&
        otherStats.ppg >= 20 &&
        otherStats.rpg >= 8;

      const perimeterCenterPenalty =
        (playerIsPerimeterForward && otherIsCenterScorer) ||
        (playerIsCenterScorer && otherIsPerimeterForward)
          ? 14
          : 0;

      const careerExperienceGap =
        statMode === "career"
          ? Math.abs((playerStats.games ?? 0) - (otherStats.games ?? 0))
          : 0;

      const experiencePenalty =
        statMode === "career" && careerExperienceGap >= 500 ? 5 : 0;

      const matchScore = Math.round(
        statSimilarity * 0.45 +
          playstyleSimilarity * 0.25 +
          archetypeSimilarity * 0.16 +
          positionSimilarity * 0.08 +
          defenseSimilarity * 0.06 -
          creatorScorerPenalty -
          mismatchPenalty -
          scoringStylePenalty -
          experiencePenalty -
          wingBigRolePenalty -
          jumboGuardPenalty -
          perimeterInteriorStarPenalty -
          perimeterCenterPenalty,
      );

      return {
        player: otherPlayer,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

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
export type SortValue = "" | "first-name" | "last-name" | CorePlayerStatKey;
export type SortDirection = "primary" | "reverse";
export const sortOptions: { label: string; value: SortValue }[] = [
  { label: "First Name", value: "first-name" },
  { label: "Last Name", value: "last-name" },
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
