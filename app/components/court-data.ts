// This file contains the data and types related to players and their stats for the different pages.

// Global components

// Types for player positions and teams
export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type Team =
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

// Team colors
export const teamColors: Record<Team, string> = {
  ATL: "#e03a3e",
  BKN: "#000000",
  BOS: "#007a33",
  CHA: "#1d1160",
  CHI: "#ce1141",
  CLE: "#860038",
  DAL: "#00538c",
  DEN: "#fec524",
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

// Team logos
export const teamLogos: Record<Team, string> = {
  ATL: "/team-logos/atl.svg",
  BKN: "/team-logos/bkn.svg",
  BOS: "/team-logos/bos.svg",
  CHA: "/team-logos/cha.svg",
  CHI: "/team-logos/chi.svg",
  CLE: "/team-logos/cle.svg",
  DAL: "/team-logos/dal.svg",
  DEN: "/team-logos/den.svg",
  DET: "/team-logos/det.svg",
  GSW: "/team-logos/gsw.svg",
  HOU: "/team-logos/hou.svg",
  IND: "/team-logos/ind.svg",
  LAC: "/team-logos/lac.svg",
  LAL: "/team-logos/lal.svg",
  MEM: "/team-logos/mem.svg",
  MIA: "/team-logos/mia.svg",
  MIL: "/team-logos/mil.svg",
  MIN: "/team-logos/min.svg",
  NOP: "/team-logos/nop.svg",
  NYK: "/team-logos/nyk.svg",
  OKC: "/team-logos/okc.svg",
  ORL: "/team-logos/orl.svg",
  PHI: "/team-logos/phi.svg",
  PHX: "/team-logos/phx.svg",
  POR: "/team-logos/por.svg",
  SAC: "/team-logos/sac.svg",
  SAS: "/team-logos/sas.svg",
  TOR: "/team-logos/tor.svg",
  UTA: "/team-logos/uta.svg",
  WAS: "/team-logos/was.svg",
};

// Future: fetching this data from an API or database for scalability and easier updates, especially if the player list grows significantly or if stats need to be updated frequently.
export type PlayerStats = {
  ppg: number; // Points Per Game
  rpg: number; // Rebounds Per Game
  apg: number; // Assists Per Game
  fgPercent: number; // Field Goal Percentage
  threePercent: number; // Three Point Percentage
  ftPercent: number; // Free Throw Percentage
};

// Future: adding more stats or player attributes as needed, such as player position, team, or career highlights, to enhance the user experience and provide more comprehensive information about each player.
export type Player = {
  id: number;
  name: string;
  image: string;
  team: Team;
  position: Position;
  jerseyNumber: number;
  stats: PlayerStats;
};

// Future: database for player data could be implemented with APIs
export const players: Player[] = [
  {
    id: 1,
    name: "LeBron James",
    image: "/temp-players/lebron-james.png",
    team: "LAL",
    position: "SF",
    jerseyNumber: 23,
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
    name: "Michael Jordan",
    image: "/temp-players/michael-jordan.jpg",
    team: "CHI",
    position: "SG",
    jerseyNumber: 23,
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
    name: "Kobe Bryant",
    image: "/temp-players/kobe-bryant.jpg",
    team: "LAL",
    position: "SG",
    jerseyNumber: 24,
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
    name: "Stephen Curry",
    image: "/temp-players/stephen-curry.png",
    team: "GSW",
    position: "PG",
    jerseyNumber: 30,
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
    name: "Kevin Durant",
    image: "/temp-players/kevin-durant.png",
    team: "PHX",
    position: "SF",
    jerseyNumber: 35,
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
    name: "Shaquille O'Neal",
    image: "/temp-players/shaquille-oneal.png",
    team: "LAL",
    position: "C",
    jerseyNumber: 34,
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
    name: "Magic Johnson",
    image: "/temp-players/magic-johnson.png",
    team: "LAL",
    position: "PG",
    jerseyNumber: 32,
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
    name: "Larry Bird",
    image: "/temp-players/larry-bird.png",
    team: "BOS",
    position: "SF",
    jerseyNumber: 33,
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
    name: "Tim Duncan",
    image: "/temp-players/tim-duncan.png",
    team: "SAS",
    position: "PF",
    jerseyNumber: 21,
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
    name: "Hakeem Olajuwon",
    image: "/temp-players/hakeem-olajuwon.png",
    team: "HOU",
    position: "C",
    jerseyNumber: 34,
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
    name: "Wilt Chamberlain",
    image: "/temp-players/wilt-chamberlain.png",
    team: "LAL",
    position: "C",
    jerseyNumber: 13,
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
    name: "Giannis Antetokounmpo",
    image: "/temp-players/giannis-antetokounmpo.png",
    team: "MIL",
    position: "PF",
    jerseyNumber: 34,
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
    name: "Nikola Jokic",
    image: "/temp-players/nikola-jokic.png",
    team: "DEN",
    position: "C",
    jerseyNumber: 15,
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

// Type for keys of PlayerStats
export type StatKey = keyof PlayerStats;
// Future: these max values could be dynamically calculated based on the player data or fetched from an API to ensure they remain accurate and relevant as new players are added or stats are updated.
export const statMaxValues: Record<StatKey, number> = {
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
 *  Gray = Strong / useful supporting trait */
type InsightRarity = "gold" | "purple" | "blue" | "gray";

// Insight requirements
type Insight = {
  label: string;
  score: number;
  tier: InsightTier;
  rarity: InsightRarity;
};

// Requirements for insight results
export type PlayerInsightDisplay = {
  label: string;
  rarity: InsightRarity;
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
  ) {
    insights.push({ label, score, tier, rarity });
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

  if (isTripleDoubleMachine)
    addInsight("Triple-Double Machine", 1.0, "core", "purple");
  if (isPaintDominator) addInsight("Paint Dominator", 0.97, "core", "blue");
  if (isPrimaryScoringEngine)
    addInsight("Primary Scoring Engine", 0.95, "core", "blue");
  if (isTwoWayThreat) addInsight("Two-Way Threat", 0.93, "core", "blue");
  if (isFloorGeneral) addInsight("Floor General", 0.92, "core", "blue");
  if (isBalancedStar) addInsight("Balanced Star", 0.91, "core", "blue");
  if (isPostUpSpecialist) addInsight("Post-Up Specialist", 0.9, "core", "blue");
  if (isStretchBig) addInsight("Stretch Big", 0.89, "core", "blue");
  if (isVolumeScorer) addInsight("Volume Scorer", 0.88, "core", "blue");
  if (isPurePointGuard) addInsight("Pure Point Guard", 0.87, "core", "blue");
  if (isInteriorAnchor) addInsight("Interior Anchor", 0.94, "core", "purple");
  if (isGenerationalShooter)
    addInsight("Generational Shooter", 0.98, "core", "gold");

  if (scoringLoad > 3.5)
    addInsight("High-Usage Offensive Focus", 0.88, "supporting", "gray");
  if (player.stats.ppg >= 24 && player.stats.fgPercent >= 44)
    addInsight("Elite Shot Creator", 0.9, "core", "blue");
  if (isPreThreeEra && player.stats.ppg >= 20)
    addInsight("Pre-3PT Era Dominant Big", 0.86, "supporting", "purple");

  // Position-aware rules
  if (player.position === "C" || player.position === "PF") {
    if (player.stats.apg >= 4)
      addInsight("Passing Big", 0.85, "supporting", "gray");
    if (player.stats.threePercent >= 35)
      addInsight("Floor-Spacing Big", 0.84, "supporting", "gray");
  }

  if (player.position === "PG") {
    if (player.stats.rpg >= 6)
      addInsight("Rebounding Guard", 0.84, "supporting", "gray");
    if (player.stats.ppg >= 22 && player.stats.apg >= 6)
      addInsight("Scoring Point Guard", 0.86, "supporting", "blue");
  }

  if (player.position === "SG" || player.position === "SF") {
    if (player.stats.apg >= 6 && player.stats.ppg >= 20)
      addInsight("Wing Playmaker", 0.85, "supporting", "gray");
    if (player.stats.rpg >= 8 && player.stats.ppg >= 20)
      addInsight("Versatile Wing", 0.84, "supporting", "gray");
  }

  // Role player / lower tier rules
  if (player.stats.ppg >= 15 && player.stats.ppg < 20)
    addInsight("Consistent Contributor", 0.5, "bonus", "gray");
  if (player.stats.ppg >= 10 && player.stats.ppg < 15)
    addInsight("Reliable Role Player", 0.35, "bonus", "gray");
  if (player.stats.rpg >= 6 && player.stats.rpg < 7)
    addInsight("Active on the Boards", 0.4, "bonus", "gray");
  if (player.stats.apg >= 4 && player.stats.apg < 5)
    addInsight("Capable Ball Handler", 0.38, "bonus", "gray");
  if (player.stats.fgPercent >= 48 && player.stats.fgPercent < 52)
    addInsight("Solid Efficiency", 0.42, "bonus", "gray");
  if (player.stats.threePercent >= 35 && player.stats.threePercent < 38)
    addInsight("Reliable from Deep", 0.4, "bonus", "gray");
  if (player.stats.ftPercent >= 80 && player.stats.ftPercent < 85)
    addInsight("Steady at the Line", 0.38, "bonus", "gray");

  // Stat-based strengths
  if (player.stats.ppg >= 28)
    addInsight(
      "Generational Scorer",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "core",
      "gold",
    );
  else if (player.stats.ppg >= 25)
    addInsight(
      "Elite Scorer",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "core",
      "blue",
    );
  else if (player.stats.ppg >= 20)
    addInsight(
      "Reliable Offensive Threat",
      normalizeStat(player.stats.ppg, statMaxValues.ppg),
      "supporting",
      "gray",
    );

  if (player.stats.rpg >= 15)
    addInsight(
      "Historic Rebounding",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "core",
      "purple",
    );
  else if (player.stats.rpg >= 10)
    addInsight(
      "Dominant Rebounder",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "supporting",
      "blue",
    );
  else if (player.stats.rpg >= 7)
    addInsight(
      "Strong Rebounding Impact",
      normalizeStat(player.stats.rpg, statMaxValues.rpg),
      "supporting",
      "gray",
    );

  if (player.stats.apg >= 10)
    addInsight(
      "Generational Playmaker",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "core",
      "gold",
    );
  else if (player.stats.apg >= 7)
    addInsight(
      "Elite Facilitator",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "supporting",
      "blue",
    );
  else if (player.stats.apg >= 5)
    addInsight(
      "Strong Playmaking Ability",
      normalizeStat(player.stats.apg, statMaxValues.apg),
      "supporting",
      "gray",
    );

  if (player.stats.fgPercent >= 57)
    addInsight(
      "Exceptional Efficiency",
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "blue",
    );
  else if (player.stats.fgPercent >= 52)
    addInsight(
      "Highly Efficient Scorer",
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent),
      "supporting",
      "gray",
    );

  if (player.stats.threePercent >= 42)
    addInsight(
      "Elite Perimeter Shooter",
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "blue",
    );
  else if (player.stats.threePercent >= 38)
    addInsight(
      "High-Level Shooter",
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent),
      "supporting",
      "gray",
    );

  if (player.stats.ftPercent >= 90)
    addInsight(
      "Automatic at the Line",
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
    );
  else if (player.stats.ftPercent >= 85)
    addInsight(
      "Elite Free Throw Shooter",
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent),
      "supporting",
      "blue",
    );

  // Weaknesses
  if (player.stats.ftPercent < 60)
    addInsight("FT Liability", -0.1, "weakness", "gray");
  if (player.stats.threePercent < 25 && !isPreThreeEra)
    addInsight("Limited Range", -0.1, "weakness", "gray");

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
      ? { label: archetype.label, rarity: archetype.rarity }
      : null,
    traits: traits.map((insight) => ({
      label: insight.label,
      rarity: insight.rarity,
    })),
  };
}

// Function to weigh positions differently, so players in similar positions get matched evenly and display more accurate similarities on function getSimilarPlayers
function getPositionWeights(position: Position): Record<StatKey, number> {
  if (position === "PG") {
    return {
      ppg: 1.2,
      rpg: 0.7,
      apg: 1.6,
      fgPercent: 0.8,
      threePercent: 1.3,
      ftPercent: 0.6,
    };
  }

  if (position === "SG" || position === "SF") {
    return {
      ppg: 1.5,
      rpg: 1.0,
      apg: 1.0,
      fgPercent: 0.9,
      threePercent: 1.2,
      ftPercent: 0.7,
    };
  }

  // PF, C
  return {
    ppg: 1.0,
    rpg: 1.6,
    apg: 0.8,
    fgPercent: 1.4,
    threePercent: 0.6,
    ftPercent: 0.6,
  };
}

// Position similarity
function getPositionSimilarity(
  playerPosition: Position,
  otherPosition: Position,
) {
  // Perfect match
  if (playerPosition === otherPosition) {
    return 100;
  }

  // Some match
  const isGuardMatch =
    (playerPosition === "PG" || playerPosition === "SG") &&
    (otherPosition === "PG" || otherPosition === "SG");
  const isWingMatch =
    (playerPosition === "SG" || playerPosition === "SF") &&
    (otherPosition === "SG" || otherPosition === "SF");
  const isBigMatch =
    (playerPosition === "PF" || playerPosition === "C") &&
    (otherPosition === "PF" || otherPosition === "C");

  if (isGuardMatch || isWingMatch || isBigMatch) {
    return 75;
  }

  // No match
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
const positionOrder: Position[] = ["PG", "SG", "SF", "PF", "C"];
export const positions = positionOrder.filter((position) =>
  players.some((player) => player.position === position),
);

// Options to sort data from
export type SortValue = "" | "first-name" | "last-name" | StatKey;
export type SortDirection = "primary" | "reverse";
export const sortOptions: { label: string; value: SortValue }[] = [
  { label: "None", value: "" },
  { label: "First Name", value: "first-name" },
  { label: "Last Name", value: "last-name" },
  { label: "Points", value: "ppg" },
  { label: "Rebounds", value: "rpg" },
  { label: "Assists", value: "apg" },
  { label: "Field Goal %", value: "fgPercent" },
  { label: "3 Point %", value: "threePercent" },
  { label: "Free Throw %", value: "ftPercent" },
];
