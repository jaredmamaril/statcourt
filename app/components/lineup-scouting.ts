import {
  normalizeStat,
  type LineupSlot,
  type Player,
  type PlayerStats,
} from "./court-data";
import {
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  type BuilderStatProfileMode,
  type PositionFit,
} from "../components/lineups/builder/builder-position-helpers";
import {
  lineupReferenceCatalog,
  type LineupReferenceScores,
  type LineupReferenceTier,
} from "./lineups/lineup-reference-catalog";

export type TeamGrades = {
  offense: string;
  defense: string;
  shooting: string;
  playmaking: string;
  rebounding: string;
};

export type XFactorResult = {
  player: Player;
  description: string;
};

function getStatsByMode(
  player: Player,
  statProfileMode: BuilderStatProfileMode,
): PlayerStats {
  const profile =
    statProfileMode === "peak"
      ? (player.statProfiles?.peak ?? player.statProfiles?.career)
      : statProfileMode === "current"
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
    threeMadePerGame:
      profile?.threeMadePerGame ?? player.stats.threeMadePerGame,
    threeAttemptsPerGame:
      profile?.threeAttemptsPerGame ?? player.stats.threeAttemptsPerGame,
    freeThrowAttemptsPerGame:
      profile?.freeThrowAttemptsPerGame ??
      player.stats.freeThrowAttemptsPerGame,
  };
}

export type LineupScoutScores = {
  offense: number;
  defense: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  starPower: number;
  balance: number;
  overall: number;
};

export type LineupScoutReport = {
  summary: string;
  tier: string;
  archetype: string;
  teamIdentity: string;
  strengths: string[];
  weaknesses: string[];
  tradeoff: string;
  grades: TeamGrades;
  scores: LineupScoutScores;
  xFactor: XFactorResult | null;
  similarTo: string;
  similarToDescription: string;
  similarLineupMatches: {
    name: string;
    description: string;
    matchScore: number;
    tier?: LineupReferenceTier;
    archetype?: string;
  }[];
  courtBalance: string;
  courtBalanceDescription: string;
  badges: string[];
};

function getLineupReferenceTierLabel(tier?: LineupReferenceTier) {
  if (tier === "elite") return "Elite Template";
  if (tier === "strong") return "Strong Build";
  if (tier === "balanced") return "Balanced Build";
  if (tier === "flawed") return "Flawed Build";
  if (tier === "bad") return "Low-Ceiling Build";

  return "Reference Build";
}

export function getLineupTierColor(tier: string) {
  if (tier === "Championship Favorite") return "#EFBF04";
  if (tier === "Championship Contender") return "#1bc2ec";
  if (tier === "Playoff Caliber") return "#FFFFFF";
  if (tier === "Competitive Build") return "#22C55E";
  if (tier === "Specialist Build") return "#94A3B8";
  if (tier === "Flawed Build") return "#F97316";
  if (tier === "Developmental Lineup") return "#A855F7";

  return "#94A3B8";
}

export function getCourtBalanceColor(courtBalance: string) {
  if (courtBalance === "Excellent") return "#22C55E";
  if (courtBalance === "Good") return "#EFBF04";
  if (courtBalance === "Uneven") return "#F97316";

  return "#A855F7";
}

export function getGrade(score: number) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";

  return "D";
}

export function getScoutReason(archetype: string) {
  const reasons: Record<string, string> = {
    "Two-Way Dynasty":
      "Elite star power, interior control, and defensive versatility create a championship-caliber foundation.",

    "Floor Spacing Machine":
      "Multiple elite shooters stretch defenses beyond their limits while maintaining high-level creation.",

    "Point-Center Offense":
      "The offense flows through a frontcourt playmaker capable of creating advantages from every area of the floor.",

    "Iso Superteam":
      "Multiple elite shot creators can win individual matchups without needing a perfect offensive structure.",

    "Defensive Juggernaut":
      "High-end defenders and physical size give this lineup control over possessions, matchups, and the glass.",

    "Transition Attack":
      "Athletic creators and downhill scoring pressure make this lineup dangerous before defenses can get set.",

    "Rim Pressure Unit":
      "Interior scoring, rebounding, and paint pressure force opponents to collapse toward the basket.",

    "Positionless Basketball":
      "Versatile passers and multi-position talent let this lineup create offense without traditional role limits.",

    "Playmaking Engine":
      "Multiple high-level passers keep the ball moving and create efficient looks from every spot on the floor.",

    "Offensive Superteam":
      "Elite scoring talent gives this lineup constant pressure, even when the first action breaks down.",

    "Paint Control Unit":
      "Dominant size and rebounding give this lineup control of the interior on both ends.",

    "Defensive Powerhouse":
      "Defense, rebounding, and physicality define this lineup's identity and raise its playoff ceiling.",

    "Star-Powered Contender":
      "Top-end talent gives this lineup a championship ceiling, even if the fit is not perfectly balanced.",

    "Balanced Core":
      "This lineup has enough talent across categories to avoid relying on only one path to winning.",

    "Guard Creation Overload":
      "Multiple ball-handlers create pressure, but the lineup may be undersized defensively and on the glass.",

    "Size Over Skill":
      "The lineup leans into height, rebounding, and interior force while sacrificing spacing and handling.",

    "One-Way Offense":
      "The scoring profile is dangerous, but defensive coverage and possession control remain pressure points.",

    "Development Core":
      "This lineup has developmental pieces, but still needs clearer top-end talent and a stronger identity.",
  };

  return (
    reasons[archetype] ??
    "This lineup has a strong statistical identity built around its best players."
  );
}

function getTeamIdentity({
  archetype,
  trueBigs,
  trueGuards,
  adjustedShootingScore,
  adjustedPlaymakingScore,
  adjustedDefenseScore,
  adjustedReboundingScore,
  adjustedOffenseScore,
  starPower,
  constructionAdjustment,
}: {
  archetype: string;
  trueBigs: number;
  trueGuards: number;
  adjustedShootingScore: number;
  adjustedPlaymakingScore: number;
  adjustedDefenseScore: number;
  adjustedReboundingScore: number;
  adjustedOffenseScore: number;
  starPower: number;
  constructionAdjustment: number;
}) {
  if (trueBigs >= 3 && adjustedShootingScore < 70) return "Paint Crowding";
  if (trueGuards >= 3 && adjustedDefenseScore < 72) {
    return "Small Ball Creation";
  }
  if (archetype === "Guard Creation Overload") return "Guard Creation";
  if (archetype === "Size Over Skill") return "Size Over Skill";
  if (archetype === "One-Way Offense") return "Scoring Tilt";
  if (archetype === "Development Core") return "Development Focus";
  if (constructionAdjustment <= -4) return "Role Stretch";
  if (starPower < 55) return "Low-Ceiling Depth";
  if (adjustedShootingScore >= 88) return "Spacing Engine";
  if (adjustedPlaymakingScore >= 88) return "Advantage Creation";
  if (adjustedDefenseScore >= 88) return "Defensive Pressure";
  if (adjustedReboundingScore >= 88) return "Interior Control";
  if (adjustedOffenseScore >= 88) return "Scoring Pressure";

  const identities: Record<string, string> = {
    "Two-Way Dynasty": "Championship Control",
    "Transition Attack": "Open-Floor Pressure",
    "Point-Center Offense": "Hub Creation",
    "Iso Superteam": "Mismatch Hunting",
    "Defensive Juggernaut": "Defensive Suppression",
    "Floor Spacing Machine": "Maximum Spacing",
    "Positionless Basketball": "Role Flexibility",
    "Rim Pressure Unit": "Paint Pressure",
    "Playmaking Engine": "Five-Man Creation",
    "Offensive Superteam": "Shot Creation",
    "Paint Control Unit": "Paint Dominance",
    "Defensive Powerhouse": "Defensive Control",
    "Star-Powered Contender": "Star-Powered Balance",
    "Guard Creation Overload": "Guard Creation",
    "Size Over Skill": "Size Over Skill",
    "One-Way Offense": "Scoring Tilt",
    "Development Core": "Development Focus",
  };

  return identities[archetype] ?? "Balanced Two-Way Core";
}

function getLineupSummary({
  archetype,
  tier,
  trueBigs,
  trueGuards,
  adjustedShootingScore,
  adjustedPlaymakingScore,
  adjustedDefenseScore,
  constructionAdjustment,
}: {
  archetype: string;
  tier: string;
  trueBigs: number;
  trueGuards: number;
  adjustedShootingScore: number;
  adjustedPlaymakingScore: number;
  adjustedDefenseScore: number;
  constructionAdjustment: number;
}) {
  if (tier === "Developmental Lineup") {
    return "A developmental lineup with limited top-end pressure and several areas that still need a clear identity.";
  }

  if (tier === "Flawed Build" && constructionAdjustment <= -4) {
    return "A talented but awkward lineup where several players are stretched outside their cleanest roles.";
  }

  if (trueBigs >= 3 && adjustedShootingScore < 70) {
    return "A size-heavy lineup that can control the glass, but may crowd the paint and shrink driving lanes.";
  }

  if (trueGuards >= 3 && adjustedDefenseScore < 72) {
    return "A guard-heavy lineup with creation and pace, but clear pressure points on defense and the glass.";
  }

  if (adjustedPlaymakingScore < 60) {
    return "A lineup with usable pieces, but no clear engine to organize possessions consistently.";
  }

  return archetype === "Two-Way Dynasty"
    ? "A complete championship lineup built around elite two-way control, star power, and matchup answers."
    : archetype === "Transition Attack"
      ? "A fast-paced lineup built around rim pressure, open-floor creation, and defensive-to-offensive bursts."
      : archetype === "Point-Center Offense"
        ? "A hub-based offense built around a center who can pass, score, and organize the floor."
        : archetype === "Iso Superteam"
          ? "A shot-creation lineup built around elite isolation scorers and matchup hunting."
          : archetype === "Defensive Juggernaut"
            ? "A suffocating defensive lineup built around size, pressure, and rebounding control."
            : archetype === "Floor Spacing Machine"
              ? "A spacing-heavy lineup built around elite shooting gravity and clean driving lanes."
              : archetype === "Positionless Basketball"
                ? "A flexible lineup built around interchangeable roles, passing, and two-way versatility."
                : archetype === "Rim Pressure Unit"
                  ? "A physical lineup built around paint attacks, rim pressure, and interior dominance."
                  : archetype === "Playmaking Engine"
                    ? "A high-IQ creation lineup built around passing, pace control, and easy shot generation."
                    : archetype === "Offensive Superteam"
                      ? "A star-powered scoring lineup built around shot creation, isolation pressure, and matchup hunting."
                      : archetype === "Paint Control Unit"
                        ? "A physical interior lineup built around rebounding, size, and paint pressure."
                        : archetype === "Defensive Powerhouse"
                          ? "A defensive lineup built around physicality, rebounding, and matchup control."
                          : archetype === "Star-Powered Contender"
                            ? "A championship-level lineup built around elite talent, versatility, and star power."
                            : archetype === "Guard Creation Overload"
                              ? "A guard-heavy lineup with creation and pace, but defensive size and rebounding become clear pressure points."
                              : archetype === "Size Over Skill"
                                ? "A size-heavy lineup built around rebounding and interior force, but limited spacing can tighten the floor."
                                : archetype === "One-Way Offense"
                                  ? "An offense-first lineup with enough scoring to create pressure, but major defensive tradeoffs."
                                  : archetype === "Development Core"
                                    ? "A developmental lineup with low star pressure and a role structure that still needs definition."
                                    : "A balanced lineup built around two-way production, lineup flexibility, and reliable scoring.";
}

export function getCourtBalanceDescription(
  scores: LineupScoutScores,
  courtBalance: string,
) {
  const rankedScores = getRankedScoutScores(scores).filter(
    (score) => score.key !== "starPower",
  );

  const strongestScore = rankedScores[0];
  const secondStrongestScore = rankedScores[1];
  const weakestScore = rankedScores.at(-1);

  if (!strongestScore || !secondStrongestScore || !weakestScore) {
    return "This lineup has a balanced statistical profile across its main categories.";
  }

  const strongestLabel = strongestScore.label.toLowerCase();
  const secondStrongestLabel = secondStrongestScore.label.toLowerCase();
  const weakestLabel = weakestScore.label.toLowerCase();

  if (courtBalance === "Excellent") {
    return `Elite ${strongestLabel} and ${secondStrongestLabel} give this lineup a complete championship profile with very few pressure points.`;
  }

  if (courtBalance === "Good") {
    return `Strong ${strongestLabel} and ${secondStrongestLabel} create a dependable profile, while ${weakestLabel} is the main area to monitor.`;
  }

  if (courtBalance === "Uneven") {
    return `Elite ${strongestLabel} and ${secondStrongestLabel} outweigh below-average ${weakestLabel}, creating a powerful but uneven team shape.`;
  }

  return `Elite ${strongestLabel} and ${secondStrongestLabel} outweigh below-average ${weakestLabel}, creating a specialized championship profile.`;
}

export function getRankedScoutScores(scores: LineupScoutScores) {
  return Object.entries(scores)
    .filter(([key]) => key !== "balance" && key !== "overall")
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      key,
      value,
      label:
        key === "offense"
          ? "Offense"
          : key === "defense"
            ? "Defense"
            : key === "shooting"
              ? "Shooting"
              : key === "playmaking"
                ? "Playmaking"
                : key === "rebounding"
                  ? "Rebounding"
                  : "Star Power",
    }));
}

export function getSimilarLineupMatches(scores: LineupScoutScores) {
  const categoryWeights: Array<{
    key: keyof LineupReferenceScores;
    weight: number;
  }> = [
    { key: "offense", weight: 1 },
    { key: "defense", weight: 1.2 },
    { key: "shooting", weight: 1.15 },
    { key: "playmaking", weight: 1.05 },
    { key: "rebounding", weight: 1.25 },
    { key: "starPower", weight: 0.7 },
    { key: "overall", weight: 1.35 },
  ];

  const totalWeight = categoryWeights.reduce(
    (total, category) => total + category.weight,
    0,
  );

  return lineupReferenceCatalog
    .map((profile) => {
      const weightedDifference = categoryWeights.reduce(
        (total, category) =>
          total +
          Math.abs(scores[category.key] - profile.scores[category.key]) *
            category.weight,
        0,
      );

      const averageDifference = weightedDifference / totalWeight;
      const matchScore = Math.max(0, Math.round(100 - averageDifference));

      return {
        name: profile.name,
        description: profile.description,
        matchScore,
        tier: profile.tier,
        archetype: profile.archetype,
      };
    })
    .toSorted((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

export function getXFactorDescription(
  archetype: string,
  player: Player,
  stats: PlayerStats,
): string {
  const isBig = player.position === "F" || player.position === "C";
  const isWing = player.position === "F";
  const isGuard = player.position === "G";
  const ppg = stats.ppg ?? 0;
  const apg = stats.apg ?? 0;

  const isPrimaryScorer = ppg >= 25;
  const isElitePlaymaker = apg >= 7;
  const isEliteDefender = player.ratings.defense >= 90;

  if (archetype === "Floor Spacing Machine") {
    return isGuard
      ? "Shooting gravity bends the defense and opens the floor early."
      : isBig
        ? "Frontcourt spacing pulls rim protection away from the paint."
        : "Elite off-ball shooting creates clean driving lanes.";
  }

  if (
    archetype === "Playmaking Engine" ||
    archetype === "Point-Center Offense" ||
    archetype === "Positionless Basketball" ||
    archetype === "Guard Creation Overload"
  ) {
    return isBig && isElitePlaymaker
      ? "Frontcourt hub who organizes the offense through passing and touch."
      : isGuard && isElitePlaymaker
        ? "Primary initiator who controls tempo and creates advantages."
        : "Connector who keeps the offense moving across positions.";
  }

  if (
    archetype === "Offensive Superteam" ||
    archetype === "Iso Superteam" ||
    archetype === "Transition Attack" ||
    archetype === "One-Way Offense"
  ) {
    return isPrimaryScorer && isWing
      ? "Primary closer and matchup scorer from the wing."
      : isPrimaryScorer && isGuard
        ? "Perimeter creator who drives the team's scoring pressure."
        : isBig
          ? "Interior scoring force who collapses the defense."
          : "Scoring engine who creates pressure across matchups.";
  }

  if (
    archetype === "Paint Control Unit" ||
    archetype === "Rim Pressure Unit" ||
    archetype === "Size Over Skill"
  ) {
    return isBig
      ? "Interior force that controls the glass and pressures the rim."
      : "Downhill attacker who adds pressure around the rim.";
  }

  if (
    archetype === "Defensive Powerhouse" ||
    archetype === "Defensive Juggernaut" ||
    archetype === "Two-Way Dynasty"
  ) {
    return isBig
      ? "Defensive anchor who shapes the lineup's interior identity."
      : isWing && isPrimaryScorer && isEliteDefender
        ? "Primary closer and elite two-way wing pressure."
        : isWing && isEliteDefender
          ? "Elite wing stopper who drives the team's perimeter pressure."
          : "Point-of-attack defender who sets the tone on the perimeter.";
  }

  return isPrimaryScorer
    ? "Highest-impact star who drives the lineup's ceiling."
    : isElitePlaymaker
      ? "Primary organizer who ties the star talent together."
      : "Highest-impact player across the lineup structure.";
}
function getXFactorForArchetype(
  archetype: string,
  selectedSlots: {
    position: LineupSlot;
    player: Player;
  }[],
  statProfileMode: BuilderStatProfileMode,
): XFactorResult {
  const rankedPlayers = selectedSlots
    .map((slot) => {
      const player = slot.player;
      const stats = getStatsByMode(player, statProfileMode);
      const ppg = stats.ppg ?? 0;
      const rpg = stats.rpg ?? 0;
      const apg = stats.apg ?? 0;
      const threePercent = stats.threePercent ?? 0;

      let fitScore =
        getBuilderPlayerRatingForPosition(
          player,
          slot.position,
          statProfileMode,
        ) *
          0.35 +
        player.ratings.starPower * 0.25 +
        player.ratings.defense * 0.15 +
        ppg * 0.8;

      if (archetype === "Floor Spacing Machine") {
        fitScore += threePercent * 0.9;
      }

      if (
        archetype === "Playmaking Engine" ||
        archetype === "Point-Center Offense" ||
        archetype === "Positionless Basketball" ||
        archetype === "Guard Creation Overload"
      ) {
        fitScore += apg * 5;
      }

      if (
        archetype === "Paint Control Unit" ||
        archetype === "Rim Pressure Unit" ||
        archetype === "Size Over Skill"
      ) {
        fitScore += rpg * 4;
      }

      if (
        archetype === "Defensive Powerhouse" ||
        archetype === "Defensive Juggernaut" ||
        archetype === "Two-Way Dynasty"
      ) {
        fitScore += player.ratings.defense * 0.6;
      }

      if (
        archetype === "Offensive Superteam" ||
        archetype === "Iso Superteam" ||
        archetype === "Transition Attack" ||
        archetype === "One-Way Offense"
      ) {
        fitScore += ppg * 2;
      }

      return {
        player,
        fitScore,
      };
    })
    .toSorted((a, b) => b.fitScore - a.fitScore);

  const player = rankedPlayers[0].player;
  const stats = getStatsByMode(player, statProfileMode);

  return {
    player,
    description: getXFactorDescription(archetype, player, stats),
  };
}

function getPlayerTraits(
  player: Player,
  statProfileMode: BuilderStatProfileMode,
  slotPosition?: LineupSlot,
) {
  const stats = getStatsByMode(player, statProfileMode);
  const ppg = stats.ppg ?? 0;
  const rpg = stats.rpg ?? 0;
  const apg = stats.apg ?? 0;
  const threePercent = stats.threePercent ?? 0;

  const isBig = player.position === "F" || player.position === "C";
  const isForward = player.position === "F";
  return {
    eliteShooter: threePercent >= 38,
    eliteScorer: ppg >= 25,
    elitePlaymaker: apg >= 7,
    eliteRebounder: rpg >= 10,
    eliteDefender: player.ratings.defense >= 90,
    highStarPower: player.ratings.starPower >= 95,

    eliteCreator: ppg >= 24 && apg >= 5,
    elitePasser: apg >= 7,
    eliteTwoWay: ppg >= 22 && player.ratings.defense >= 88,

    versatileForward: isForward && apg >= 5,
    stretchBig: isBig && threePercent >= 35,
    interiorBig: isBig && (rpg >= 10 || player.ratings.defense >= 88),

    eliteBig:
      (slotPosition === "PF" || slotPosition === "C") &&
      player.ratings.starPower >= 90 &&
      rpg >= 9,
  };
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function getLineupConstructionAdjustment(
  selectedSlots: {
    position: LineupSlot;
    player: Player;
  }[],
  selectedPlayerStats: PlayerStats[],
  statProfileMode: BuilderStatProfileMode,
) {
  if (selectedSlots.length < 5) {
    return 0;
  }

  const fitCounts: Record<PositionFit, number> = {
    natural: 0,
    flex: 0,
    reach: 0,
    mismatch: 0,
  };

  const fitsBySlot = new Map<LineupSlot, PositionFit>();

  selectedSlots.forEach((slot) => {
    const fit = getPositionFit(slot.player, slot.position, statProfileMode);

    fitCounts[fit] += 1;
    fitsBySlot.set(slot.position, fit);
  });

  const shooters = selectedPlayerStats.filter(
    (stats) =>
      (stats.threePercent ?? 0) >= 36 &&
      (stats.threeAttemptsPerGame ?? 0) >= 2,
  ).length;

  const creators = selectedPlayerStats.filter(
    (stats) => (stats.apg ?? 0) >= 5,
  ).length;

  const rimAnchors = selectedSlots.filter((slot, index) => {
    const stats = selectedPlayerStats[index];

    return (
      (slot.position === "PF" || slot.position === "C") &&
      (stats.rpg ?? 0) >= 8 &&
      (slot.player.ratings.defense >= 78 || (stats.bpg ?? 0) >= 0.7)
    );
  }).length;

  const highUsageCreators = selectedPlayerStats.filter(
    (stats) => (stats.ppg ?? 0) >= 24 && (stats.apg ?? 0) >= 5,
  ).length;

  let adjustment = 0;

  if (fitCounts.natural === 0) {
    adjustment -= 4;
  } else if (fitCounts.natural <= 1) {
    adjustment -= 2;
  }

  if (fitCounts.reach + fitCounts.mismatch >= 3) {
    adjustment -= 3;
  }

  if (fitCounts.mismatch >= 2) {
    adjustment -= 3;
  }

  const centerFit = fitsBySlot.get("C");

  if (centerFit === "reach") {
    adjustment -= 1.5;
  } else if (centerFit === "mismatch") {
    adjustment -= 3;
  }

  const backcourtFits = [fitsBySlot.get("PG"), fitsBySlot.get("SG")];
  const unstableBackcourt = backcourtFits.every(
    (fit) => fit === "reach" || fit === "mismatch",
  );

  if (unstableBackcourt) {
    adjustment -= 2;
  }

  if (shooters < 2) {
    adjustment -= 1.5;
  }

  if (creators === 0) {
    adjustment -= 2;
  }

  if (rimAnchors === 0 && centerFit !== "natural" && centerFit !== "flex") {
    adjustment -= 2;
  }

  if (highUsageCreators >= 4 && shooters < 3) {
    adjustment -= 1.5;
  }

  if (fitCounts.natural >= 3 && fitCounts.mismatch === 0) {
    adjustment += 1.5;
  }

  if (creators >= 2 && shooters >= 2 && rimAnchors >= 1) {
    adjustment += 1;
  }

  return Math.max(-12, Math.min(3, adjustment));
}

export function getLineupScoutReport(
  selectedSlots: {
    position: LineupSlot;
    player: Player;
  }[],
  statProfileMode: BuilderStatProfileMode = "career",
): LineupScoutReport {
  if (selectedSlots.length === 0) {
    return {
      summary: "Draft a full lineup to generate a scouting report.",
      tier: "Incomplete Lineup",
      archetype: "Unknown",
      teamIdentity: "Unknown",
      strengths: [],
      weaknesses: [],
      tradeoff: "--",
      grades: {
        offense: "--",
        defense: "--",
        shooting: "--",
        playmaking: "--",
        rebounding: "--",
      },
      scores: {
        offense: 0,
        defense: 0,
        shooting: 0,
        playmaking: 0,
        rebounding: 0,
        starPower: 0,
        balance: 0,
        overall: 0,
      },
      xFactor: null,
      similarTo: "--",
      similarToDescription: "--",
      similarLineupMatches: [
        {
          name: "--",
          description: "--",
          matchScore: 0,
        },
      ],
      courtBalance: "--",
      courtBalanceDescription: "--",
      badges: [],
    };
  }

  const selectedPlayers = selectedSlots.map((slot) => slot.player);
  const selectedPlayerStats = selectedPlayers.map((player) =>
    getStatsByMode(player, statProfileMode),
  );

  const selectedPlayerTraits = selectedSlots.map((slot) => ({
    player: slot.player,
    position: slot.position,
    traits: getPlayerTraits(slot.player, statProfileMode, slot.position),
  }));

  const eliteShooters = selectedPlayerTraits.filter(
    (item) => item.traits.eliteShooter,
  ).length;

  const eliteScorers = selectedPlayerTraits.filter(
    (item) => item.traits.eliteScorer,
  ).length;

  const elitePlaymakers = selectedPlayerTraits.filter(
    (item) => item.traits.elitePlaymaker,
  ).length;

  const eliteRebounders = selectedPlayerTraits.filter(
    (item) => item.traits.eliteRebounder,
  ).length;

  const eliteDefenders = selectedPlayerTraits.filter(
    (item) => item.traits.eliteDefender,
  ).length;

  const eliteBigs = selectedPlayerTraits.filter(
    (item) => item.traits.eliteBig,
  ).length;

  const eliteCreators = selectedPlayerTraits.filter(
    (item) => item.traits.eliteCreator,
  ).length;

  const elitePassers = selectedPlayerTraits.filter(
    (item) => item.traits.elitePasser,
  ).length;

  const eliteInteriorPlayers = selectedPlayerTraits.filter(
    (item) => item.traits.interiorBig,
  ).length;

  const eliteTwoWayPlayers = selectedPlayerTraits.filter(
    (item) => item.traits.eliteTwoWay,
  ).length;

  const superstarCount = selectedPlayerTraits.filter(
    (item) => item.traits.highStarPower,
  ).length;

  const pointCenterBigs = selectedPlayerTraits.filter((item) => {
    const stats = getStatsByMode(item.player, statProfileMode);

    return (
      (item.position === "PF" || item.position === "C") &&
      (stats.apg ?? 0) >= 6 &&
      (stats.rpg ?? 0) >= 8
    );
  }).length;

  const versatileForwards = selectedPlayerTraits.filter(
    (item) => item.traits.versatileForward,
  ).length;

  const traditionalCenters = selectedSlots.filter(
    (slot) => slot.position === "C" && slot.player.position === "C",
  ).length;

  const trueBigs = selectedPlayerStats.filter(
    (stats, index) =>
      selectedPlayers[index].position === "C" ||
      (selectedPlayers[index].heightInches ?? 0) >= 82 ||
      ((stats.rpg ?? 0) >= 8 && (stats.bpg ?? 0) >= 0.7),
  ).length;

  const trueGuards = selectedPlayers.filter(
    (player) =>
      player.position === "G" || (player.heightInches ?? 99) <= 76,
  ).length;

  const passablePlayers = selectedPlayerStats.filter(
    (stats) => (stats.apg ?? 0) >= 4.5,
  ).length;

  const scoring =
    selectedPlayerStats.reduce((total, stats) => total + (stats.ppg ?? 0), 0) /
    selectedPlayers.length;

  const shooting =
    selectedPlayerStats.reduce(
      (total, stats) => total + (stats.threePercent ?? 0),
      0,
    ) / selectedPlayers.length;

  const playmaking =
    selectedPlayerStats.reduce((total, stats) => total + (stats.apg ?? 0), 0) /
    selectedPlayers.length;

  const rebounding =
    selectedPlayerStats.reduce((total, stats) => total + (stats.rpg ?? 0), 0) /
    selectedPlayers.length;

  const efficiency =
    selectedPlayerStats.reduce(
      (total, stats) => total + (stats.fgPercent ?? 0),
      0,
    ) / selectedPlayers.length;

  const adjustedOverall =
    selectedSlots.reduce(
      (total, slot) =>
        total +
        getBuilderPlayerRatingForPosition(
          slot.player,
          slot.position,
          statProfileMode,
        ),
      0,
    ) / selectedSlots.length;

  const shootingScore = normalizeStat(shooting, 40);
  const playmakingScore = normalizeStat(playmaking, 8);
  const reboundingScore = normalizeStat(rebounding, 11);
  const scoringScore = normalizeStat(scoring, 25);
  const efficiencyScore = normalizeStat(efficiency, 58);
  const offenseScore =
    scoringScore * 0.45 + efficiencyScore * 0.3 + playmakingScore * 0.25;
  const defense =
    selectedPlayers.reduce(
      (total, player) => total + player.ratings.defense,
      0,
    ) / selectedPlayers.length;
  const defenseScore = defense * 0.75 + reboundingScore * 0.25;
  const starPower =
    selectedPlayers.reduce(
      (total, player) => total + player.ratings.starPower,
      0,
    ) / selectedPlayers.length;

  let adjustedShootingScore = shootingScore;
  let adjustedPlaymakingScore = playmakingScore;
  let adjustedReboundingScore = reboundingScore;
  let adjustedOffenseScore = offenseScore;
  let adjustedDefenseScore = defenseScore;

  // Trait-based chemistry bonuses
  if (eliteShooters >= 3) {
    adjustedShootingScore += 6;
  }

  if (eliteShooters >= 4) {
    adjustedShootingScore += 4;
    adjustedOffenseScore += 3;
  }

  if (elitePlaymakers >= 2) {
    adjustedPlaymakingScore += 5;
  }

  if (elitePlaymakers >= 3) {
    adjustedPlaymakingScore += 4;
    adjustedOffenseScore += 4;
  }

  if (eliteShooters >= 1 && pointCenterBigs >= 1) {
    adjustedOffenseScore += 5;
    adjustedPlaymakingScore += 3;
  }

  if (eliteCreators >= 2 && eliteShooters >= 2) {
    adjustedOffenseScore += 5;
  }

  if (eliteInteriorPlayers >= 2) {
    adjustedReboundingScore += 5;
  }

  if (eliteInteriorPlayers >= 3) {
    adjustedReboundingScore += 4;
    adjustedDefenseScore += 4;
  }

  if (eliteDefenders >= 3) {
    adjustedDefenseScore += 6;
  }

  if (eliteTwoWayPlayers >= 3) {
    adjustedDefenseScore += 4;
    adjustedOffenseScore += 3;
  }

  if (eliteRebounders >= 3) {
    adjustedReboundingScore += 4;
  }

  if (eliteScorers >= 3) {
    adjustedOffenseScore += 5;
  }

  // Spacing penalty for big-heavy, low-shooting builds
  if (eliteInteriorPlayers >= 3 && eliteShooters < 2) {
    adjustedShootingScore -= 10;
    adjustedOffenseScore -= 4;
  }

  adjustedShootingScore = clampScore(adjustedShootingScore);
  adjustedPlaymakingScore = clampScore(adjustedPlaymakingScore);
  adjustedReboundingScore = clampScore(adjustedReboundingScore);
  adjustedOffenseScore = clampScore(adjustedOffenseScore);
  adjustedDefenseScore = clampScore(adjustedDefenseScore);

  const teamCategoryAverage =
    adjustedOffenseScore * 0.24 +
    adjustedDefenseScore * 0.18 +
    adjustedShootingScore * 0.14 +
    adjustedPlaymakingScore * 0.14 +
    adjustedReboundingScore * 0.18 +
    starPower * 0.12;

  const constructionAdjustment = getLineupConstructionAdjustment(
    selectedSlots,
    selectedPlayerStats,
    statProfileMode,
  );

  const lineupCeiling =
    adjustedOverall * 0.6 + teamCategoryAverage * 0.4 + constructionAdjustment;

  const finalOverall = Number(clampScore(lineupCeiling).toFixed(1));

  const scores: LineupScoutScores = {
    offense: adjustedOffenseScore,
    defense: adjustedDefenseScore,
    shooting: adjustedShootingScore,
    playmaking: adjustedPlaymakingScore,
    rebounding: adjustedReboundingScore,
    starPower,
    balance: Math.round(
      (adjustedOffenseScore +
        adjustedDefenseScore +
        adjustedShootingScore +
        adjustedPlaymakingScore +
        adjustedReboundingScore) /
        5,
    ),
    overall: finalOverall,
  };

  const similarLineupMatches = getSimilarLineupMatches(scores);
  const closestSimilarLineup = similarLineupMatches[0];

  const strengths = [
    adjustedOffenseScore >= 82 || eliteScorers >= 2 ? "Offense" : null,
    adjustedDefenseScore >= 82 ? "Defense" : null,
    adjustedShootingScore >= 82 || eliteShooters >= 2 ? "Shooting" : null,
    adjustedPlaymakingScore >= 82 || elitePlaymakers >= 2 ? "Playmaking" : null,
    adjustedReboundingScore >= 82 || eliteRebounders >= 2 ? "Rebounding" : null,

    eliteScorers >= 3 && adjustedOffenseScore >= 85 ? "Shot Creation" : null,

    eliteShooters >= 3 ? "Floor Spacing" : null,

    elitePlaymakers >= 3 ? "Ball Movement" : null,

    eliteRebounders >= 3 ? "Rim Pressure" : null,

    adjustedDefenseScore >= 88 && eliteRebounders >= 2
      ? "Interior Defense"
      : null,

    adjustedOffenseScore >= 86 && adjustedPlaymakingScore >= 82
      ? "Transition Scoring"
      : null,

    adjustedOffenseScore >= 82 &&
    adjustedDefenseScore >= 82 &&
    adjustedPlaymakingScore >= 78
      ? "Versatility"
      : null,

    constructionAdjustment >= 1 ? "Lineup Cohesion" : null,

    adjustedOverall >= 92 ? "Leadership" : null,
  ]
    .filter((strength): strength is string => Boolean(strength))
    .slice(0, 4);

  const weaknesses = Array.from(
    new Set(
      [
        adjustedShootingScore < 70 && eliteShooters < 2
          ? "Floor Spacing"
          : null,

        adjustedShootingScore < 60 ? "Poor Spacing" : null,

        adjustedPlaymakingScore < 68 && elitePlaymakers === 0
          ? "Playmaking"
          : null,

        adjustedPlaymakingScore < 60 ? "No Primary Creator" : null,

        adjustedOffenseScore < 68 && eliteScorers < 2
          ? "Half-Court Offense"
          : null,

        adjustedReboundingScore < 68 && eliteRebounders === 0
          ? "Rim Protection"
          : null,

        adjustedReboundingScore < 60 ? "Rebounding Problem" : null,

        adjustedDefenseScore < 68 ? "Perimeter Defense" : null,

        adjustedDefenseScore < 60 ? "Defensive Liability" : null,

        adjustedOffenseScore < 72 && eliteScorers === 0
          ? "Isolation Scoring"
          : null,

        trueGuards >= 3 && adjustedDefenseScore < 72
          ? "Small Backcourt"
          : null,

        trueBigs >= 3 && adjustedShootingScore < 70 ? "Crowded Paint" : null,

        selectedPlayers.length < 5 ? "Bench Creation" : null,

        constructionAdjustment <= -4 ? "Position Fit" : null,
        constructionAdjustment <= -4 ? "Out of Position" : null,

        starPower < 55 ? "Low Star Power" : null,
      ].filter((weakness): weakness is string => Boolean(weakness)),
    ),
  ).slice(0, 4);

  const weakestScore = getRankedScoutScores(scores)
    .filter((score) => score.key !== "starPower")
    .at(-1);

  const hasClearTradeoff = weakestScore ? weakestScore.value < 72 : false;

  const tradeoff =
    !hasClearTradeoff && constructionAdjustment > -4
      ? "No major tradeoff."
      : trueBigs >= 3 && adjustedShootingScore < 70
        ? "This lineup controls size and rebounding, but the paint may feel crowded without enough spacing."
        : trueGuards >= 3 &&
            (adjustedDefenseScore < 72 || adjustedReboundingScore < 65)
          ? "This lineup has plenty of ball-handling, but defense, size, and rebounding become pressure points."
          : constructionAdjustment <= -4
            ? "This lineup has talent, but several players are stretched away from their cleanest roles."
            : starPower < 55
              ? "This lineup has structure, but may lack the top-end talent needed to swing difficult matchups."
              : adjustedPlaymakingScore < 60
                ? "This lineup can produce in spots, but may struggle to create reliable advantages."
      : weakestScore?.key === "shooting"
        ? "This lineup sacrifices spacing for size, rebounding, and interior control."
        : weakestScore?.key === "playmaking"
          ? "This lineup leans more on individual talent than constant table-setting."
          : weakestScore?.key === "offense"
            ? "This lineup wins through structure and defense more than pure scoring pressure."
            : weakestScore?.key === "defense"
              ? "This lineup prioritizes offensive talent over defensive coverage."
              : weakestScore?.key === "rebounding"
                ? "This lineup trades some glass control for skill, speed, or spacing."
                : "No major tradeoff.";

  const tier =
    finalOverall >= 94
      ? "Championship Favorite"
      : finalOverall >= 90
        ? "Championship Contender"
        : finalOverall >= 86
          ? "Playoff Caliber"
          : finalOverall >= 80
            ? "Competitive Build"
            : finalOverall >= 72
              ? "Specialist Build"
              : finalOverall >= 62
                ? "Flawed Build"
                : "Developmental Lineup";

  let archetype = "Balanced Core";

  if (
    adjustedDefenseScore >= 88 &&
    adjustedOffenseScore >= 88 &&
    adjustedOverall >= 92
  ) {
    archetype = "Two-Way Dynasty";
  } else if (
    pointCenterBigs >= 1 &&
    adjustedPlaymakingScore >= 88 &&
    adjustedReboundingScore >= 82
  ) {
    archetype = "Point-Center Offense";
  } else if (eliteShooters >= 4 && adjustedShootingScore >= 88) {
    archetype = "Floor Spacing Machine";
  } else if (eliteScorers >= 4 && adjustedOffenseScore >= 90) {
    archetype = "Iso Superteam";
  } else if (adjustedDefenseScore >= 92 && eliteRebounders >= 2) {
    archetype = "Defensive Juggernaut";
  } else if (
    eliteScorers >= 3 &&
    elitePlaymakers >= 2 &&
    adjustedOffenseScore >= 86
  ) {
    archetype = "Transition Attack";
  } else if (tier === "Developmental Lineup") {
    archetype = "Development Core";
  } else if (trueBigs >= 3 && adjustedShootingScore < 70) {
    archetype = "Size Over Skill";
  } else if (trueGuards >= 3 && adjustedDefenseScore < 72) {
    archetype = "Guard Creation Overload";
  } else if (adjustedOffenseScore >= 82 && adjustedDefenseScore < 65) {
    archetype = "One-Way Offense";
  } else if (eliteRebounders >= 3 && adjustedOffenseScore >= 82) {
    archetype = "Rim Pressure Unit";
  } else if (
    elitePlaymakers >= 3 &&
    adjustedDefenseScore >= 82 &&
    adjustedOffenseScore >= 82
  ) {
    archetype = "Positionless Basketball";
  } else if (eliteShooters >= 3 && adjustedShootingScore >= 80) {
    archetype = "Floor Spacing Machine";
  } else if (elitePlaymakers >= 3 && adjustedPlaymakingScore >= 80) {
    archetype = "Playmaking Engine";
  } else if (eliteScorers >= 3 && adjustedOffenseScore >= 85) {
    archetype = "Offensive Superteam";
  } else if (eliteRebounders >= 3 && adjustedReboundingScore >= 85) {
    archetype = "Paint Control Unit";
  } else if (adjustedDefenseScore >= 85 && adjustedReboundingScore >= 85) {
    archetype = "Defensive Powerhouse";
  } else if (starPower >= 94 && adjustedOverall >= 88) {
    archetype = "Star-Powered Contender";
  }

  const xFactor = getXFactorForArchetype(
    archetype,
    selectedSlots,
    statProfileMode,
  );

  const teamIdentity = getTeamIdentity({
    archetype,
    trueBigs,
    trueGuards,
    adjustedShootingScore,
    adjustedPlaymakingScore,
    adjustedDefenseScore,
    adjustedReboundingScore,
    adjustedOffenseScore,
    starPower,
    constructionAdjustment,
  });

  const similarTo = `${closestSimilarLineup.name} (${getLineupReferenceTierLabel(
    closestSimilarLineup.tier,
  )}, ${closestSimilarLineup.matchScore}%)`;
  const similarToDescription = closestSimilarLineup.description;

  const summary = getLineupSummary({
    archetype,
    tier,
    trueBigs,
    trueGuards,
    adjustedShootingScore,
    adjustedPlaymakingScore,
    adjustedDefenseScore,
    constructionAdjustment,
  });

  const scoreValues = [
    adjustedOffenseScore,
    adjustedDefenseScore,
    adjustedShootingScore,
    adjustedPlaymakingScore,
    adjustedReboundingScore,
  ];

  const highestScore = Math.max(...scoreValues);
  const lowestScore = Math.min(...scoreValues);
  const scoreSpread = highestScore - lowestScore;

  const courtBalance =
    scoreSpread <= 12
      ? "Excellent"
      : scoreSpread <= 20
        ? "Good"
        : scoreSpread <= 30
          ? "Uneven"
          : "Specialized";

  const courtBalanceDescription = getCourtBalanceDescription(
    scores,
    courtBalance,
  );

  const qualityBadges = [
    finalOverall >= 94 ? "Championship DNA" : null,

    finalOverall >= 90 &&
    adjustedDefenseScore >= 85 &&
    adjustedOffenseScore >= 85
      ? "Elite Two-Way Core"
      : null,

    finalOverall >= 88 && starPower >= 88 ? "Star-Driven Ceiling" : null,

    adjustedShootingScore >= 85 ? "Spacing Advantage" : null,
    adjustedPlaymakingScore >= 85 ? "Multiple Advantage Creators" : null,
    adjustedReboundingScore >= 85 ? "Interior Control" : null,

    finalOverall < 80 && adjustedShootingScore < 65 ? "Spacing Concern" : null,
    finalOverall < 80 && adjustedPlaymakingScore < 65 ? "No True Creator" : null,
    finalOverall < 80 && adjustedDefenseScore < 65
      ? "Defensive Liability"
      : null,
    finalOverall < 80 && adjustedReboundingScore < 65
      ? "Rebounding Problem"
      : null,
    constructionAdjustment <= -4 ? "Position Fit Issues" : null,
    trueBigs >= 3 && adjustedShootingScore < 70 ? "Crowded Paint" : null,
    trueGuards >= 3 && adjustedDefenseScore < 70 ? "Undersized Defense" : null,
    starPower < 55 ? "Low Star Ceiling" : null,
  ].filter((badge): badge is string => Boolean(badge));

  const chemistryBadges = [
    superstarCount >= 4 ? "GOAT Collection" : null,

    superstarCount >= 3 && eliteDefenders >= 2 && adjustedOverall >= 92
      ? "Dynasty Core"
      : null,

    adjustedPlaymakingScore >= 88 && adjustedOffenseScore >= 88
      ? "Showtime Offense"
      : null,

    eliteShooters >= 4 && traditionalCenters === 0 ? "Five-Out Attack" : null,

    eliteBigs >= 2 && adjustedReboundingScore >= 88
      ? "Historic Frontcourt"
      : null,

    eliteScorers >= 3 && adjustedOffenseScore >= 88
      ? "Elite Shot Creation"
      : null,

    superstarCount >= 3 ? "Big Three" : null,
    versatileForwards >= 2 && elitePassers >= 2 ? "Positionless Core" : null,
    passablePlayers >= 5 ? "Positionless" : null,
    eliteBigs >= 2 ? "Twin Towers" : null,
    trueBigs <= 1 ? "Small Ball" : null,
    eliteShooters >= 4 ? "Floor Spacing" : null,
    eliteDefenders >= 3 ? "Defensive Wall" : null,
  ].filter((badge): badge is string => Boolean(badge));

  const scoreBadges = [
    adjustedShootingScore >= 85 || eliteShooters >= 3 ? "Elite Shooting" : null,
    adjustedDefenseScore >= 85 ? "Defensive Identity" : null,
    adjustedOffenseScore >= 85 && adjustedPlaymakingScore >= 80
      ? "Transition Threat"
      : null,
    adjustedPlaymakingScore >= 85 || elitePlaymakers >= 3
      ? "High IQ Basketball"
      : null,
    adjustedReboundingScore >= 85 || eliteRebounders >= 3
      ? "Physical Frontcourt"
      : null,
  ].filter((badge): badge is string => Boolean(badge));

  const badges = [...qualityBadges, ...chemistryBadges, ...scoreBadges].slice(
    0,
    4,
  );

  return {
    summary,
    tier,
    archetype,
    teamIdentity,
    strengths: strengths.length > 0 ? strengths : ["Balanced production"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["No major weakness"],
    tradeoff,
    grades: {
      offense: getGrade(adjustedOffenseScore),
      defense: getGrade(adjustedDefenseScore),
      shooting: getGrade(adjustedShootingScore),
      playmaking: getGrade(adjustedPlaymakingScore),
      rebounding: getGrade(adjustedReboundingScore),
    },
    scores,
    xFactor,
    similarTo,
    similarToDescription,
    similarLineupMatches,
    courtBalance,
    courtBalanceDescription,
    badges,
  };
}
