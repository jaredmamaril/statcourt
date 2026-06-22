import {
  normalizeStat,
  players,
  type Player,
  type Position,
} from "./court-data";
import { getPlayerRating } from "./player-ratings";

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

type SimilarLineupProfile = {
  name: string;
  scores: Pick<
    LineupScoutScores,
    "offense" | "defense" | "shooting" | "playmaking" | "rebounding"
  >;
  description: string;
};

const similarLineupProfiles: SimilarLineupProfile[] = [
  {
    name: "2017 Warriors",
    scores: {
      offense: 96,
      defense: 86,
      shooting: 99,
      playmaking: 92,
      rebounding: 78,
    },
    description: "Elite spacing, shooting gravity, and offensive flow.",
  },
  {
    name: "1986 Celtics",
    scores: {
      offense: 91,
      defense: 88,
      shooting: 84,
      playmaking: 92,
      rebounding: 90,
    },
    description: "High-IQ passing, frontcourt skill, and connected offense.",
  },
  {
    name: "2012 Heat",
    scores: {
      offense: 92,
      defense: 90,
      shooting: 78,
      playmaking: 86,
      rebounding: 76,
    },
    description:
      "Downhill pressure, transition attacks, and elite athletic creation.",
  },
  {
    name: "2001 Lakers",
    scores: {
      offense: 90,
      defense: 84,
      shooting: 65,
      playmaking: 72,
      rebounding: 95,
    },
    description:
      "Interior dominance paired with elite perimeter shot creation.",
  },
  {
    name: "1996 Bulls",
    scores: {
      offense: 89,
      defense: 97,
      shooting: 76,
      playmaking: 82,
      rebounding: 92,
    },
    description: "Elite defense, rebounding, and physical control.",
  },
  {
    name: "All-Time Lakers",
    scores: {
      offense: 94,
      defense: 88,
      shooting: 75,
      playmaking: 90,
      rebounding: 94,
    },
    description: "Legendary top-end talent across every position.",
  },
];

export type LineupScoutScores = {
  offense: number;
  defense: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  starPower: number;
  balance: number;
};

export type PositionFit = "natural" | "secondary" | "emergency" | "mismatch";

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
  }[];
  courtBalance: string;
  courtBalanceDescription: string;
  badges: string[];
};

export function getLineupTierColor(tier: string) {
  if (tier === "Championship Favorite") return "#EFBF04";
  if (tier === "Championship Contender") return "#1bc2ec";
  if (tier === "Playoff-Caliber") return "#FFFFFF";
  if (tier === "Developmental Lineup") return "#94A3B8";

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

    "Spacing Superteam":
      "Multiple elite shooters stretch defenses beyond their limits while maintaining high-level creation.",

    "Point-Center Offense":
      "The offense flows through a frontcourt playmaker capable of creating advantages from every area of the floor.",

    "Floor Spacing Machine":
      "Shooting depth across the lineup creates constant spacing pressure and opens clean driving lanes.",

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
  };

  return (
    reasons[archetype] ??
    "This lineup has a strong statistical identity built around its best players."
  );
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
    .filter(([key]) => key !== "balance")
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
  const categoryKeys: Array<keyof SimilarLineupProfile["scores"]> = [
    "offense",
    "defense",
    "shooting",
    "playmaking",
    "rebounding",
  ];

  return similarLineupProfiles
    .map((profile) => {
      const totalDifference = categoryKeys.reduce(
        (total, key) => total + Math.abs(scores[key] - profile.scores[key]),
        0,
      );

      const averageDifference = totalDifference / categoryKeys.length;
      const matchScore = Math.max(0, Math.round(100 - averageDifference));

      return {
        name: profile.name,
        description: profile.description,
        matchScore,
      };
    })
    .toSorted((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

export function getXFactorDescription(
  archetype: string,
  player: (typeof players)[number],
): string {
  const isBig = player.position === "PF" || player.position === "C";
  const isWing = player.position === "SG" || player.position === "SF";
  const isGuard = player.position === "PG" || player.position === "SG";
  const isPrimaryScorer = player.stats.ppg >= 25;
  const isElitePlaymaker = player.stats.apg >= 7;
  const isEliteDefender = player.defenseRating >= 90;

  if (
    archetype === "Spacing Superteam" ||
    archetype === "Floor Spacing Machine"
  ) {
    return isGuard
      ? "Shooting gravity bends the defense and opens the floor early."
      : isBig
        ? "Frontcourt spacing pulls rim protection away from the paint."
        : "Elite off-ball shooting creates clean driving lanes.";
  }

  if (
    archetype === "Playmaking Engine" ||
    archetype === "Point-Center Offense" ||
    archetype === "Positionless Basketball"
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
    archetype === "Transition Attack"
  ) {
    return isPrimaryScorer && isWing
      ? "Primary closer and matchup scorer from the wing."
      : isPrimaryScorer && isGuard
        ? "Perimeter creator who drives the team's scoring pressure."
        : isBig
          ? "Interior scoring force who collapses the defense."
          : "Scoring engine who creates pressure across matchups.";
  }

  if (archetype === "Paint Control Unit" || archetype === "Rim Pressure Unit") {
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
    position: Position;
    player: (typeof players)[number];
  }[],
): XFactorResult {
  const rankedPlayers = selectedSlots
    .map((slot) => {
      const player = slot.player;

      let fitScore =
        getBuilderPlayerRatingForPosition(player, slot.position) * 0.35 +
        player.starPower * 0.25 +
        player.defenseRating * 0.15 +
        player.stats.ppg * 0.8;

      if (
        archetype === "Spacing Superteam" ||
        archetype === "Floor Spacing Machine"
      ) {
        fitScore += player.stats.threePercent * 0.9;
      }

      if (
        archetype === "Playmaking Engine" ||
        archetype === "Point-Center Offense" ||
        archetype === "Positionless Basketball"
      ) {
        fitScore += player.stats.apg * 5;
      }

      if (
        archetype === "Paint Control Unit" ||
        archetype === "Rim Pressure Unit"
      ) {
        fitScore += player.stats.rpg * 4;
      }

      if (
        archetype === "Defensive Powerhouse" ||
        archetype === "Defensive Juggernaut" ||
        archetype === "Two-Way Dynasty"
      ) {
        fitScore += player.defenseRating * 0.6;
      }

      if (
        archetype === "Offensive Superteam" ||
        archetype === "Iso Superteam" ||
        archetype === "Transition Attack"
      ) {
        fitScore += player.stats.ppg * 2;
      }

      return {
        player,
        fitScore,
      };
    })
    .toSorted((a, b) => b.fitScore - a.fitScore);

  const player = rankedPlayers[0].player;

  return {
    player,
    description: getXFactorDescription(archetype, player),
  };
}

function getPlayerTraits(
  player: (typeof players)[number],
  slotPosition?: Position,
) {
  const isBig = player.position === "PF" || player.position === "C";
  const isForward = player.position === "SF" || player.position === "PF";

  return {
    eliteShooter: player.stats.threePercent >= 38,
    eliteScorer: player.stats.ppg >= 25,
    elitePlaymaker: player.stats.apg >= 7,
    eliteRebounder: player.stats.rpg >= 10,
    eliteDefender: player.defenseRating >= 90,
    highStarPower: player.starPower >= 95,

    eliteCreator: player.stats.ppg >= 24 && player.stats.apg >= 5,
    elitePasser: player.stats.apg >= 7,
    eliteTwoWay: player.stats.ppg >= 22 && player.defenseRating >= 88,

    versatileForward: isForward && player.stats.apg >= 5,
    stretchBig: isBig && player.stats.threePercent >= 35,
    interiorBig:
      isBig && (player.stats.rpg >= 10 || player.defenseRating >= 88),

    eliteBig:
      (slotPosition === "PF" || slotPosition === "C") &&
      player.starPower >= 90 &&
      player.stats.rpg >= 9,
  };
}

export function getPositionFit(player: Player, slot: Position): PositionFit {
  if (player.position === slot) return "natural";
  if (player.secondaryPositions?.includes(slot)) return "secondary";
  if (player.emergencyPositions?.includes(slot)) return "emergency";
  return "mismatch";
}

export function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "secondary") return 2;
  if (fit === "emergency") return 5;
  return 10;
}

export function getBuilderPlayerRatingForPosition(
  player: Player,
  slot: Position,
) {
  return (
    getPlayerRating(player, "overall") -
    getPositionPenalty(getPositionFit(player, slot))
  );
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function getLineupScoutReport(
  selectedSlots: {
    position: Position;
    player: (typeof players)[number];
  }[],
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

  const selectedPlayerTraits = selectedSlots.map((slot) => ({
    player: slot.player,
    position: slot.position,
    traits: getPlayerTraits(slot.player, slot.position),
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

  const pointCenterBigs = selectedPlayerTraits.filter(
    (item) =>
      (item.position === "PF" || item.position === "C") &&
      item.player.stats.apg >= 6 &&
      item.player.stats.rpg >= 8,
  ).length;

  const versatileForwards = selectedPlayerTraits.filter(
    (item) => item.traits.versatileForward,
  ).length;

  const traditionalCenters = selectedSlots.filter(
    (slot) => slot.position === "C" && slot.player.position === "C",
  ).length;

  const passablePlayers = selectedPlayers.filter(
    (player) => player.stats.apg >= 4.5,
  ).length;

  const scoring =
    selectedPlayers.reduce((total, player) => total + player.stats.ppg, 0) /
    selectedPlayers.length;

  const shooting =
    selectedPlayers.reduce(
      (total, player) => total + player.stats.threePercent,
      0,
    ) / selectedPlayers.length;

  const playmaking =
    selectedPlayers.reduce((total, player) => total + player.stats.apg, 0) /
    selectedPlayers.length;

  const rebounding =
    selectedPlayers.reduce((total, player) => total + player.stats.rpg, 0) /
    selectedPlayers.length;

  const efficiency =
    selectedPlayers.reduce(
      (total, player) => total + player.stats.fgPercent,
      0,
    ) / selectedPlayers.length;

  const adjustedOverall =
    selectedSlots.reduce(
      (total, slot) =>
        total + getBuilderPlayerRatingForPosition(slot.player, slot.position),
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
    selectedPlayers.reduce((total, player) => total + player.defenseRating, 0) /
    selectedPlayers.length;
  const defenseScore = defense * 0.75 + reboundingScore * 0.25;
  const starPower =
    selectedPlayers.reduce((total, player) => total + player.starPower, 0) /
    selectedPlayers.length;

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
        adjustedReboundingScore +
        starPower) /
        6,
    ),
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

    adjustedOverall >= 92 ? "Leadership" : null,
  ]
    .filter((strength): strength is string => Boolean(strength))
    .slice(0, 4);

  const weaknesses = [
    adjustedShootingScore < 70 && eliteShooters < 2 ? "Floor Spacing" : null,

    adjustedPlaymakingScore < 68 && elitePlaymakers === 0 ? "Playmaking" : null,

    adjustedOffenseScore < 68 && eliteScorers < 2 ? "Half-Court Offense" : null,

    adjustedReboundingScore < 68 && eliteRebounders === 0
      ? "Rim Protection"
      : null,

    adjustedDefenseScore < 68 ? "Perimeter Defense" : null,

    adjustedOffenseScore < 72 && eliteScorers === 0
      ? "Isolation Scoring"
      : null,

    selectedPlayers.length < 5 ? "Bench Creation" : null,
  ].filter((weakness): weakness is string => Boolean(weakness));

  const weakestScore = getRankedScoutScores(scores)
    .filter((score) => score.key !== "starPower")
    .at(-1);

  const tradeoff =
    weakestScore?.key === "shooting"
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

  const lineupCeiling = adjustedOverall * 0.75 + starPower * 0.25;

  const tier =
    lineupCeiling >= 94
      ? "Championship Favorite"
      : lineupCeiling >= 90
        ? "Championship Contender"
        : lineupCeiling >= 86
          ? "Playoff-Caliber"
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
  } else if (eliteRebounders >= 3 && adjustedOffenseScore >= 82) {
    archetype = "Rim Pressure Unit";
  } else if (
    elitePlaymakers >= 3 &&
    adjustedDefenseScore >= 82 &&
    adjustedOffenseScore >= 82
  ) {
    archetype = "Positionless Basketball";
  } else if (eliteShooters >= 3 && adjustedShootingScore >= 80) {
    archetype = "Spacing Superteam";
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

  const xFactor = getXFactorForArchetype(archetype, selectedSlots);

  const teamIdentity =
    archetype === "Two-Way Dynasty"
      ? "Championship Control"
      : archetype === "Transition Attack"
        ? "Open-Floor Pressure"
        : archetype === "Point-Center Offense"
          ? "Hub Creation"
          : archetype === "Iso Superteam"
            ? "Mismatch Hunting"
            : archetype === "Defensive Juggernaut"
              ? "Defensive Suppression"
              : archetype === "Floor Spacing Machine"
                ? "Maximum Spacing"
                : archetype === "Positionless Basketball"
                  ? "Role Flexibility"
                  : archetype === "Rim Pressure Unit"
                    ? "Paint Pressure"
                    : archetype === "Spacing Superteam"
                      ? "Shooting Gravity"
                      : archetype === "Playmaking Engine"
                        ? "Five-Man Creation"
                        : archetype === "Offensive Superteam"
                          ? "Transition Pressure"
                          : archetype === "Paint Control Unit"
                            ? "Paint Dominance"
                            : archetype === "Defensive Powerhouse"
                              ? "Defensive Control"
                              : archetype === "Star-Powered Contender"
                                ? "Star-Powered Balance"
                                : "Balanced Two-Way Core";

  const similarTo = `${closestSimilarLineup.name} (${closestSimilarLineup.matchScore}%)`;
  const similarToDescription = closestSimilarLineup.description;

  const summary =
    archetype === "Two-Way Dynasty"
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
                    : archetype === "Spacing Superteam"
                      ? `An elite spacing lineup built around shooting gravity, ball movement, and offensive versatility.`
                      : archetype === "Playmaking Engine"
                        ? `A high-IQ creation lineup built around passing, pace control, and easy shot generation.`
                        : archetype === "Offensive Superteam"
                          ? `A star-powered scoring lineup built around shot creation, isolation pressure, and matchup hunting.`
                          : archetype === "Paint Control Unit"
                            ? `A physical interior lineup built around rebounding, size, and paint pressure.`
                            : archetype === "Defensive Powerhouse"
                              ? `A defensive lineup built around physicality, rebounding, and matchup control.`
                              : archetype === "Star-Powered Contender"
                                ? `A championship-level lineup built around elite talent, versatility, and star power.`
                                : `A balanced lineup built around two-way production, lineup flexibility, and reliable scoring.`;

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
    traditionalCenters === 0 ? "Small Ball" : null,
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

  const badges = [...chemistryBadges, ...scoreBadges].slice(0, 3);

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
