"use client";
import {
  players,
  getPlayerInsights,
  normalizeStat,
  statMaxValues,
} from "../components/court-data";
import type { Position } from "../components/court-data";
import PlayerImage from "../components/player-image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Flame,
  Brain,
  Shield,
  Target,
  Crown,
  Save,
} from "lucide-react";

// Types
type LineupTab = "featured" | "builder" | "saved";

type LineupMarkerProps = {
  position: string;
  name: string;
  className: string;
  color: string;
  isHighlighted: boolean;
  onViewCard: (playerName: string) => void;
  tooltipPosition?: "top" | "bottom";
};

type LineupRatings = {
  scoring: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  defense: number;
};

type LineupAchievements = {
  record?: string;
  result?: string;
  playoffs?: string;
  note?: string;
};

type LineupDetail = {
  players: Record<Position, string>;
  overall: number;
  ratings: LineupRatings;
  achievements: LineupAchievements;
  archetype: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
};

type TeamGrades = {
  offense: string;
  defense: string;
  shooting: string;
  playmaking: string;
  rebounding: string;
};

type XFactorResult = {
  player: (typeof players)[number];
  description: string;
};

type LineupScoutScores = {
  offense: number;
  defense: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  starPower: number;
  balance: number;
};

type SimilarLineupProfile = {
  name: string;
  scores: Pick<
    LineupScoutScores,
    "offense" | "defense" | "shooting" | "playmaking" | "rebounding"
  >;
  description: string;
};

type SavedLineup = {
  id: string;
  name: string;
  players: Record<Position, string>;
  overall: number;
  summary: string;
  tier: string;
  archetype: string;
  teamIdentity: string;
  strengths: string[];
  weaknesses: string[];
  grades: TeamGrades;
  scores: LineupScoutScores;
  xFactorName: string;
  xFactorDescription: string;
  similarTo: string;
  similarToDescription: string;
  courtBalance: string;
  createdAt: string;
  badges: string[];
};

type LineupScoutReport = {
  summary: string;
  tier: string;
  archetype: string;
  teamIdentity: string;
  strengths: string[];
  weaknesses: string[];
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
  badges: string[];
};

// Static lineup data
const lineupPositions: Position[] = ["PG", "SG", "SF", "PF", "C"];
const lineupTabs: { label: string; value: LineupTab }[] = [
  { label: "Featured Lineups", value: "featured" },
  { label: "Build Your Own", value: "builder" },
  { label: "Your Saved Lineups", value: "saved" },
];
const lineupCards = [
  { title: "Greatest Teams", color: "#EFBF04", Icon: Trophy },
  { title: "Bucket Getters", color: "#EF4444", Icon: Flame },
  { title: "Floor Generals", color: "#3B82F6", Icon: Brain },
  { title: "Lockdown Squads", color: "#A855F7", Icon: Shield },
  { title: "Splash Squads", color: "#14F1D9", Icon: Target },
  { title: "All-Time Teams", color: "#EFBF04", Icon: Crown },
] as const;

type LineupCategory = (typeof lineupCards)[number]["title"];

const lineupDetails = {
  "1996 Bulls": {
    players: {
      PG: "Ron Harper",
      SG: "Michael Jordan",
      SF: "Scottie Pippen",
      PF: "Dennis Rodman",
      C: "Luc Longley",
    },
    overall: 98.2,
    ratings: {
      scoring: 94,
      shooting: 78,
      playmaking: 86,
      rebounding: 96,
      defense: 99,
    },
    achievements: {
      record: "72-10",
      result: "NBA Champions",
      playoffs: "15-3",
    },
    archetype: "Championship Dynasty",
    description:
      "A defense-first championship lineup built around Jordan's scoring, Pippen's versatility, and Rodman's rebounding pressure.",
    strengths: ["Defense", "Rebounding", "Transition scoring"],
    weaknesses: ["Spacing", "Bench creation"],
  },
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
    archetype: "Shot Creation Core",
    description:
      "A lineup built around elite one-on-one scorers who can create difficult shots without needing much setup.",
    strengths: ["Shot creation", "Clutch scoring", "Mismatch hunting"],
    weaknesses: ["Ball movement", "Off-ball balance"],
  },
  "Pass First Legends": {
    players: {
      PG: "Magic Johnson",
      SG: "Stephen Curry",
      SF: "Larry Bird",
      PF: "LeBron James",
      C: "Nikola Jokic",
    },
    overall: 96.1,
    ratings: {
      scoring: 92,
      shooting: 94,
      playmaking: 99,
      rebounding: 86,
      defense: 82,
    },
    achievements: {
      note: "Built from elite passers and offensive organizers",
    },
    archetype: "Playmaking Engine",
    description:
      "A creation-heavy lineup where every major player can pass, read the floor, and generate efficient looks.",
    strengths: ["Playmaking", "Court vision", "Offensive flow"],
    weaknesses: ["Point-of-attack defense", "Rim protection"],
  },

  "All-Defense Unit": {
    players: {
      PG: "Michael Jordan",
      SG: "Kobe Bryant",
      SF: "LeBron James",
      PF: "Tim Duncan",
      C: "Hakeem Olajuwon",
    },
    overall: 95.8,
    ratings: {
      scoring: 91,
      shooting: 78,
      playmaking: 82,
      rebounding: 91,
      defense: 99,
    },
    achievements: {
      note: "Built from elite defenders across every level of the floor",
    },
    archetype: "Lockdown Unit",
    description:
      "A defense-first lineup with elite wing pressure, physicality, and dominant back-line rim protection.",
    strengths: ["Defense", "Rim protection", "Physicality"],
    weaknesses: ["Spacing consistency", "Traditional playmaking"],
  },

  "Spacing Nightmare": {
    players: {
      PG: "Stephen Curry",
      SG: "Kobe Bryant",
      SF: "Kevin Durant",
      PF: "Larry Bird",
      C: "Nikola Jokic",
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
    archetype: "Spacing Superteam",
    description:
      "A shooting-heavy lineup that stretches the floor with elite range, passing, and shot-making at nearly every spot.",
    strengths: ["Shooting", "Spacing", "Offensive versatility"],
    weaknesses: ["Interior defense", "Rebounding physicality"],
  },

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
} satisfies Record<string, LineupDetail>;

type LineupName = keyof typeof lineupDetails;

const lineupGroups = {
  "Greatest Teams": ["1996 Bulls"],
  "Bucket Getters": ["Isolation Killers"],
  "Floor Generals": ["Pass First Legends"],
  "Lockdown Squads": ["All-Defense Unit"],
  "Splash Squads": ["Spacing Nightmare"],
  "All-Time Teams": ["All-Time Lakers"],
} satisfies Record<LineupCategory, LineupName[]>;

// Court marker positions
const featuredCourtMarkerPositions: Record<Position, string> = {
  PG: "left-1/2 top-5",
  SG: "left-[20%] top-17",
  SF: "left-[75%] bottom-18",
  PF: "left-[27%] top-62",
  C: "left-[65%] top-42",
};

const builderCourtMarkerPositions: Record<Position, string> = {
  PG: "left-1/2 top-6",
  SG: "left-[22%] top-16",
  SF: "left-[78%] bottom-10",
  PF: "left-[25%] bottom-20",
  C: "left-[65%] top-50",
};

// Rating helpers
function getBuilderPlayerRating(player: (typeof players)[number]) {
  const ppgScore = normalizeStat(player.stats.ppg, statMaxValues.ppg);
  const rpgScore = normalizeStat(player.stats.rpg, statMaxValues.rpg);
  const apgScore = normalizeStat(player.stats.apg, statMaxValues.apg);
  const fgScore = normalizeStat(
    player.stats.fgPercent,
    statMaxValues.fgPercent,
  );
  const threeScore = normalizeStat(
    player.stats.threePercent,
    statMaxValues.threePercent,
  );
  const ftScore = normalizeStat(
    player.stats.ftPercent,
    statMaxValues.ftPercent,
  );
  const scoringScore = ppgScore * 0.75 + fgScore * 0.15 + ftScore * 0.1;
  const shootingScore = threeScore * 0.65 + ftScore * 0.25 + fgScore * 0.1;
  const playmakingScore =
    apgScore * 0.75 + scoringScore * 0.15 + threeScore * 0.1;
  const reboundingScore = rpgScore * 0.9 + fgScore * 0.1;
  const efficiencyScore = fgScore * 0.45 + threeScore * 0.3 + ftScore * 0.25;
  const starCategories = [
    ppgScore >= 70,
    rpgScore >= 55,
    apgScore >= 55,
    fgScore >= 70,
    threeScore >= 70,
    ftScore >= 75,
  ].filter(Boolean).length;
  const versatilityBonus = starCategories * 2;
  const overallScore =
    scoringScore * 0.3 +
    efficiencyScore * 0.23 +
    playmakingScore * 0.19 +
    reboundingScore * 0.15 +
    shootingScore * 0.13 +
    versatilityBonus;

  return 70 + overallScore * 0.3;
}

// Position fit helpers
type PositionFit = "natural" | "secondary" | "emergency" | "mismatch";

const defaultSecondaryPositions: Record<Position, Position[]> = {
  PG: ["SG"],
  SG: ["PG", "SF"],
  SF: ["SG", "PF"],
  PF: ["SF", "C"],
  C: ["PF"],
};

const specialPositionOverrides: Partial<
  Record<
    string,
    {
      secondaryPositions?: Position[];
      emergencyPositions?: Position[];
    }
  >
> = {
  "LeBron James": {
    secondaryPositions: ["PF"],
    emergencyPositions: ["PG"],
  },
  "Magic Johnson": {
    secondaryPositions: ["SG", "SF"],
  },
  "Nikola Jokic": {
    secondaryPositions: ["PF"],
    emergencyPositions: ["PG"],
  },
  "Giannis Antetokounmpo": {
    secondaryPositions: ["SF", "C"],
  },
};

function getPlayerSecondaryPositions(
  player: (typeof players)[number],
): Position[] {
  return (
    specialPositionOverrides[player.name]?.secondaryPositions ??
    defaultSecondaryPositions[player.position]
  );
}

function getPlayerEmergencyPositions(
  player: (typeof players)[number],
): Position[] {
  return specialPositionOverrides[player.name]?.emergencyPositions ?? [];
}

function getPositionFit(
  player: (typeof players)[number],
  slot: Position,
): PositionFit {
  if (player.position === slot) return "natural";

  if (getPlayerSecondaryPositions(player).includes(slot)) {
    return "secondary";
  }

  if (getPlayerEmergencyPositions(player).includes(slot)) {
    return "emergency";
  }

  return "mismatch";
}

function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "secondary") return 1.5;
  if (fit === "emergency") return 3;

  return 7;
}

function getBuilderPlayerRatingForPosition(
  player: (typeof players)[number],
  slot: Position,
) {
  return (
    getBuilderPlayerRating(player) -
    getPositionPenalty(getPositionFit(player, slot))
  );
}

// Color helpers
function getSavedLineupArchetypeColor(archetype: string) {
  if (archetype === "Championship Dynasty") return "#EFBF04";
  if (archetype === "Spacing Superteam") return "#1bc2ec";
  if (archetype === "Lockdown Unit") return "#A855F7";
  if (archetype === "Showtime Offense") return "#EF4444";

  return "#1bc2ec";
}

function getCourtBalanceColor(courtBalance: string) {
  if (courtBalance === "Excellent") return "#22C55E";
  if (courtBalance === "Good") return "#EFBF04";
  if (courtBalance === "Uneven") return "#F97316";

  return "#A855F7";
}

// Scouting report helpers
function getGrade(score: number) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";

  return "D";
}

function getScoutReason(archetype: string) {
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

function getRankedScoutScores(scores: LineupScoutScores) {
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

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

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

function getSimilarLineupMatches(scores: LineupScoutScores) {
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

function getXFactorDescription(
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
  const selectedPlayers = selectedSlots.map((slot) => slot.player);

  const player =
    archetype === "Spacing Superteam" || archetype === "Floor Spacing Machine"
      ? selectedPlayers.toSorted(
          (a, b) => b.stats.threePercent - a.stats.threePercent,
        )[0]
      : archetype === "Playmaking Engine" ||
          archetype === "Point-Center Offense" ||
          archetype === "Positionless Basketball"
        ? selectedPlayers.toSorted((a, b) => b.stats.apg - a.stats.apg)[0]
        : archetype === "Paint Control Unit" ||
            archetype === "Rim Pressure Unit"
          ? selectedPlayers.toSorted((a, b) => b.stats.rpg - a.stats.rpg)[0]
          : archetype === "Defensive Powerhouse" ||
              archetype === "Defensive Juggernaut" ||
              archetype === "Two-Way Dynasty"
            ? selectedPlayers.toSorted(
                (a, b) => b.defenseRating - a.defenseRating,
              )[0]
            : archetype === "Offensive Superteam" ||
                archetype === "Iso Superteam" ||
                archetype === "Transition Attack"
              ? selectedPlayers.toSorted((a, b) => b.stats.ppg - a.stats.ppg)[0]
              : selectedSlots.toSorted(
                  (a, b) =>
                    getBuilderPlayerRatingForPosition(b.player, b.position) -
                    getBuilderPlayerRatingForPosition(a.player, a.position),
                )[0].player;

  return {
    player,
    description: getXFactorDescription(archetype, player),
  };
}

function getLineupScoutReport(
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
      badges: [],
    };
  }

  const selectedPlayers = selectedSlots.map((slot) => slot.player);

  const eliteShooters = selectedPlayers.filter(
    (player) => player.stats.threePercent >= 38,
  ).length;

  const eliteScorers = selectedPlayers.filter(
    (player) => player.stats.ppg >= 25,
  ).length;

  const elitePlaymakers = selectedPlayers.filter(
    (player) => player.stats.apg >= 7,
  ).length;

  const eliteRebounders = selectedPlayers.filter(
    (player) => player.stats.rpg >= 10,
  ).length;

  const superstarCount = selectedPlayers.filter(
    (player) => player.starPower >= 95,
  ).length;

  const eliteDefenders = selectedPlayers.filter(
    (player) => player.defenseRating >= 90,
  ).length;

  const eliteBigs = selectedSlots.filter(
    (slot) =>
      (slot.position === "PF" || slot.position === "C") &&
      slot.player.starPower >= 90 &&
      slot.player.stats.rpg >= 9,
  ).length;

  const traditionalCenters = selectedSlots.filter(
    (slot) => slot.position === "C" && slot.player.position === "C",
  ).length;

  const passablePlayers = selectedPlayers.filter(
    (player) => player.stats.apg >= 4.5,
  ).length;

  const hasCurry = selectedPlayers.some(
    (player) => player.name === "Stephen Curry",
  );
  const hasJokic = selectedPlayers.some(
    (player) => player.name === "Nikola Jokic",
  );
  const hasLeBron = selectedPlayers.some(
    (player) => player.name === "LeBron James",
  );
  const hasDurant = selectedPlayers.some(
    (player) => player.name === "Kevin Durant",
  );
  const hasShaq = selectedPlayers.some(
    (player) => player.name === "Shaquille O'Neal",
  );
  const hasWilt = selectedPlayers.some(
    (player) => player.name === "Wilt Chamberlain",
  );
  const hasHakeem = selectedPlayers.some(
    (player) => player.name === "Hakeem Olajuwon",
  );
  const hasMagic = selectedPlayers.some(
    (player) => player.name === "Magic Johnson",
  );

  const hasBird = selectedPlayers.some(
    (player) => player.name === "Larry Bird",
  );

  const hasKobe = selectedPlayers.some(
    (player) => player.name === "Kobe Bryant",
  );

  const hasWade = selectedPlayers.some(
    (player) => player.name === "Dwyane Wade",
  );

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

  if (hasCurry && hasJokic && hasLeBron) {
    adjustedPlaymakingScore += 8;
    adjustedOffenseScore += 6;
  }

  if (hasCurry && hasDurant && hasLeBron) {
    adjustedShootingScore += 6;
    adjustedOffenseScore += 5;
  }

  if (hasShaq && hasWilt && hasHakeem) {
    adjustedShootingScore -= 10;
    adjustedOffenseScore -= 4;
    adjustedReboundingScore += 8;
    adjustedDefenseScore += 6;
  }

  if (eliteRebounders >= 3) {
    adjustedReboundingScore += 6;
  }

  if (eliteScorers >= 3) {
    adjustedOffenseScore += 5;
  }

  if (eliteShooters >= 3) {
    adjustedShootingScore += 6;
  }

  if (elitePlaymakers >= 3) {
    adjustedPlaymakingScore += 6;
    adjustedOffenseScore += 4;
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

  const weakestScore = getRankedScoutScores(scores).at(-1);

  const finalWeaknesses =
    weaknesses.length > 0
      ? weaknesses
      : weakestScore?.key === "shooting"
        ? ["Floor Spacing"]
        : weakestScore?.key === "playmaking"
          ? ["Playmaking"]
          : weakestScore?.key === "offense"
            ? ["Half-Court Offense"]
            : weakestScore?.key === "defense"
              ? ["Perimeter Defense"]
              : weakestScore?.key === "rebounding"
                ? ["Rim Protection"]
                : ["No major weakness"];

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
    hasJokic &&
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

  const similarTo = closestSimilarLineup.name;
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

  const chemistryBadges = [
    superstarCount >= 3 ? "Big Three" : null,
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
    weaknesses: finalWeaknesses,
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
    badges,
  };
}

// Small components
function LineupMarker({
  position,
  name,
  className,
  color,
  isHighlighted,
  onViewCard,
  tooltipPosition = "top",
}: LineupMarkerProps) {
  const player = players.find((player) => player.name === name);
  const imageSrc = player?.image || "/blank-player.svg";
  const archetype = player ? getPlayerInsights(player).archetype : null;
  const tooltipClass =
    tooltipPosition === "bottom" ? "top-full" : "bottom-full";

  return (
    <div
      className={`absolute -translate-x-1/2 text-center transition-all duration-200 hover:z-999 ${
        isHighlighted ? "z-900 scale-125" : "z-10 scale-100"
      } ${className}`}
    >
      <div className="group/headshot relative inline-block">
        <PlayerImage
          src={imageSrc}
          alt={player?.name || name}
          width={72}
          height={72}
          className="mx-auto h-20 w-20 rounded-full object-cover transition-all duration-200"
          style={{
            boxShadow: isHighlighted
              ? `0 0 0 3px ${color}, 0 0 24px ${color}`
              : "none",
          }}
        />

        <div
          className={`pointer-events-none absolute left-1/2 z-100 w-48 -translate-x-1/2 rounded-md border bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover/headshot:pointer-events-auto group-hover/headshot:opacity-100 ${tooltipClass}`}
          style={{
            borderColor: `${color}99`,
          }}
        >
          <p className="font-michroma text-[10px] uppercase text-white">
            {name}
          </p>

          <p className="mt-1 font-michroma text-[8px] text-white/50">
            {position} • {player?.team ?? "N/A"}
          </p>

          <p className="mt-3 font-michroma text-[9px] text-white">
            OVR <span style={{ color }}>{player ? "93.4" : "N/A"}</span>
          </p>

          <p className="mt-2 font-michroma text-[8px]" style={{ color }}>
            {archetype?.label ?? "Unknown Archetype"}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 font-michroma text-[8px] text-white/70">
            <span>{player?.stats.ppg ?? "-"} PPG</span>
            <span>{player?.stats.rpg ?? "-"} RPG</span>
            <span>{player?.stats.apg ?? "-"} APG</span>
          </div>

          <button
            type="button"
            onClick={() => onViewCard(name)}
            className="mt-3 w-full cursor-pointer rounded border px-3 py-2 font-michroma text-[9px] uppercase transition hover:brightness-150"
            style={{
              color,
              borderColor: `${color}99`,
              backgroundColor: `${color}18`,
            }}
          >
            View Card
          </button>
        </div>
      </div>

      <p className="mt-0.5 font-michroma text-[7px] text-white">{name}</p>

      <p className="font-michroma text-[6px]" style={{ color }}>
        {position}
      </p>
    </div>
  );
}

export default function Lineups() {
  const router = useRouter();
  const lineupSectionRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");

  // Featured lineups
  const [selectedLineupCategory, setSelectedLineupCategory] = useState<
    LineupCategory | ""
  >("");
  const [selectedLineupName, setSelectedLineupName] = useState<LineupName | "">(
    "",
  );
  const [hoveredLineupPlayer, setHoveredLineupPlayer] = useState("");

  // Builder
  const [hasStartedBuilder, setHasStartedBuilder] = useState(false);
  const [customLineup, setCustomLineup] = useState<Record<Position, string>>({
    PG: "",
    SG: "",
    SF: "",
    PF: "",
    C: "",
  });
  const [activeBuildPosition, setActiveBuildPosition] =
    useState<Position>("PG");
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");

  // Saved lineups
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);
  const [savedLineupSearch, setSavedLineupSearch] = useState("");

  // Modals
  const [isScoutOpen, setIsScoutOpen] = useState(false);
  const [isNamingLineup, setIsNamingLineup] = useState(false);
  const [lineupNameInput, setLineupNameInput] = useState("");
  const [lineupPendingDelete, setLineupPendingDelete] =
    useState<SavedLineup | null>(null);
  const [isLineupSavedOpen, setIsLineupSavedOpen] = useState(false);
  const [scoutedSavedLineup, setScoutedSavedLineup] =
    useState<SavedLineup | null>(null);

  // Animations
  const [animatedScoutOverall, setAnimatedScoutOverall] = useState(0);

  // Builder derived data
  const selectedCustomPlayerSlots = lineupPositions
    .map((position) => {
      const player = players.find(
        (player) => player.name === customLineup[position],
      );

      return player ? { position, player } : null;
    })
    .filter(
      (
        slot,
      ): slot is { position: Position; player: (typeof players)[number] } =>
        Boolean(slot),
    );

  const selectedCustomPlayers = selectedCustomPlayerSlots.map(
    (slot) => slot.player,
  );

  const customLineupOverall =
    selectedCustomPlayerSlots.length === 0
      ? null
      : selectedCustomPlayerSlots.reduce(
          (total, slot) =>
            total +
            getBuilderPlayerRatingForPosition(slot.player, slot.position),
          0,
        ) / selectedCustomPlayerSlots.length;

  const selectedBuildPlayerNames = new Set(
    selectedCustomPlayers.map((player) => player.name),
  );

  const activePositionPlayerName = customLineup[activeBuildPosition];

  const availableBuildPlayers = players
    .filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(buildPlayerSearch.toLowerCase());

      const isAlreadySelectedSomewhere = selectedBuildPlayerNames.has(
        player.name,
      );

      const isSelectedInThisPosition = player.name === activePositionPlayerName;

      return (
        matchesSearch &&
        (!isAlreadySelectedSomewhere || isSelectedInThisPosition)
      );
    })
    .sort((a, b) => {
      return (
        getBuilderPlayerRatingForPosition(b, activeBuildPosition) -
        getBuilderPlayerRatingForPosition(a, activeBuildPosition)
      );
    });

  const selectedLineupCount = selectedCustomPlayers.length;

  const isLineupComplete = selectedLineupCount === lineupPositions.length;

  // Scout report values
  const scoutReport = getLineupScoutReport(selectedCustomPlayerSlots);

  const lineupArchetype =
    scoutedSavedLineup?.archetype ?? scoutReport.archetype;

  const lineupTier = scoutedSavedLineup?.tier ?? scoutReport.tier;

  const scoutSummary = scoutedSavedLineup?.summary ?? scoutReport.summary;

  const teamIdentity =
    scoutedSavedLineup?.teamIdentity ?? scoutReport.teamIdentity;

  const lineupStrengths =
    scoutedSavedLineup?.strengths ?? scoutReport.strengths;

  const lineupWeaknesses =
    scoutedSavedLineup?.weaknesses ?? scoutReport.weaknesses;

  const xFactorName =
    scoutedSavedLineup?.xFactorName ?? scoutReport.xFactor?.player.name ?? "--";

  const xFactorDescription =
    scoutedSavedLineup?.xFactorDescription ??
    scoutReport.xFactor?.description ??
    "--";

  const similarLineup = scoutedSavedLineup?.similarTo ?? scoutReport.similarTo;

  const similarToDescription =
    scoutedSavedLineup?.similarToDescription ??
    scoutReport.similarToDescription;

  const similarLineupMatches = scoutReport.similarLineupMatches;

  const courtBalance =
    scoutedSavedLineup?.courtBalance ?? scoutReport.courtBalance;

  const courtBalanceColor = getCourtBalanceColor(courtBalance);

  const teamGrades = scoutedSavedLineup?.grades ?? scoutReport.grades;

  const scoutScores = scoutedSavedLineup?.scores ?? scoutReport.scores;

  const scoutReason = getScoutReason(lineupArchetype);

  const lineupBadges = scoutedSavedLineup?.badges ?? scoutReport.badges;

  // Featured lineup display values
  const selectedCategoryColor =
    lineupCards.find((card) => card.title === selectedLineupCategory)?.color ??
    "#1bc2ec";

  const selectedLineup: LineupDetail | null = selectedLineupName
    ? lineupDetails[selectedLineupName]
    : null;

  const selectedLineupAchievements = selectedLineup
    ? [
        selectedLineup.achievements.record
          ? `${selectedLineup.achievements.record} Record`
          : null,
        selectedLineup.achievements.result ?? null,
        selectedLineup.achievements.playoffs
          ? `${selectedLineup.achievements.playoffs} Playoffs`
          : null,
        selectedLineup.achievements.note ?? null,
      ].filter((achievement): achievement is string => Boolean(achievement))
    : [];

  const selectedLineupNames = selectedLineupCategory
    ? lineupGroups[selectedLineupCategory]
    : [];

  // Saved lineup derived data
  const filteredSavedLineups = savedLineups.filter((lineup) => {
    const search = savedLineupSearch.toLowerCase();

    const playerNames = lineupPositions
      .map((position) => lineup.players[position])
      .join(" ")
      .toLowerCase();

    return (
      lineup.name.toLowerCase().includes(search) ||
      (lineup.archetype ?? "").toLowerCase().includes(search) ||
      (lineup.teamIdentity ?? "").toLowerCase().includes(search) ||
      playerNames.includes(search)
    );
  });

  // Page display values
  const shouldShowTopText =
    activeTab === "featured" || activeTab === "saved" || hasStartedBuilder;

  // Load saved lineups from localStorage
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const saved = localStorage.getItem("statcourt-saved-lineups");

      if (!saved) return;

      setSavedLineups(JSON.parse(saved) as SavedLineup[]);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Animate scout report OVR
  const displayedScoutOverall =
    scoutedSavedLineup?.overall ?? customLineupOverall;
  useEffect(() => {
    if (!isScoutOpen || displayedScoutOverall === null) return;

    const targetOverall = displayedScoutOverall;

    let frameId: number;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const nextValue = targetOverall * progress;

      setAnimatedScoutOverall(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isScoutOpen, displayedScoutOverall]);

  // Builder actions
  function pickBuildPlayer(playerName: string) {
    setCustomLineup((prev) => ({
      ...prev,
      [activeBuildPosition]: playerName,
    }));
  }

  function removeBuildPlayer(position: Position) {
    setCustomLineup((prev) => ({
      ...prev,
      [position]: "",
    }));
  }

  // Saved lineup actions
  function saveLineup(lineupName: string) {
    if (!customLineupOverall) return;

    const newLineup: SavedLineup = {
      id: crypto.randomUUID(),
      name: lineupName.trim() || `Lineup ${savedLineups.length + 1}`,
      players: customLineup,
      overall: customLineupOverall,
      summary: scoutSummary,
      tier: lineupTier,
      archetype: lineupArchetype,
      teamIdentity,
      strengths: lineupStrengths,
      weaknesses: lineupWeaknesses,
      grades: teamGrades,
      scores: scoutReport.scores,
      xFactorName,
      xFactorDescription,
      similarTo: similarLineup,
      similarToDescription,
      courtBalance,
      createdAt: new Date().toISOString(),
      badges: scoutReport.badges,
    };

    const nextLineups = [newLineup, ...savedLineups];

    setSavedLineups(nextLineups);
    localStorage.setItem(
      "statcourt-saved-lineups",
      JSON.stringify(nextLineups),
    );
  }

  function deleteSavedLineup(lineupId: string) {
    const nextLineups = savedLineups.filter((lineup) => lineup.id !== lineupId);

    setSavedLineups(nextLineups);
    localStorage.setItem(
      "statcourt-saved-lineups",
      JSON.stringify(nextLineups),
    );
  }

  function loadSavedLineup(lineup: SavedLineup) {
    setCustomLineup(lineup.players);
    setActiveTab("builder");
    setHasStartedBuilder(true);
    setActiveBuildPosition("PG");
    setIsScoutOpen(false);
    setIsNamingLineup(false);
    setScoutedSavedLineup(null);
  }

  function scoutSavedLineup(lineup: SavedLineup) {
    setScoutedSavedLineup(lineup);
    setCustomLineup(lineup.players);
    setIsScoutOpen(true);
  }

  // Navigation
  function viewPlayerCard(playerName: string) {
    router.push(`/players?player=${encodeURIComponent(playerName)}`);
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
        {/* Page tabs and header text */}
        <div className="mt-0 flex w-full items-start justify-start overflow-x-auto border-t border-white/10">
          <div className="flex shrink-0 items-start">
            {lineupTabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value);
                    if (tab.value === "builder") {
                      setHasStartedBuilder(false);
                    }
                  }}
                  className={`min-w-48 cursor-pointer rounded-b-md border border-t-0 px-4 font-michroma text-xs uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/20 py-4 text-[#1bc2ec]"
                      : "border-white/10 bg-black/30 py-2.5 text-white/50 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {shouldShowTopText && (
            <div className="grid flex-1 grid-cols-[auto_1fr] items-start gap-6 pl-10 pt-5">
              <p className="w-full overflow-hidden -mt-1 font-michroma text-xs text-white/40 text-center">
                {activeTab === "featured"
                  ? "Explore curated lineups and discover unique team archetypes, strengths, and playstyles."
                  : activeTab === "builder"
                    ? "Build your lineup, then scout the team to uncover its archetype, strengths, weaknesses, and overall potential."
                    : "View and manage the lineups you have saved."}
              </p>
            </div>
          )}
        </div>

        {/* Featured Lineups tab */}
        {activeTab === "featured" && (
          <section className="min-h-[calc(100vh-140px)]">
            {/* Lineup category cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {lineupCards.map((card) => {
                const Icon = card.Icon;
                const categoryLineups = lineupGroups[card.title];

                const featuredLineup =
                  categoryLineups.reduce<LineupName | null>(
                    (bestLineup, lineupName) => {
                      if (!bestLineup) return lineupName;

                      const currentOverall = lineupDetails[lineupName].overall;
                      const bestOverall = lineupDetails[bestLineup].overall;

                      return currentOverall > bestOverall
                        ? lineupName
                        : bestLineup;
                    },
                    null,
                  );
                const lineupCount = categoryLineups.length;

                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => {
                      setSelectedLineupCategory(card.title);
                      setSelectedLineupName(featuredLineup ?? "");

                      setTimeout(() => {
                        lineupSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 150);
                    }}
                    className="grid min-h-36 grid-cols-[1fr_auto] items-center gap-6 rounded-md border bg-black/30 p-4 text-left"
                    style={{
                      borderColor: `${card.color}80`,
                    }}
                  >
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={20}
                          strokeWidth={2}
                          style={{ color: card.color }}
                        />

                        <h2 className="font-michroma text-sm">{card.title}</h2>
                      </div>

                      <p className="mt-3 font-michroma text-[10px] uppercase text-white/35">
                        Featured
                      </p>

                      <p
                        className="mt-1 font-michroma text-xs"
                        style={{ color: card.color }}
                      >
                        {featuredLineup ?? "Coming Soon"}
                      </p>

                      <p className="mt-3 font-michroma text-[10px] uppercase text-white/35">
                        Lineups
                      </p>

                      <p className="mt-1 font-michroma text-[11px] text-white/70">
                        {lineupCount} {lineupCount === 1 ? "Lineup" : "Lineups"}
                      </p>
                    </div>

                    <span
                      className="cursor-pointer self-end rounded-md border px-4 py-3 font-michroma text-xs uppercase transition hover:brightness-150"
                      style={{
                        color: card.color,
                        borderColor: `${card.color}80`,
                        backgroundColor: `${card.color}18`,
                      }}
                    >
                      Explore
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected lineup details */}
            {selectedLineupCategory && (
              <div
                ref={lineupSectionRef}
                className="scroll-mt-24 mt-8 rounded-md border border-white/10 bg-black/25 p-4"
              >
                <h2
                  className="border-b pb-3 text-center font-michroma text-sm uppercase tracking-wide text-white"
                  style={{ borderColor: `${selectedCategoryColor}55` }}
                >
                  {selectedLineupCategory}
                </h2>

                <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
                  {/* Lineup selector list */}
                  <div className="flex flex-col gap-2">
                    {selectedLineupNames.map((lineupName) => (
                      <button
                        key={lineupName}
                        type="button"
                        onClick={() => setSelectedLineupName(lineupName)}
                        className={`rounded-md border px-4 py-3 text-left font-michroma text-xs transition ${
                          selectedLineupName === lineupName
                            ? "bg-black/30"
                            : "border-white/10 bg-black/30 text-white/60 hover:text-white"
                        }`}
                        style={
                          selectedLineupName === lineupName
                            ? {
                                color: selectedCategoryColor,
                                borderColor: `${selectedCategoryColor}99`,
                                backgroundColor: `${selectedCategoryColor}18`,
                              }
                            : undefined
                        }
                      >
                        {lineupName}
                      </button>
                    ))}
                  </div>

                  {/* Selected lineup breakdown */}
                  <div
                    className="relative min-h-96 rounded-md border bg-black/30 p-5"
                    style={{ borderColor: `${selectedCategoryColor}55` }}
                  >
                    {selectedLineup ? (
                      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        {/* Lineup stats and scouting text */}
                        <div>
                          <h3 className="font-michroma text-sm uppercase tracking-wide text-white">
                            {selectedLineupName}
                          </h3>

                          <div className="mt-5 grid gap-2">
                            {Object.entries(selectedLineup.players).map(
                              ([position, playerName]) => (
                                <div
                                  key={position}
                                  onMouseEnter={() =>
                                    setHoveredLineupPlayer(playerName)
                                  }
                                  onMouseLeave={() =>
                                    setHoveredLineupPlayer("")
                                  }
                                  className="grid grid-cols-[40px_1fr] w-fit font-michroma text-xs transition cursor-pointer"
                                >
                                  <span
                                    className="transition-all duration-200"
                                    style={{
                                      color:
                                        hoveredLineupPlayer === playerName
                                          ? selectedCategoryColor
                                          : selectedCategoryColor,
                                      textShadow:
                                        hoveredLineupPlayer === playerName
                                          ? `0 0 10px ${selectedCategoryColor}`
                                          : "none",
                                    }}
                                  >
                                    {position}
                                  </span>

                                  <span
                                    className="text-white/80 transition-all duration-200"
                                    style={{
                                      color:
                                        hoveredLineupPlayer === playerName
                                          ? selectedCategoryColor
                                          : "rgba(255,255,255,0.8)",
                                      textShadow:
                                        hoveredLineupPlayer === playerName
                                          ? `0 0 10px ${selectedCategoryColor}`
                                          : "none",
                                    }}
                                  >
                                    {playerName}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>

                          <p className="mt-5 font-michroma text-xs text-white">
                            OVR:{" "}
                            <span style={{ color: selectedCategoryColor }}>
                              {selectedLineup.overall}
                            </span>
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedLineupAchievements.map((achievement) => (
                              <span
                                key={achievement}
                                className="rounded border px-2 py-1 font-michroma text-[9px]"
                                style={{
                                  color: selectedCategoryColor,
                                  borderColor: `${selectedCategoryColor}66`,
                                  backgroundColor: `${selectedCategoryColor}14`,
                                }}
                              >
                                {achievement}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5">
                            <p className="font-michroma text-[10px] uppercase text-white/40">
                              Archetype
                            </p>
                            <p
                              className="mt-1 font-michroma text-sm"
                              style={{
                                color: selectedCategoryColor,
                                textShadow: `0 0 10px ${selectedCategoryColor}`,
                              }}
                            >
                              {selectedLineup.archetype}
                            </p>
                            <div className="mt-5">
                              <p className="font-michroma text-[10px] uppercase text-white/40">
                                Description
                              </p>
                              <p className="mt-1 font-michroma text-[10px] leading-relaxed text-white/70">
                                {selectedLineup.description}
                              </p>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="font-michroma text-[10px] uppercase text-emerald-400/40">
                                  Strengths
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {selectedLineup.strengths.map((strength) => (
                                    <span
                                      key={strength}
                                      className="rounded border border-emerald-600/40 bg-emerald-500/10 px-2 py-1 font-michroma text-[9px] text-emerald-400"
                                    >
                                      {strength}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="font-michroma text-[10px] uppercase text-red-700/40">
                                  Weaknesses
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {selectedLineup.weaknesses.map((weakness) => (
                                    <span
                                      key={weakness}
                                      className="rounded border border-red-700/40 bg-red-700/10 px-2 py-1 font-michroma text-[9px] text-red-700"
                                    >
                                      {weakness}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Half-court lineup visualization */}
                        <div className="relative min-h-96 overflow-visible rounded-md bg-transparent">
                          {/* Half court boundary */}
                          <div className="absolute inset-x-8 inset-y-6 " />

                          <div
                            className="absolute left-1/2 bottom-17 h-[60%] w-[70%] -translate-x-1/2 rounded-t-full border-t border-l border-r"
                            style={{
                              borderColor: `${selectedCategoryColor}40`,
                            }}
                          />

                          <div
                            className="absolute left-1/2 bottom-17 h-36 w-24 -translate-x-1/2 border"
                            style={{
                              borderColor: `${selectedCategoryColor}40`,
                            }}
                          />

                          <div
                            className="absolute left-1/2 bottom-53 h-12 w-24 -translate-x-1/2 rounded-t-full border-t border-l border-r"
                            style={{
                              borderColor: `${selectedCategoryColor}40`,
                            }}
                          />

                          <div
                            className="absolute left-1/2 bottom-24 h-3 w-3 -translate-x-1/2 rounded-full border"
                            style={{
                              borderColor: `${selectedCategoryColor}80`,
                            }}
                          />

                          <div
                            className="absolute left-1/2 bottom-24 h-px w-14 -translate-x-1/2"
                            style={{
                              backgroundColor: `${selectedCategoryColor}80`,
                            }}
                          />

                          {Object.entries(selectedLineup.players).map(
                            ([position, playerName]) => (
                              <LineupMarker
                                key={position}
                                position={position}
                                name={playerName}
                                color={selectedCategoryColor}
                                isHighlighted={
                                  hoveredLineupPlayer === playerName
                                }
                                onViewCard={viewPlayerCard}
                                tooltipPosition={
                                  position === "PG" || position === "SG"
                                    ? "bottom"
                                    : "top"
                                }
                                className={
                                  featuredCourtMarkerPositions[
                                    position as Position
                                  ]
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="font-michroma text-xs text-white/40">
                        No current details.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Build Your Own tab */}
        {activeTab === "builder" && (
          <section className="min-h-[calc(100vh-140px)]">
            {/* Draft intro screen */}
            {!hasStartedBuilder ? (
              <section className="flex min-h-[calc(100vh-120px)] items-center justify-center">
                <div className="max-w-lg rounded-md border border-[#1bc2ec]/50 bg-black/60 p-6 text-center">
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Build Your Own
                  </p>

                  <h2 className="mt-2 font-michroma text-xl text-[#1bc2ec]">
                    Draft Your Lineup
                  </h2>

                  <p className="mt-4 font-michroma text-xs leading-relaxed text-white/55">
                    Choose one player for each position. Your current OVR
                    updates as you draft, and selected positions turn green so
                    you can track your lineup.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomLineup({
                        PG: "",
                        SG: "",
                        SF: "",
                        PF: "",
                        C: "",
                      });

                      setActiveBuildPosition("PG");
                      setBuildPlayerSearch("");
                      setHasStartedBuilder(true);
                    }}
                    className="mt-6 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-6 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
                  >
                    Start Draft
                  </button>
                </div>
              </section>
            ) : (
              <div className="mt-3">
                {/* Draft builder workspace */}
                <div className="grid items-start gap-5 lg:grid-cols-[400px_300px_1fr]">
                  {/* Player picker */}
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex justify-center gap-2">
                      {lineupPositions.map((position) => {
                        const isActive = activeBuildPosition === position;
                        const hasPlayer = customLineup[position] !== "";

                        return (
                          <button
                            key={position}
                            type="button"
                            onClick={() => {
                              setActiveBuildPosition(position);
                              setBuildPlayerSearch("");
                            }}
                            className={`rounded-md border px-3 py-2 font-michroma text-xs transition ${
                              isActive
                                ? "border-[#1bc2ec] bg-[#1bc2ec]/15 text-[#1bc2ec]"
                                : hasPlayer
                                  ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                                  : "border-white/15 bg-black/30 text-white/50 hover:text-white"
                            }`}
                          >
                            <span>{position}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={buildPlayerSearch}
                        onChange={(event) =>
                          setBuildPlayerSearch(event.target.value)
                        }
                        placeholder="Search Player..."
                        className="w-full max-w-md rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none transition placeholder:text-white/30 focus:border-white"
                      />
                    </div>

                    <div
                      className="overflow-y-auto pr-2"
                      style={{ maxHeight: "392px" }}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {availableBuildPlayers.map((player) => {
                          const isSelected =
                            customLineup[activeBuildPosition] === player.name;
                          const positionFit = getPositionFit(
                            player,
                            activeBuildPosition,
                          );
                          const positionRating =
                            getBuilderPlayerRatingForPosition(
                              player,
                              activeBuildPosition,
                            );

                          return (
                            <button
                              key={player.id}
                              type="button"
                              onClick={() => pickBuildPlayer(player.name)}
                              className={`h-52 rounded-md border bg-black/30 p-3 text-center transition hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/10 ${
                                isSelected
                                  ? "border-[#1bc2ec] bg-[#1bc2ec]/15 shadow-[0_0_18px_rgba(27,194,236,0.35)]"
                                  : "border-white/15"
                              }`}
                            >
                              <PlayerImage
                                src={player.image}
                                alt={player.name}
                                width={64}
                                height={64}
                                className="mx-auto h-20 w-20 rounded-full object-cover"
                              />

                              <p className="mt-1 flex h-10 items-center justify-center text-center font-michroma text-[11px] leading-4 text-white">
                                {player.name}
                              </p>

                              <p className="font-michroma text-[9px] text-white/40">
                                {player.team} • {player.position}
                              </p>

                              <p className="mt-1 font-michroma text-[10px] text-[#1bc2ec]">
                                {positionRating.toFixed(1)} OVR
                              </p>

                              <p
                                className={`mt-1 font-michroma text-[8px] uppercase ${
                                  positionFit === "natural"
                                    ? "text-emerald-400"
                                    : positionFit === "secondary"
                                      ? "text-[#1bc2ec]"
                                      : positionFit === "emergency"
                                        ? "text-[#EFBF04]"
                                        : "text-red-400"
                                }`}
                              >
                                {positionFit === "natural"
                                  ? "Natural Fit"
                                  : positionFit === "secondary"
                                    ? "Secondary Fit"
                                    : positionFit === "emergency"
                                      ? "Emergency Fit"
                                      : "Mismatch -7"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Draft board */}
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-4"
                    style={{ height: "480px" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-michroma text-[10px] uppercase text-white/40">
                          Your Lineup
                        </p>

                        <h2 className="mt-1 font-michroma text-lg text-white">
                          Draft Board
                        </h2>
                      </div>

                      <div className="text-center">
                        <p className="font-michroma text-[10px] uppercase text-white/40">
                          OVR
                        </p>

                        <p
                          key={customLineupOverall?.toFixed(1) ?? "--"}
                          className="animate-[ovrRise_250ms_ease-out] font-michroma text-2xl text-[#1bc2ec]"
                        >
                          {customLineupOverall
                            ? customLineupOverall?.toFixed(1)
                            : "--"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {lineupPositions.map((position) => {
                        const playerName = customLineup[position];
                        const player = players.find(
                          (player) => player.name === playerName,
                        );

                        return (
                          <div
                            key={position}
                            onMouseEnter={() => {
                              if (player) {
                                setHoveredBuildPlayer(player.name);
                              }
                            }}
                            onMouseLeave={() => setHoveredBuildPlayer("")}
                            className={`h-fit grid grid-cols-[44px_1fr_auto] items-center gap-2 rounded-md border px-3 py-2 transition ${
                              player
                                ? "border-emerald-400/50 bg-emerald-400/10 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
                                : "border-white/10 bg-black/20"
                            }`}
                          >
                            <span
                              className={`font-michroma text-sm ${
                                player ? "text-emerald-400" : "text-white/40"
                              }`}
                            >
                              {position}
                            </span>

                            <div>
                              <p className="max-w-44 truncate font-michroma text-sm text-white">
                                {player ? player.name : "Select Player"}
                              </p>

                              <p className="mt-1 font-michroma text-[10px] text-white/35">
                                {player
                                  ? `${player.team} • #${player.jerseyNumber}`
                                  : "Empty"}
                              </p>
                            </div>

                            {player && (
                              <button
                                type="button"
                                onClick={() => removeBuildPlayer(position)}
                                className="font-michroma text-xs text-white/40 transition hover:text-red-400"
                              >
                                x
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        disabled={!isLineupComplete}
                        onClick={() => {
                          setScoutedSavedLineup(null);
                          setIsScoutOpen(true);
                        }}
                        className={`mx-auto rounded-md border px-8 py-5 font-michroma text-[16px] uppercase transition ${
                          isLineupComplete
                            ? "cursor-pointer font-bold border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.35)] hover:bg-[#1bc2ec]/20"
                            : "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                        }`}
                      >
                        {isLineupComplete
                          ? "Scout Lineup"
                          : `${selectedLineupCount}/${lineupPositions.length} Selected`}
                      </button>
                    </div>
                  </div>

                  {/* Builder court preview */}
                  <div className="flex flex-col gap-4">
                    <div className="relative h-120 overflow-visible bg-transparent">
                      <div className="absolute left-1/2 bottom-10 h-[63%] w-[88%] -translate-x-1/2 rounded-t-full border-t border-l border-r border-[#1bc2ec]/25" />

                      <div className="absolute left-1/2 bottom-10 h-40 w-28 -translate-x-1/2 border border-[#1bc2ec]/25" />

                      <div className="absolute left-1/2 bottom-50 h-14 w-28 -translate-x-1/2 rounded-t-full border-t border-l border-r border-[#1bc2ec]/25" />

                      <div className="absolute left-1/2 bottom-20 h-3 w-3 -translate-x-1/2 rounded-full border border-[#1bc2ec]/60" />

                      <div className="absolute left-1/2 bottom-24 h-px w-16 -translate-x-1/2 bg-[#1bc2ec]/60" />

                      {lineupPositions.map((position) => {
                        const playerName = customLineup[position];

                        return (
                          <LineupMarker
                            key={position}
                            position={position}
                            name={playerName || "Select Player"}
                            color="#1bc2ec"
                            isHighlighted={
                              Boolean(playerName) &&
                              hoveredBuildPlayer === playerName
                            }
                            onViewCard={viewPlayerCard}
                            tooltipPosition={
                              position === "PG" || position === "SG"
                                ? "bottom"
                                : "top"
                            }
                            className={builderCourtMarkerPositions[position]}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Saved Lineups tab */}
        {activeTab === "saved" && (
          <section className="min-h-[calc(100vh-140px)]">
            {/* Empty saved lineups state */}
            {savedLineups.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <Save
                  size={56}
                  strokeWidth={1.5}
                  className="mb-1 text-[#1bc2ec]"
                />
                <p className="font-michroma text-lg text-white">
                  No saved lineups yet.
                </p>

                <p className="mt-3 max-w-md font-michroma text-xs leading-relaxed text-white/40">
                  Build your first team and save it after scouting.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("builder");
                    setHasStartedBuilder(false);
                  }}
                  className="mt-6 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-6 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
                >
                  Build a Lineup
                </button>
              </div>
            ) : (
              <div className="mt-6">
                {/* Saved lineup filters */}
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="text"
                    value={savedLineupSearch}
                    onChange={(event) =>
                      setSavedLineupSearch(event.target.value)
                    }
                    placeholder="Search saved lineups..."
                    className="w-full max-w-md rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none placeholder:text-white/30 focus:border-white"
                  />

                  <button
                    type="button"
                    className="rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white/60"
                  >
                    Sort: Highest OVR ▾
                  </button>
                </div>
                <div className="mt-2">
                  <p className="mb-4 text-center font-michroma text-xs text-white/40">
                    {savedLineups.length} Saved{" "}
                    {savedLineups.length === 1 ? "Lineup" : "Lineups"}
                  </p>
                </div>

                {filteredSavedLineups.length === 0 ? (
                  <p className="mt-10 text-center font-michroma text-xs text-white/40">
                    No saved lineups match your search.
                  </p>
                ) : (
                  <div className="mt-2 grid gap-4 md:grid-cols-3">
                    {/* Saved lineup cards */}
                    {filteredSavedLineups.map((lineup) => (
                      <div
                        key={lineup.id}
                        className="group rounded-md border border-white/10 bg-black/25 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#1bc2ec]/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-michroma text-[19px] text-white">
                              {lineup.name}
                            </p>

                            <p className="mt-1 font-michroma text-[9px] text-white/30">
                              Saved{" "}
                              {new Date(lineup.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>

                            <p
                              className="mt-2 font-michroma text-[14px]"
                              style={{
                                color: getSavedLineupArchetypeColor(
                                  lineup.archetype,
                                ),
                              }}
                            >
                              {lineup.archetype}
                            </p>

                            <p className="mt-1 font-michroma text-[12px] text-white/80">
                              {lineup.tier ?? "Saved Lineup"}
                            </p>
                          </div>

                          <div className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 text-center transition-all duration-200 group-hover:border-[#1bc2ec] group-hover:shadow-[0_0_18px_rgba(27,194,236,0.3)]">
                            <p className="font-michroma text-xl text-[#1bc2ec]">
                              {lineup.overall.toFixed(1)}
                            </p>

                            <p className="font-michroma text-[8px] uppercase text-white/40">
                              OVR
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 truncate font-michroma text-[10px] text-white/50">
                          {lineupPositions
                            .map((position) => {
                              const playerName = lineup.players[position];
                              return playerName
                                ? playerName.split(" ").at(-1)
                                : null;
                            })
                            .filter(Boolean)
                            .join(" • ")}
                        </p>

                        <div className="mt-2">
                          <p className="font-michroma text-[9px] uppercase text-white/35">
                            Team Identity
                          </p>

                          <p className="mt-1 font-michroma text-[12px] text-white">
                            {lineup.teamIdentity}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {(lineup.strengths ?? []).map((strength, index) => (
                              <p
                                key={strength}
                                className="animate-[traitReveal_300ms_ease-out_both] font-michroma text-[10px] text-white"
                                style={{ animationDelay: `${index * 120}ms` }}
                              >
                                <span className="text-emerald-400">✓</span>{" "}
                                {strength}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap justify-center">
                          <button
                            type="button"
                            onClick={() => loadSavedLineup(lineup)}
                            className="rounded-md border border-[#1bc2ec]/80 bg-[#1bc2ec]/15 px-3 py-2 font-michroma text-[9px] uppercase text-[#1bc2ec] shadow-[0_0_14px_rgba(27,194,236,0.25)] transition hover:bg-[#1bc2ec]/25"
                          >
                            Load Lineup
                          </button>

                          <button
                            type="button"
                            onClick={() => scoutSavedLineup(lineup)}
                            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 font-michroma text-[9px] uppercase text-white/55 transition hover:border-[#1bc2ec]/40 hover:text-[#1bc2ec]"
                          >
                            Scout Report
                          </button>

                          <button
                            type="button"
                            onClick={() => setLineupPendingDelete(lineup)}
                            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 font-michroma text-[9px] uppercase text-red-400 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </section>

      {/* Scout report modal */}
      {isScoutOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-xl animate-[modalIn_260ms_ease-out] rounded-md border border-[#1bc2ec]/60 bg-[#07111f] shadow-[0_0_35px_rgba(27,194,236,0.25)]">
            <div className="relative max-h-[78vh] overflow-y-auto p-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
              <div className="pr-58">
                <div className="-mt-2">
                  <h2 className="font-michroma text-lg text-white">
                    Scouting Report
                  </h2>

                  <p className="mt-1 max-w-60 font-michroma text-[10px] leading-relaxed text-white/35">
                    {scoutSummary}
                  </p>
                </div>
              </div>

              <div className="absolute right-5 top-5 w-56">
                <p className="font-michroma text-[10px] uppercase text-white/40">
                  Lineup
                </p>

                <div className="mt-0.5 grid gap-1">
                  {lineupPositions.map((position) => {
                    const playerName = customLineup[position];
                    const player = players.find(
                      (player) => player.name === playerName,
                    );

                    return (
                      <div
                        key={position}
                        className="grid grid-cols-[34px_1fr] items-center gap-3"
                      >
                        <span className="font-michroma text-[10px] text-[#1bc2ec]">
                          {position}
                        </span>

                        <div>
                          <p className="truncate font-michroma text-[10px] text-white">
                            {player?.name ?? "Empty"}
                          </p>

                          <p className="mt-1 font-michroma text-[8px] text-white/35">
                            {player
                              ? `${player.team} • #${player.jerseyNumber}`
                              : "--"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-1">
                  <p className="font-michroma text-[10px] uppercase text-white/40 text-center">
                    Score Profile
                  </p>

                  <div className="mt-1 grid gap-1">
                    {getRankedScoutScores(scoutScores).map((score) => (
                      <div
                        key={score.key}
                        className="grid grid-cols-[68px_120px_24px] items-center gap-1"
                      >
                        <p className="font-michroma text-[8px] text-white/40">
                          {score.label}
                        </p>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#1bc2ec]"
                            style={{ width: `${Math.min(score.value, 100)}%` }}
                          />
                        </div>

                        <p className="text-right font-michroma text-[8px] text-white/45">
                          {Math.round(score.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsScoutOpen(false);
                  setScoutedSavedLineup(null);
                }}
                className="absolute right-5 top-4 font-michroma text-lg text-white/40 transition hover:text-red-400"
              >
                x
              </button>

              <div className="mt-1 grid max-w-xl gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-michroma text-3xl text-[#1bc2ec] -tracking-widest">
                      {animatedScoutOverall.toFixed(1)}
                    </p>

                    <p className="font-michroma text-[10px] uppercase text-white/40">
                      Overall
                    </p>
                  </div>

                  <p className="font-michroma text-xs text-[#1bc2ec]">
                    {lineupTier}
                  </p>

                  <div className="max-w-80 mt-2 flex flex-wrap gap-1">
                    {lineupBadges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-md border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-1 py-1 font-michroma text-[8px] text-[#1bc2ec]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Archetype
                  </p>
                  <p className="font-michroma text-sm text-white">
                    {lineupArchetype}
                  </p>
                </div>

                <div>
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Why This Archetype
                  </p>

                  <p className="mt-1 max-w-75 font-michroma text-[9px] leading-relaxed text-white/45">
                    {scoutReason}
                  </p>
                </div>

                <div>
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Team Identity
                  </p>
                  <p className="font-michroma text-sm text-white">
                    {teamIdentity}
                  </p>
                </div>

                <div className="grid grid-cols-[120px_180px_160px] items-start gap-3">
                  <div>
                    <p className="font-michroma text-[10px] uppercase text-emerald-400/60">
                      Strengths
                    </p>

                    <div className="mt-2 grid gap-2">
                      {lineupStrengths.map((strength) => (
                        <p
                          key={strength}
                          className="font-michroma text-[10px] text-white"
                        >
                          <span className="text-emerald-400">✓</span> {strength}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-michroma text-[10px] uppercase text-red-400/60">
                      Weaknesses
                    </p>

                    <div className="mt-2 grid gap-2">
                      {lineupWeaknesses.map((weakness) => (
                        <p
                          key={weakness}
                          className="font-michroma text-[10px] text-white"
                        >
                          <span className="text-red-400">!</span> {weakness}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-michroma text-[10px] uppercase text-white/30">
                      Team Grades
                    </p>

                    <div className="mt-2 grid gap-1">
                      <p className="font-michroma text-[9px] text-white/35">
                        Offense:{" "}
                        <span className="text-white/55">
                          {teamGrades.offense}
                        </span>
                      </p>

                      <p className="font-michroma text-[9px] text-white/35">
                        Defense:{" "}
                        <span className="text-white/55">
                          {teamGrades.defense}
                        </span>
                      </p>

                      <p className="font-michroma text-[9px] text-white/35">
                        Shooting:{" "}
                        <span className="text-white/55">
                          {teamGrades.shooting}
                        </span>
                      </p>

                      <p className="font-michroma text-[9px] text-white/35">
                        Playmaking:{" "}
                        <span className="text-white/55">
                          {teamGrades.playmaking}
                        </span>
                      </p>

                      <p className="font-michroma text-[9px] text-white/35">
                        Rebounding:{" "}
                        <span className="text-white/55">
                          {teamGrades.rebounding}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  <div>
                    <p className="font-michroma text-[10px] uppercase text-white/40">
                      X-Factor
                    </p>
                    <p className="font-michroma text-xs text-white">
                      {xFactorName}
                    </p>
                    <p className="mt-1 font-michroma text-[8px] leading-relaxed text-white/35">
                      {xFactorDescription}
                    </p>
                  </div>

                  <div>
                    <p className="font-michroma text-[10px] uppercase text-white/40">
                      Similar To
                    </p>

                    <div className="mt-1 grid gap-1">
                      {similarLineupMatches.map((match) => (
                        <div key={match.name}>
                          <p className="font-michroma text-[10px] text-[#1bc2ec]">
                            {match.name} ({match.matchScore}%)
                          </p>
                          <p className="font-michroma text-[8px] leading-relaxed text-white/35">
                            {match.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-michroma text-[10px] uppercase text-white/40">
                      Court Balance
                    </p>
                    <p
                      className="font-michroma text-lg"
                      style={{ color: courtBalanceColor }}
                    >
                      {courtBalance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLineupNameInput("");
                setIsNamingLineup(true);
              }}
              className="absolute -bottom-10.5 right-0 rounded-md border border-[#1bc2ec]/70 bg-[#07111f] px-5 py-3 font-michroma text-xs uppercase text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.25)] transition hover:bg-[#1bc2ec]/10"
            >
              Save Lineup
            </button>
          </div>
        </div>
      )}

      {/* Name lineup modal */}
      {isNamingLineup && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-6 shadow-[0_0_35px_rgba(27,194,236,0.25)]">
            <p className="font-michroma text-[10px] uppercase text-white/40">
              Save Lineup
            </p>

            <h2 className="mt-1 font-michroma text-lg text-white">
              Name Your Lineup
            </h2>

            <input
              value={lineupNameInput}
              onChange={(event) => setLineupNameInput(event.target.value)}
              className="mt-5 w-full rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none placeholder:text-white/30 focus:border-[#1bc2ec]"
              placeholder="Lineup name..."
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNamingLineup(false)}
                className="rounded-md border border-white/15 bg-black/20 px-4 py-3 font-michroma text-xs uppercase text-white/50 transition hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  saveLineup(lineupNameInput);
                  setIsNamingLineup(false);
                  setIsScoutOpen(false);
                  setIsLineupSavedOpen(true);
                }}
                className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {lineupPendingDelete && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-md border border-red-500/50 bg-[#07111f] p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <p className="font-michroma text-[10px] uppercase text-red-400/70">
              Delete Lineup
            </p>

            <h2 className="mt-2 font-michroma text-lg text-white">
              Delete {lineupPendingDelete.name}?
            </h2>

            <p className="mt-3 font-michroma text-xs leading-relaxed text-white/45">
              This saved lineup will be removed permanently.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLineupPendingDelete(null)}
                className="rounded-md border border-white/15 bg-white/5 px-4 py-3 font-michroma text-xs uppercase text-white/50 transition hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteSavedLineup(lineupPendingDelete.id);
                  setLineupPendingDelete(null);
                }}
                className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 font-michroma text-xs uppercase text-red-400 transition hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lineup saved success modal */}
      {isLineupSavedOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-md border border-emerald-400/60 bg-[#07111f] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.22)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-400/10 font-michroma text-2xl text-emerald-400">
              ✓
            </div>

            <h2 className="mt-4 font-michroma text-xl text-white">
              Lineup Saved
            </h2>

            <p className="mt-3 font-michroma text-xs text-white/50">
              What would you like to do next?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsLineupSavedOpen(false);
                  setActiveTab("saved");
                }}
                className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
              >
                View Saved
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLineupSavedOpen(false);
                  setActiveTab("builder");
                  setHasStartedBuilder(true);
                  setActiveBuildPosition("PG");
                  setCustomLineup({
                    PG: "",
                    SG: "",
                    SF: "",
                    PF: "",
                    C: "",
                  });
                }}
                className="rounded-md border border-white/20 px-4 py-3 font-michroma text-xs uppercase text-white/60 transition hover:border-white/50 hover:text-white"
              >
                Build Another
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
