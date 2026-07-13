import { useCallback, useDeferredValue, useMemo, useState } from "react";
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
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");
  const [builderStatProfile, setBuilderStatProfile] =
    useState<BuilderStatProfileMode>("career");
  const [playerRevealMode, setPlayerRevealMode] =
    useState<PlayerRevealMode>("instant");
  const deferredBuildPlayerSearch = useDeferredValue(buildPlayerSearch);

  const playersByName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players],
  );

  const selectedCustomPlayerSlots = useMemo(
    () =>
      getSelectedCustomPlayerSlots(
        playersByName,
        customLineup,
        lineupPositions,
      ),
    [playersByName, customLineup, lineupPositions],
  );

  const selectedCustomPlayers = useMemo(
    () => selectedCustomPlayerSlots.map((slot) => slot.player),
    [selectedCustomPlayerSlots],
  );

  const builderLineupRating = useMemo(
    () =>
      getBuilderLineupAverageRating(
        selectedCustomPlayerSlots,
        builderStatProfile,
      ),
    [selectedCustomPlayerSlots, builderStatProfile],
  );

  const activePositionPlayerName = customLineup[activeBuildPosition];

  const availableBuildPlayers = useMemo(
    () =>
      getAvailableBuildPlayers({
        players,
        buildPlayerSearch: deferredBuildPlayerSearch,
        activeBuildPosition,
        activePositionPlayerName,
        selectedCustomPlayers,
        statProfileMode: builderStatProfile,
      }),
    [
      players,
      deferredBuildPlayerSearch,
      activeBuildPosition,
      activePositionPlayerName,
      selectedCustomPlayers,
      builderStatProfile,
    ],
  );

  const selectedLineupCount = selectedCustomPlayers.length;

  const isLineupComplete = selectedLineupCount === lineupPositions.length;

  const hasExistingDraft = lineupPositions.some(
    (position) => customLineup[position] !== "",
  );

  const pickBuildPlayer = useCallback((playerName: string) => {
    setPlayerRevealMode("instant");

    setCustomLineup((prev) => ({
      ...prev,
      [activeBuildPosition]: playerName,
    }));
  }, [activeBuildPosition]);

  const removeBuildPlayer = useCallback((position: LineupSlot) => {
    setCustomLineup((prev) => ({
      ...prev,
      [position]: "",
    }));
  }, []);

  const resetDraft = useCallback(() => {
    setCustomLineup(EMPTY_LINEUP);
    setActiveBuildPosition("PG");
    setBuildPlayerSearch("");
  }, []);

  const startNewDraft = useCallback(() => {
    resetDraft();
    setHasStartedBuilder(true);
  }, [resetDraft]);

  const continueDraft = useCallback(() => {
    setBuildPlayerSearch("");
    setHasStartedBuilder(true);
  }, []);

  return {
    hasStartedBuilder,
    setHasStartedBuilder,
    customLineup,
    setCustomLineup,
    activeBuildPosition,
    setActiveBuildPosition,
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
