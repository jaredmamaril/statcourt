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
  similarTo: string;
  similarToDescription: string;
  courtBalance: string;
  createdAt: string;
};

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

type LineupScoutScores = {
  offense: number;
  defense: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  balance: number;
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
  xFactor: (typeof players)[number] | null;
  similarTo: string;
  similarToDescription: string;
  courtBalance: string;
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
  if (courtBalance === "Average") return "#F97316";

  return "#EF4444";
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

function getScoutReason(scores: LineupScoutScores, archetype: string) {
  const topScores = Object.entries(scores)
    .filter(([key]) => key !== "balance")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key);

  return `This lineup earned ${archetype} because its strongest categories are ${topScores.join(
    " and ",
  )}.`;
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
        balance: 0,
      },
      xFactor: null,
      similarTo: "--",
      similarToDescription: "--",
      courtBalance: "--",
    };
  }

  const selectedPlayers = selectedSlots.map((slot) => slot.player);

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

  const shootingScore = normalizeStat(shooting, 45);
  const playmakingScore = normalizeStat(playmaking, 11);
  const reboundingScore = normalizeStat(rebounding, 14);
  const scoringScore = normalizeStat(scoring, 35);
  const efficiencyScore = normalizeStat(efficiency, 65);

  const offenseScore =
    scoringScore * 0.45 + efficiencyScore * 0.3 + playmakingScore * 0.25;
  const defenseScore =
    reboundingScore * 0.45 + efficiencyScore * 0.25 + adjustedOverall * 0.3;

  const scores: LineupScoutScores = {
    offense: offenseScore,
    defense: defenseScore,
    shooting: shootingScore,
    playmaking: playmakingScore,
    rebounding: reboundingScore,
    balance: Math.round(
      (offenseScore +
        defenseScore +
        shootingScore +
        playmakingScore +
        reboundingScore) /
        5,
    ),
  };

  const strengths = [
    offenseScore >= 88 ? "Offense" : null,
    shootingScore >= 88 ? "Shooting" : null,
    playmakingScore >= 88 ? "Playmaking" : null,
    reboundingScore >= 88 ? "Rebounding" : null,
    defenseScore >= 88 ? "Defense" : null,
  ].filter((strength): strength is string => Boolean(strength));

  const weaknesses = [
    shootingScore < 75 ? "Perimeter Shooting" : null,
    playmakingScore < 75 ? "Playmaking" : null,
    reboundingScore < 75 ? "Rebounding" : null,
    defenseScore < 75 ? "Defense" : null,
    offenseScore < 75 ? "Half-Court Offense" : null,
  ].filter((weakness): weakness is string => Boolean(weakness));

  const xFactor = selectedSlots.toSorted(
    (a, b) =>
      getBuilderPlayerRatingForPosition(b.player, b.position) -
      getBuilderPlayerRatingForPosition(a.player, a.position),
  )[0].player;

  const tier =
    adjustedOverall >= 94
      ? "Championship Favorite"
      : adjustedOverall >= 90
        ? "Championship Contender"
        : adjustedOverall >= 86
          ? "Playoff-Caliber"
          : "Developmental Lineup";

  const archetype =
    shootingScore >= 88 && playmakingScore >= 85
      ? "Spacing Engine"
      : defenseScore >= 88 && reboundingScore >= 85
        ? "Defensive Powerhouse"
        : offenseScore >= 90
          ? "Offensive Superteam"
          : reboundingScore >= 90
            ? "Paint Control Unit"
            : "Balanced Core";

  const teamIdentity =
    archetype === "Spacing Engine"
      ? "Elite shooting and offensive spacing"
      : archetype === "Defensive Powerhouse"
        ? "Elite defense and rebounding"
        : archetype === "Offensive Superteam"
          ? "Shot creation and scoring pressure"
          : archetype === "Paint Control Unit"
            ? "Interior size and rebounding control"
            : "Balanced two-way production";

  const similarTo =
    archetype === "Spacing Engine"
      ? "2017 Warriors (86%)"
      : archetype === "Defensive Powerhouse"
        ? "1996 Bulls (89%)"
        : archetype === "Offensive Superteam"
          ? "2012 Heat (84%)"
          : archetype === "Paint Control Unit"
            ? "2001 Lakers (82%)"
            : "1986 Celtics (80%)";

  const similarToDescription =
    archetype === "Spacing Engine"
      ? "Elite spacing, shooting gravity, and offensive flow."
      : archetype === "Defensive Powerhouse"
        ? "Elite defense, rebounding, and physical control."
        : archetype === "Offensive Superteam"
          ? "Star-driven scoring pressure and shot creation."
          : archetype === "Paint Control Unit"
            ? "Interior dominance and frontcourt physicality."
            : "Balanced scoring, passing, and lineup structure.";

  const courtBalance =
    weaknesses.length === 0
      ? "Excellent"
      : weaknesses.length <= 1
        ? "Good"
        : weaknesses.length <= 2
          ? "Average"
          : "Poor";

  return {
    summary: `A ${tier.toLowerCase()} built around ${teamIdentity.toLowerCase()}.`,
    tier,
    archetype,
    teamIdentity,
    strengths: strengths.length > 0 ? strengths : ["Balanced production"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["No major weakness"],
    grades: {
      offense: getGrade(offenseScore),
      defense: getGrade(defenseScore),
      shooting: getGrade(shootingScore),
      playmaking: getGrade(playmakingScore),
      rebounding: getGrade(reboundingScore),
    },
    scores,
    xFactor,
    similarTo,
    similarToDescription,
    courtBalance,
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
    scoutedSavedLineup?.xFactorName ?? scoutReport.xFactor?.name ?? "--";

  const similarLineup = scoutedSavedLineup?.similarTo ?? scoutReport.similarTo;

  const similarToDescription =
    scoutedSavedLineup?.similarToDescription ??
    scoutReport.similarToDescription;

  const courtBalance =
    scoutedSavedLineup?.courtBalance ?? scoutReport.courtBalance;

  const courtBalanceColor = getCourtBalanceColor(courtBalance);

  const teamGrades = scoutedSavedLineup?.grades ?? scoutReport.grades;

  const scoutScores = scoutedSavedLineup?.scores ?? scoutReport.scores;

  const scoutReason = getScoutReason(scoutScores, lineupArchetype);

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
      similarTo: similarLineup,
      similarToDescription,
      courtBalance,
      createdAt: new Date().toISOString(),
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
          <div className="relative w-full max-w-xl animate-[modalIn_260ms_ease-out] rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-6 shadow-[0_0_35px_rgba(27,194,236,0.25)]">
            <div className="flex items-start justify-between">
              <div className="-mt-2">
                <h2 className="font-michroma text-xl text-white">
                  Scouting Report
                </h2>

                <p className="mt-1 max-w-62.5 font-michroma text-[10px] leading-relaxed text-white/35">
                  {scoutSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsScoutOpen(false);
                  setScoutedSavedLineup(null);
                }}
                className="font-michroma text-lg text-white/40 transition hover:text-red-400"
              >
                x
              </button>
            </div>

            <div className="absolute right-25 top-6">
              <p className="font-michroma text-[10px] uppercase text-white/40">
                Lineup
              </p>

              <div className="mt-2 grid gap-1">
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
            </div>

            <div className="mt-1 grid max-w-xl gap-3">
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

                <div className="text-center">
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Team Grades
                  </p>

                  <div className="mt-1 grid gap-1 font-michroma text-[9px] text-white/70">
                    <p>
                      Offense:{" "}
                      <span className="text-[#1bc2ec]">
                        {teamGrades.offense}
                      </span>
                    </p>
                    <p>
                      Defense:{" "}
                      <span className="text-[#1bc2ec]">
                        {teamGrades.defense}
                      </span>
                    </p>
                    <p>
                      Shooting:{" "}
                      <span className="text-[#EFBF04]">
                        {teamGrades.shooting}
                      </span>
                    </p>
                    <p>
                      Playmaking:{" "}
                      <span className="text-[#1bc2ec]">
                        {teamGrades.playmaking}
                      </span>
                    </p>
                    <p>
                      Rebounding:{" "}
                      <span className="text-[#1bc2ec]">
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
                    Primary creator and transition engine.
                  </p>
                </div>

                <div>
                  <p className="font-michroma text-[10px] uppercase text-white/40">
                    Similar To
                  </p>
                  <p className="font-michroma text-xs text-[#1bc2ec]">
                    {similarLineup}
                  </p>
                  <p className="mt-1 font-michroma text-[8px] leading-relaxed text-white/35">
                    {similarToDescription}
                  </p>
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
