import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getSavedBuilderDraft,
  saveBuilderDraft,
} from "../../players/player-storage";
import type { LineupSlot, Player } from "../../court-data";
import {
  EMPTY_LINEUP,
  getAvailableBuildPlayers,
  getBuilderLineupAverageRating,
  getSelectedCustomPlayerSlots,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";
import type { BuilderStatProfileMode } from "./builder-position-helpers";
import { getLineupScoutReport } from "../../lineup-scouting";

type UseLineupBuilderProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  defaultStatProfile?: BuilderStatProfileMode;
  isDefaultStatProfileReady?: boolean;
  initialHasStartedBuilder?: boolean;
};

export function useLineupBuilder({
  players,
  lineupPositions,
  defaultStatProfile = "career",
  isDefaultStatProfileReady = true,
  initialHasStartedBuilder = false,
}: UseLineupBuilderProps) {
  const [hasStartedBuilder, setHasStartedBuilder] = useState(
    initialHasStartedBuilder,
  );
  const [customLineup, setCustomLineup] =
    useState<Record<LineupSlot, string>>(getSavedBuilderDraft);
  const [activeBuildPosition, setActiveBuildPosition] =
    useState<LineupSlot>("PG");
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");
  const [builderStatProfile, setBuilderStatProfile] =
    useState<BuilderStatProfileMode>("career");
  const [playerRevealMode, setPlayerRevealMode] =
    useState<PlayerRevealMode>("instant");
  const deferredBuildPlayerSearch = useDeferredValue(buildPlayerSearch);
  const hasAppliedDefaultStatProfileRef = useRef(false);

  useEffect(() => {
    saveBuilderDraft(customLineup);
  }, [customLineup]);

  useEffect(() => {
    if (
      !isDefaultStatProfileReady ||
      hasAppliedDefaultStatProfileRef.current
    ) {
      return;
    }

    setBuilderStatProfile(defaultStatProfile);
    hasAppliedDefaultStatProfileRef.current = true;
  }, [defaultStatProfile, isDefaultStatProfileReady]);

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

  const averageLineupRating = useMemo(
    () => {
      if (selectedCustomPlayerSlots.length === 0) {
        return null;
      }

      return getBuilderLineupAverageRating(
        selectedCustomPlayerSlots,
        builderStatProfile,
      );
    },
    [selectedCustomPlayerSlots, builderStatProfile],
  );

  const scoutLineupRating = useMemo(
    () => {
      if (selectedCustomPlayerSlots.length !== lineupPositions.length) {
        return null;
      }

      return getLineupScoutReport(
        selectedCustomPlayerSlots,
        builderStatProfile,
      ).scores.overall;
    },
    [selectedCustomPlayerSlots, builderStatProfile, lineupPositions.length],
  );

  const builderLineupRating = scoutLineupRating ?? averageLineupRating;

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

  const placeBuildPlayer = useCallback(
    (playerName: string, position: LineupSlot) => {
      setPlayerRevealMode("instant");

      setCustomLineup((prev) => ({
        ...prev,
        [position]: playerName,
      }));
    },
    [],
  );

  const moveBuildPlayer = useCallback(
    (fromPosition: LineupSlot, toPosition: LineupSlot) => {
      if (fromPosition === toPosition) return;

      setPlayerRevealMode("instant");

      setCustomLineup((prev) => ({
        ...prev,
        [fromPosition]: prev[toPosition],
        [toPosition]: prev[fromPosition],
      }));
    },
    [],
  );

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
    averageLineupRating,
    scoutLineupRating,
    builderLineupRating,
    availableBuildPlayers,
    selectedLineupCount,
    isLineupComplete,
    hasExistingDraft,
    pickBuildPlayer,
    placeBuildPlayer,
    moveBuildPlayer,
    removeBuildPlayer,
    resetDraft,
    startNewDraft,
    continueDraft,
  };
}
