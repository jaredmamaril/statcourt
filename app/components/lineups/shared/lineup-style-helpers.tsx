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
  if (archetype === "Transition Attack") return "#1bc2ec";
  if (archetype === "Showtime Offense") return "#1bc2ec";

  if (archetype === "Defensive Powerhouse") return "#22C55E";
  if (archetype === "Defensive Juggernaut") return "#22C55E";
  if (archetype === "Lockdown Unit") return "#22C55E";

  if (archetype === "Spacing Superteam") return "#A855F7";
  if (archetype === "Floor Spacing Machine") return "#A855F7";
  if (archetype === "Spacing Engine") return "#A855F7";

  if (archetype === "Offensive Superteam") return "#F97316";
  if (archetype === "Iso Superteam") return "#F97316";

  if (archetype === "Two-Way Dynasty") return "#EFBF04";
  if (archetype === "Championship Dynasty") return "#EFBF04";

  if (archetype === "Balanced Core") return "#CBD5E1";
  if (archetype === "Star-Powered Contender") return "#38BDF8";

  if (archetype === "Paint Control Unit") return "#EF4444";
  if (archetype === "Rim Pressure Unit") return "#EF4444";
  if (archetype === "Point-Center Offense") return "#EF4444";

  return "#1bc2ec";
}

export const archetypeColorLegend = [
  {
    color: "#1bc2ec",
    label: "Transition Attack",
    description:
      "Fast-paced offense built around transition scoring and playmaking.",
  },
  {
    color: "#22C55E",
    label: "Defensive Powerhouse",
    description: "Elite defense, rebounding, and physical control.",
  },
  {
    color: "#A855F7",
    label: "Spacing Engine",
    description: "High-level shooting and floor spacing.",
  },
  {
    color: "#F97316",
    label: "Offensive Superteam",
    description: "Explosive scoring from multiple creators.",
  },
  {
    color: "#EFBF04",
    label: "Two-Way Dynasty",
    description: "Dominance on both offense and defense.",
  },
  {
    color: "#CBD5E1",
    label: "Balanced Core",
    description: "Well-rounded lineup with no major specialization.",
  },
  {
    color: "#38BDF8",
    label: "Star-Powered Contender",
    description: "Driven by elite individual talent and star power.",
  },
  {
    color: "#EF4444",
    label: "Paint Control Unit",
    description: "Interior scoring, rim protection, and rebounding.",
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
