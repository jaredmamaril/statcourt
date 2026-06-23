import { players, type Position } from "../../court-data";
import { getBuilderPlayerRatingForPosition } from "./builder-position-helpers";

export const EMPTY_LINEUP: Record<Position, string> = {
  PG: "",
  SG: "",
  SF: "",
  PF: "",
  C: "",
};

type Player = (typeof players)[number];

export type SelectedCustomPlayerSlot = {
  position: Position;
  player: Player;
};

export function getSelectedCustomPlayerSlots(
  customLineup: Record<Position, string>,
  lineupPositions: Position[],
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
  buildPlayerSearch: string;
  activeBuildPosition: Position;
  activePositionPlayerName: string;
  selectedCustomPlayers: Player[];
};

export function getAvailableBuildPlayers({
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
