import type { LineupSlot } from "../../court-data";
import type { LineupDetail, LineupTab } from "../shared/lineup-types";
import { greatestTeamsLineups } from "./details/greatest-teams";
import { bucketGettersLineups } from "./details/bucket-getters";
import { floorGeneralsLineups } from "./details/floor-generals";
import { lockdownSquadsLineups } from "./details/lockdown-squads";
import { splashSquadsLineups } from "./details/splash-squads";
import { allTimeTeamsLineups } from "./details/all-time-teams";
import type { LucideIcon } from "lucide-react";
import { Trophy, Flame, Brain, Shield, Target, Crown } from "lucide-react";

export const lineupPositions: LineupSlot[] = ["PG", "SG", "SF", "PF", "C"];

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
  ...greatestTeamsLineups,
  ...bucketGettersLineups,
  ...floorGeneralsLineups,
  ...lockdownSquadsLineups,
  ...splashSquadsLineups,
  ...allTimeTeamsLineups,
} satisfies Record<string, LineupDetail>;

export type LineupName = keyof typeof lineupDetails;

export const lineupGroups = {
  "Greatest Teams": ["1996 Bulls", "2017 Warriors", "1986 Celtics"],
  "Bucket Getters": ["Isolation Killers", "Pure Scorers", "Wing Assassins"],
  "Floor Generals": [
    "Pass First Legends",
    "Point God Lineup",
    "Five-Man Creation",
  ],
  "Lockdown Squads": [
    "All-Defense Unit",
    "Rim Protection Wall",
    "Switch Everything",
  ],
  "Splash Squads": [
    "Spacing Nightmare",
    "Splash Brothers Core",
    "Five-Out Firepower",
  ],
  "All-Time Teams": ["All-Time Lakers", "All-Time Bulls", "All-Time Warriors"],
} satisfies Record<LineupCategory, LineupName[]>;

// Court marker positions
export const featuredCourtMarkerPositions: Record<LineupSlot, string> = {
  PG: "left-1/2 top-5",
  SG: "left-[20%] top-17",
  SF: "left-[75%] bottom-18",
  PF: "left-[27%] top-62",
  C: "left-[65%] top-42",
};

export const builderCourtMarkerPositions: Record<LineupSlot, string> = {
  PG: "left-1/2 top-6",
  SG: "left-[22%] top-16",
  SF: "left-[78%] bottom-10",
  PF: "left-[25%] bottom-20",
  C: "left-[65%] top-50",
};
