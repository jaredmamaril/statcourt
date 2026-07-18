"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";

import { useAuthUser } from "../lib/use-auth-user";
import { useUserSettings } from "../lib/use-user-settings";
import { DatabaseLoadingState } from "../components/loading/database-loading-state";
import { DatabaseErrorState } from "../components/loading/database-error-state";

import {
  players as fallbackPlayers,
  getTeamColor,
  type Player,
  type StatMode,
} from "../components/court-data";

import { useCompareSlots } from "../components/players/use-compare-slots";

import { PlayerComparisonRadar } from "../components/court/player-comparison-radar";
import { CourtPlayerPanel } from "../components/court/court-player-panel";
import { getRadarData } from "../components/court/court-radar-data";

import { CourtComparisonHeader } from "../components/court/court-comparison-header";
import { CourtComparisonEdges } from "../components/court/court-comparison-edges";
import { CourtMatchupSummary } from "../components/court/court-matchup-summary";

import { CourtPlayerPickerModal } from "../components/court/court-player-picker-modal";

const COURT_PLAYER_PICKER_LIMIT = 20;

export default function Court() {
  const { user } = useAuthUser();
  const { settings, isLoadingSettings } = useUserSettings();
  const { compareSlots, updateCompareSlots } = useCompareSlots(user);

  // Compare state
  const [comparePlayers, setComparePlayers] =
    useState<Player[]>(fallbackPlayers);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const [leftPlayer, setLeftPlayer] = useState("");
  const [rightPlayer, setRightPlayer] = useState("");
  const [statMode, setStatMode] = useState<StatMode>("career");
  const hasAppliedDefaultStatModeRef = useRef(false);

  const selectedLeftPlayer = comparePlayers.find(
    (player) => player.name === leftPlayer,
  );
  const selectedRightPlayer = comparePlayers.find(
    (player) => player.name === rightPlayer,
  );

  // Dropdown state
  const [activePickerSide, setActivePickerSide] = useState<
    "left" | "right" | null
  >(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const deferredPickerSearch = useDeferredValue(pickerSearch);

  // Load full player data, including stat profiles
  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultStatModeRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setStatMode(settings.defaultStatMode);
      hasAppliedDefaultStatModeRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultStatMode]);

  useEffect(() => {
    let isActive = true;

    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        setPlayerLoadError("");

        const response = await fetch("/api/players");

        if (!response.ok) {
          throw new Error("Failed to load players");
        }

        const data = (await response.json()) as {
          players?: Player[];
        };

        if (isActive && data.players && data.players.length > 0) {
          setComparePlayers(data.players);
        }
      } catch (error) {
        console.error("Failed to load court players", error);

        if (isActive) {
          setComparePlayers(fallbackPlayers);
          setPlayerLoadError("Could not load court player database.");
        }
      } finally {
        if (isActive) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isActive = false;
    };
  }, []);

  // Load saved comparison players
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setLeftPlayer(compareSlots.left);
      setRightPlayer(compareSlots.right);
    });

    return () => cancelAnimationFrame(frameId);
  }, [compareSlots.left, compareSlots.right]);

  // Radar chart data
  const radarData = getRadarData(
    selectedLeftPlayer,
    selectedRightPlayer,
    statMode,
  );

  // Chosen results
  const filteredPickerPlayers = comparePlayers.filter((player) =>
    player.name.toLowerCase().includes(deferredPickerSearch.toLowerCase()),
  );
  const displayedPickerPlayers = filteredPickerPlayers.slice(
    0,
    COURT_PLAYER_PICKER_LIMIT,
  );

  function selectModalPlayer(playerName: string) {
    if (activePickerSide === "left") {
      setLeftPlayer(playerName);
      void updateCompareSlots({
        ...compareSlots,
        left: playerName,
      });
    }

    if (activePickerSide === "right") {
      setRightPlayer(playerName);
      void updateCompareSlots({
        ...compareSlots,
        right: playerName,
      });
    }

    setActivePickerSide(null);
    setPickerSearch("");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      <section className="page-enter relative z-10 min-h-screen px-3 pt-2 pb-8 lg:px-10">
        <CourtComparisonHeader
          leftPlayer={selectedLeftPlayer}
          rightPlayer={selectedRightPlayer}
          isLoadingPlayers={isLoadingPlayers}
          statMode={statMode}
          onStatModeChange={setStatMode}
        />

        {isLoadingPlayers ? (
          <DatabaseLoadingState
            title="Loading Court Players"
            description="Syncing comparison profiles..."
          />
        ) : (
          <>
            {playerLoadError && (
              <DatabaseErrorState
                title="Court Players Unavailable"
                description="Showing fallback player data."
              />
            )}

            <div className="mx-auto mt-2 grid w-full max-w-7xl grid-cols-2 items-start gap-x-3 gap-y-5 lg:mt-1 lg:grid-cols-[320px_minmax(420px,1fr)_320px] lg:items-center lg:gap-8">
              <div className="order-1 lg:order-1">
                <CourtPlayerPanel
                  side="left"
                  selectedPlayer={selectedLeftPlayer}
                  fallbackColor="#FFEA00"
                  selectedPlayerName={leftPlayer}
                  onOpenPicker={() => setActivePickerSide("left")}
                />
              </div>

              <div className="order-3 col-span-2 lg:order-2 lg:col-span-1">
                <PlayerComparisonRadar
                  radarData={radarData}
                  selectedLeftPlayerName={selectedLeftPlayer?.name ?? ""}
                  selectedRightPlayerName={selectedRightPlayer?.name ?? ""}
                  leftColor={
                    selectedLeftPlayer
                      ? getTeamColor(selectedLeftPlayer.team)
                      : "#F4BB44"
                  }
                  rightColor={
                    selectedRightPlayer
                      ? getTeamColor(selectedRightPlayer.team)
                      : "#347A99"
                  }
                />
              </div>

              <div className="order-2 lg:order-3">
                <CourtPlayerPanel
                  side="right"
                  selectedPlayer={selectedRightPlayer}
                  fallbackColor="#347A99"
                  selectedPlayerName={rightPlayer}
                  onOpenPicker={() => setActivePickerSide("right")}
                />
              </div>
            </div>

            <CourtComparisonEdges
              leftPlayer={selectedLeftPlayer}
              rightPlayer={selectedRightPlayer}
              statMode={statMode}
            />

            <CourtMatchupSummary
              leftPlayer={selectedLeftPlayer}
              rightPlayer={selectedRightPlayer}
              statMode={statMode}
            />
          </>
        )}
      </section>

      <CourtPlayerPickerModal
        isOpen={activePickerSide !== null}
        side={activePickerSide}
        players={displayedPickerPlayers}
        search={pickerSearch}
        isLoadingPlayers={isLoadingPlayers}
        playerLoadError={playerLoadError}
        setSearch={setPickerSearch}
        onSelectPlayer={selectModalPlayer}
        onClose={() => {
          setActivePickerSide(null);
          setPickerSearch("");
        }}
      />
    </main>
  );
}
