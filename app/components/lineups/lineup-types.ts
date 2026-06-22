import type { Position } from "../court-data";
import type { LineupScoutScores, TeamGrades } from "../lineup-scouting";

export type LineupTab = "featured" | "builder" | "saved";

export type LineupRatings = {
  scoring: number;
  shooting: number;
  playmaking: number;
  rebounding: number;
  defense: number;
};

export type LineupAchievements = {
  record?: string;
  result?: string;
  playoffs?: string;
  note?: string;
};

export type LineupDetail = {
  players: Record<Position, string>;
  overall: number;
  ratings: LineupRatings;
  achievements: LineupAchievements;
  archetype: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
};

export type SavedLineup = {
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
  tradeoff: string;
  grades: TeamGrades;
  scores: LineupScoutScores;
  xFactorName: string;
  xFactorDescription: string;
  similarTo: string;
  similarToDescription: string;
  similarLineupMatches: {
    name: string;
    description: string;
    matchScore: number;
  }[];
  courtBalance: string;
  courtBalanceDescription: string;
  createdAt: string;
  badges: string[];
};
