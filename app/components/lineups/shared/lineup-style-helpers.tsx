import {
  Trophy,
  Shield,
  Target,
  Crown,
  Zap,
  Gem,
  Swords,
  Layers,
  BrickWall,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { getRankedScoutScores } from "../../lineup-scouting";
import type { SavedLineup } from "../shared/lineup-types";

export function getSavedLineupArchetypeColor(archetype: string) {
  const archetypeColors: Record<string, string> = {
    "Transition Attack": "#1BC2EC",
    "Showtime Offense": "#1BC2EC",
    "Playmaking Engine": "#1BC2EC",
    "Point-Center Offense": "#1BC2EC",

    "Defensive Powerhouse": "#22C55E",
    "Defensive Juggernaut": "#22C55E",
    "Lockdown Unit": "#22C55E",

    "Floor Spacing Machine": "#A855F7",
    "Spacing Engine": "#A855F7",

    "Offensive Superteam": "#F97316",
    "Iso Superteam": "#F97316",
    "Star-Powered Contender": "#F97316",

    "Two-Way Dynasty": "#EFBF04",
    "Championship Dynasty": "#EFBF04",
    "Positionless Basketball": "#EFBF04",
    "Balanced Core": "#EFBF04",

    "Paint Control Unit": "#EF4444",
    "Rim Pressure Unit": "#EF4444",
  };

  return archetypeColors[archetype] ?? "#1BC2EC";
}

export const archetypeColorLegend = [
  {
    color: "#EFBF04",
    label: "Two-Way Dynasty",
    description:
      "Complete championship profile with elite offense, defense, and star power.",
  },
  {
    color: "#1bc2ec",
    label: "Transition Attack",
    description:
      "Fast-paced offense built around transition scoring and playmaking.",
  },
  {
    color: "#1bc2ec",
    label: "Point-Center Offense",
    description: "Frontcourt hub creation with passing, scoring, and size.",
  },
  {
    color: "#A855F7",
    label: "Floor Spacing Machine",
    description: "High-level shooting gravity and maximum spacing pressure.",
  },
  {
    color: "#F97316",
    label: "Iso Superteam",
    description: "Elite isolation scoring and matchup hunting.",
  },
  {
    color: "#22C55E",
    label: "Defensive Juggernaut",
    description: "Top-end defense, size, pressure, and glass control.",
  },
  {
    color: "#EF4444",
    label: "Rim Pressure Unit",
    description: "Paint attacks, rim pressure, and interior physicality.",
  },
  {
    color: "#EFBF04",
    label: "Positionless Basketball",
    description: "Interchangeable roles, passing, and multi-position talent.",
  },
  {
    color: "#1bc2ec",
    label: "Playmaking Engine",
    description: "Multiple passers creating efficient looks across the floor.",
  },
  {
    color: "#F97316",
    label: "Offensive Superteam",
    description: "Explosive scoring from multiple creators.",
  },
  {
    color: "#EF4444",
    label: "Paint Control Unit",
    description: "Dominant size, rebounding, and interior control.",
  },
  {
    color: "#22C55E",
    label: "Defensive Powerhouse",
    description: "Elite defense, rebounding, and physical control.",
  },
  {
    color: "#F97316",
    label: "Star-Powered Contender",
    description: "Driven by elite individual talent and star power.",
  },
  {
    color: "#EFBF04",
    label: "Balanced Core",
    description: "Well-rounded lineup with no major specialization.",
  },
];

export function LineupBadgeIcon({ badge }: { badge: string }) {
  const iconClass = "h-3 w-3";

  if (badge === "GOAT Collection") return <Trophy className={iconClass} />;
  if (badge === "Showtime Offense") return <Zap className={iconClass} />;
  if (badge === "Dynasty Core") return <Crown className={iconClass} />;
  if (badge === "Five-Out Attack") return <CircleDot className={iconClass} />;
  if (badge === "Historic Frontcourt")
    return <BrickWall className={iconClass} />;
  if (badge === "Elite Shot Creation") return <Swords className={iconClass} />;
  if (badge === "Big Three") return <Gem className={iconClass} />;
  if (badge === "Positionless Core") return <Layers className={iconClass} />;
  if (badge === "Defensive Wall") return <Shield className={iconClass} />;
  if (badge === "Floor Spacing") return <Target className={iconClass} />;

  return <Sparkles className={iconClass} />;
}

export function getSavedLineupTopScore(lineup: SavedLineup) {
  const rankedScores = getRankedScoutScores(lineup.scores).filter(
    (score) => score.key !== "starPower",
  );

  return rankedScores[0];
}
