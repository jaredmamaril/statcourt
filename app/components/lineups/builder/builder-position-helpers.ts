import type { LineupSlot } from "../../court-data";
import { players } from "../../court-data";
import { getPlayerRating } from "../../player-ratings";

type Player = (typeof players)[number];

export type PositionFit = "natural" | "secondary" | "mismatch";

export function getBuilderPlayerRating(player: Player) {
  return getPlayerRating(player, "overall");
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
    return "secondary";
  }

  if (player.position === "F" && (slot === "SG" || slot === "C")) {
    return "secondary";
  }

  if (player.position === "C" && slot === "PF") {
    return "secondary";
  }

  return "mismatch";
}

export function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "secondary") return 3;
  return 9;
}

export function getBuilderPlayerRatingForPosition(
  player: Player,
  slot: LineupSlot,
) {
  return (
    getBuilderPlayerRating(player) -
    getPositionPenalty(getPositionFit(player, slot))
  );
}
