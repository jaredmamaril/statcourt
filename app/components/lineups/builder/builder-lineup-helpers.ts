import type { LineupSlot, Player } from "../../court-data";
import { getBuilderPlayerRatingForPosition } from "./builder-position-helpers";

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
  players: Player[],
  customLineup: Record<LineupSlot, string>,
  lineupPositions: LineupSlot[],
): SelectedCustomPlayerSlot[] {
  return lineupPositions
    .map((position) => {
      const player = players.find(
        (player) => player.name === customLineup[position],
      );

      return player ? { position, player } : null;
    })
    .filter((slot): slot is SelectedCustomPlayerSlot => Boolean(slot));
}

export function getCustomLineupOverall(
  selectedCustomPlayerSlots: SelectedCustomPlayerSlot[],
) {
  if (selectedCustomPlayerSlots.length === 0) {
    return null;
  }

  return (
    selectedCustomPlayerSlots.reduce(
      (total, slot) =>
        total + getBuilderPlayerRatingForPosition(slot.player, slot.position),
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
};

export function getAvailableBuildPlayers({
  players,
  buildPlayerSearch,
  activeBuildPosition,
  activePositionPlayerName,
  selectedCustomPlayers,
}: GetAvailableBuildPlayersParams) {
  const selectedBuildPlayerNames = new Set(
    selectedCustomPlayers.map((player) => player.name),
  );

  return players
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
    .sort(
      (a, b) =>
        getBuilderPlayerRatingForPosition(b, activeBuildPosition) -
        getBuilderPlayerRatingForPosition(a, activeBuildPosition),
    );
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
