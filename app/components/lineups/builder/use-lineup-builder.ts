import { useState } from "react";
import type { Position } from "../../court-data";
import {
  EMPTY_LINEUP,
  getAvailableBuildPlayers,
  getCustomLineupOverall,
  getSelectedCustomPlayerSlots,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type UseLineupBuilderProps = {
  lineupPositions: Position[];
};

export function useLineupBuilder({ lineupPositions }: UseLineupBuilderProps) {
  const [hasStartedBuilder, setHasStartedBuilder] = useState(false);
  const [customLineup, setCustomLineup] =
    useState<Record<Position, string>>(EMPTY_LINEUP);
  const [activeBuildPosition, setActiveBuildPosition] =
    useState<Position>("PG");
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");
  const [playerRevealMode, setPlayerRevealMode] =
    useState<PlayerRevealMode>("instant");

  const selectedCustomPlayerSlots = getSelectedCustomPlayerSlots(
    customLineup,
    lineupPositions,
  );

  const selectedCustomPlayers = selectedCustomPlayerSlots.map(
    (slot) => slot.player,
  );

  const customLineupOverall = getCustomLineupOverall(selectedCustomPlayerSlots);

  const activePositionPlayerName = customLineup[activeBuildPosition];

  const availableBuildPlayers = getAvailableBuildPlayers({
    buildPlayerSearch,
    activeBuildPosition,
    activePositionPlayerName,
    selectedCustomPlayers,
  });

  const selectedLineupCount = selectedCustomPlayers.length;

  const isLineupComplete = selectedLineupCount === lineupPositions.length;

  const hasExistingDraft = lineupPositions.some(
    (position) => customLineup[position] !== "",
  );

  function pickBuildPlayer(playerName: string) {
    setPlayerRevealMode("instant");

    setCustomLineup((prev) => ({
      ...prev,
      [activeBuildPosition]: playerName,
    }));
  }

  function removeBuildPlayer(position: Position) {
    setCustomLineup((prev) => ({
      ...prev,
      [position]: "",
    }));
  }

  function resetDraft() {
    setCustomLineup(EMPTY_LINEUP);
    setActiveBuildPosition("PG");
    setBuildPlayerSearch("");
  }

  function startNewDraft() {
    resetDraft();
    setHasStartedBuilder(true);
  }

  function continueDraft() {
    setBuildPlayerSearch("");
    setHasStartedBuilder(true);
  }

  return {
    hasStartedBuilder,
    setHasStartedBuilder,
    customLineup,
    setCustomLineup,
    activeBuildPosition,
    setActiveBuildPosition,
    hoveredBuildPlayer,
    setHoveredBuildPlayer,
    buildPlayerSearch,
    setBuildPlayerSearch,
    playerRevealMode,
    setPlayerRevealMode,
    selectedCustomPlayerSlots,
    selectedCustomPlayers,
    customLineupOverall,
    availableBuildPlayers,
    selectedLineupCount,
    isLineupComplete,
    hasExistingDraft,
    pickBuildPlayer,
    removeBuildPlayer,
    resetDraft,
    startNewDraft,
    continueDraft,
  };
}
