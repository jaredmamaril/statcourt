import type { Position } from "../court-data";
import type { LineupDetail, LineupTab } from "./lineup-types";
import type { LucideIcon } from "lucide-react";
import { Trophy, Flame, Brain, Shield, Target, Crown } from "lucide-react";

export const lineupPositions: Position[] = ["PG", "SG", "SF", "PF", "C"];

export const lineupTabs: { label: string; value: LineupTab }[] = [
  { label: "Featured Lineups", value: "featured" },
  { label: "Build Your Own", value: "builder" },
  { label: "Your Saved Lineups", value: "saved" },
];

export const lineupCards = [
  { title: "Greatest Teams", color: "#EFBF04", Icon: Trophy },
  { title: "Bucket Getters", color: "#EF4444", Icon: Flame },
  { title: "Floor Generals", color: "#3B82F6", Icon: Brain },
  { title: "Lockdown Squads", color: "#A855F7", Icon: Shield },
  { title: "Splash Squads", color: "#14F1D9", Icon: Target },
  { title: "All-Time Teams", color: "#EFBF04", Icon: Crown },
] as const satisfies readonly {
  title: string;
  color: string;
  Icon: LucideIcon;
}[];

export type LineupCategory = (typeof lineupCards)[number]["title"];

export const lineupDetails = {
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

export type LineupName = keyof typeof lineupDetails;

export const lineupGroups = {
  "Greatest Teams": ["1996 Bulls"],
  "Bucket Getters": ["Isolation Killers"],
  "Floor Generals": ["Pass First Legends"],
  "Lockdown Squads": ["All-Defense Unit"],
  "Splash Squads": ["Spacing Nightmare"],
  "All-Time Teams": ["All-Time Lakers"],
} satisfies Record<LineupCategory, LineupName[]>;

// Court marker positions
export const featuredCourtMarkerPositions: Record<Position, string> = {
  PG: "left-1/2 top-5",
  SG: "left-[20%] top-17",
  SF: "left-[75%] bottom-18",
  PF: "left-[27%] top-62",
  C: "left-[65%] top-42",
};

export const builderCourtMarkerPositions: Record<Position, string> = {
  PG: "left-1/2 top-6",
  SG: "left-[22%] top-16",
  SF: "left-[78%] bottom-10",
  PF: "left-[25%] bottom-20",
  C: "left-[65%] top-50",
};
