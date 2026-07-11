import { useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import {
  EMPTY_LINEUP,
  getAvailableBuildPlayers,
  getBuilderLineupAverageRating,
  getSelectedCustomPlayerSlots,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";
import type { BuilderStatProfileMode } from "./builder-position-helpers";

type UseLineupBuilderProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
};

export function useLineupBuilder({
  players,
  lineupPositions,
}: UseLineupBuilderProps) {
  const [hasStartedBuilder, setHasStartedBuilder] = useState(false);
  const [customLineup, setCustomLineup] =
    useState<Record<LineupSlot, string>>(EMPTY_LINEUP);
  const [activeBuildPosition, setActiveBuildPosition] =
    useState<LineupSlot>("PG");
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");
  const [builderStatProfile, setBuilderStatProfile] =
    useState<BuilderStatProfileMode>("career");
  const [playerRevealMode, setPlayerRevealMode] =
    useState<PlayerRevealMode>("instant");

  const selectedCustomPlayerSlots = getSelectedCustomPlayerSlots(
    players,
    customLineup,
    lineupPositions,
  );

  const selectedCustomPlayers = selectedCustomPlayerSlots.map(
    (slot) => slot.player,
  );

  const builderLineupRating = getBuilderLineupAverageRating(
    selectedCustomPlayerSlots,
    builderStatProfile,
  );

  const activePositionPlayerName = customLineup[activeBuildPosition];

  const availableBuildPlayers = getAvailableBuildPlayers({
    players,
    buildPlayerSearch,
    activeBuildPosition,
    activePositionPlayerName,
    selectedCustomPlayers,
    statProfileMode: builderStatProfile,
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

  function removeBuildPlayer(position: LineupSlot) {
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
    builderStatProfile,
    setBuilderStatProfile,
    playerRevealMode,
    setPlayerRevealMode,
    selectedCustomPlayerSlots,
    selectedCustomPlayers,
    builderLineupRating,
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
