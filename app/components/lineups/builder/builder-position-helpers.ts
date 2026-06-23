import type { Position } from "../../court-data";
import { players } from "../../court-data";
import { getPlayerRating } from "../../player-ratings";

type Player = (typeof players)[number];

export type PositionFit = "natural" | "secondary" | "emergency" | "mismatch";

const defaultSecondaryPositions: Record<Position, Position[]> = {
  PG: ["SG"],
  SG: ["PG", "SF"],
  SF: ["SG", "PF"],
  PF: ["SF", "C"],
  C: ["PF"],
};

export function getBuilderPlayerRating(player: Player) {
  return getPlayerRating(player, "overall");
}

export function getPlayerSecondaryPositions(player: Player): Position[] {
  return (
    player.secondaryPositions ?? defaultSecondaryPositions[player.position]
  );
}

export function getPlayerEmergencyPositions(player: Player): Position[] {
  return player.emergencyPositions ?? [];
}

export function getPositionFit(player: Player, slot: Position): PositionFit {
  if (player.position === slot) {
    return "natural";
  }

  if (getPlayerSecondaryPositions(player).includes(slot)) {
    return "secondary";
  }

  if (getPlayerEmergencyPositions(player).includes(slot)) {
    return "emergency";
  }

  return "mismatch";
}

export function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "secondary") return 2;
  if (fit === "emergency") return 5;
  return 9;
}

export function getBuilderPlayerRatingForPosition(
  player: Player,
  slot: Position,
) {
  return (
    getBuilderPlayerRating(player) -
    getPositionPenalty(getPositionFit(player, slot))
  );
}
