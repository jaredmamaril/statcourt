import type { LineupSlot, Player } from "../../court-data";
import {
  getBuilderPlayerRatingForPosition,
  type BuilderStatProfileMode,
} from "./builder-position-helpers";

export const EMPTY_LINEUP: Record<LineupSlot, string> = {
  PG: "",
  SG: "",
  SF: "",
  PF: "",
  C: "",
};

export type SelectedCustomPlayerSlot = {
  position: LineupSlot;
  player: Player;
};

export function getSelectedCustomPlayerSlots(
  playersByName: Map<string, Player>,
  customLineup: Record<LineupSlot, string>,
  lineupPositions: LineupSlot[],
): SelectedCustomPlayerSlot[] {
  return lineupPositions
    .map((position) => {
      const player = playersByName.get(customLineup[position]);

      return player ? { position, player } : null;
    })
    .filter((slot): slot is SelectedCustomPlayerSlot => Boolean(slot));
}

export function getBuilderLineupAverageRating(
  selectedCustomPlayerSlots: SelectedCustomPlayerSlot[],
  statProfileMode: BuilderStatProfileMode,
) {
  if (selectedCustomPlayerSlots.length === 0) {
    return null;
  }

  return (
    selectedCustomPlayerSlots.reduce(
      (total, slot) =>
        total +
        getBuilderPlayerRatingForPosition(
          slot.player,
          slot.position,
          statProfileMode,
        ),
      0,
    ) / selectedCustomPlayerSlots.length
  );
}

type GetAvailableBuildPlayersParams = {
  players: Player[];
  buildPlayerSearch: string;
  activeBuildPosition: LineupSlot;
  activePositionPlayerName: string;
  selectedCustomPlayers: Player[];
  statProfileMode: BuilderStatProfileMode;
};

export function getAvailableBuildPlayers({
  players,
  buildPlayerSearch,
  activeBuildPosition,
  activePositionPlayerName,
  selectedCustomPlayers,
  statProfileMode,
}: GetAvailableBuildPlayersParams) {
  const selectedBuildPlayerNames = new Set(
    selectedCustomPlayers.map((player) => player.name),
  );
  const normalizedSearch = buildPlayerSearch.trim().toLowerCase();

  return players
    .filter((player) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch);

      const isAlreadySelectedSomewhere = selectedBuildPlayerNames.has(
        player.name,
      );

      const isSelectedInThisPosition = player.name === activePositionPlayerName;

      return (
        matchesSearch &&
        (!isAlreadySelectedSomewhere || isSelectedInThisPosition)
      );
    })
    .map((player) => ({
      player,
      rating: getBuilderPlayerRatingForPosition(
        player,
        activeBuildPosition,
        statProfileMode,
      ),
    }))
    .sort((a, b) => b.rating - a.rating)
    .map((item) => item.player);
}

export type PlayerRevealMode = "instant" | "draftStart" | "savedLoad";

export function getPlayerRevealDelay(mode: PlayerRevealMode, index: number) {
  if (mode === "draftStart") {
    return `${index * 260}ms`;
  }

  if (mode === "savedLoad") {
    return `${index * 180}ms`;
  }

  return "0ms";
}
