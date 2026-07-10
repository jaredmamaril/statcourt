import type { LineupSlot, Player } from "../../court-data";
import {
  getPlayerRating,
  type PlayerStatProfileMode,
} from "../../player-ratings";

export type BuilderStatProfileMode = PlayerStatProfileMode;
export type PositionFit = "natural" | "flex" | "reach" | "mismatch";

export function getBuilderPlayerRating(
  player: Player,
  statProfileMode: BuilderStatProfileMode,
) {
  return getPlayerRating(player, "careerOverall", statProfileMode);
}

export function getPositionFit(player: Player, slot: LineupSlot): PositionFit {
  if (player.position === "G" && (slot === "PG" || slot === "SG")) {
    return "natural";
  }

  if (player.position === "F" && (slot === "SF" || slot === "PF")) {
    return "natural";
  }

  if (player.position === "C" && slot === "C") {
    return "natural";
  }

  if (player.position === "G" && slot === "SF") {
    return "flex";
  }

  if (player.position === "F" && (slot === "SG" || slot === "C")) {
    return "flex";
  }

  if (player.position === "C" && slot === "PF") {
    return "flex";
  }

  if (player.position === "G" && slot === "PF") {
    return "reach";
  }

  if (player.position === "F" && slot === "PG") {
    return "reach";
  }

  return "mismatch";
}

export function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "flex") return 2;
  if (fit === "reach") return 5;
  return 10;
}

export function getBuilderPlayerRatingForPosition(
  player: Player,
  slot: LineupSlot,
  statProfileMode: BuilderStatProfileMode,
) {
  return (
    getBuilderPlayerRating(player, statProfileMode) -
    getPositionPenalty(getPositionFit(player, slot))
  );
}
