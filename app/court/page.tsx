"use client";

import { useState, useEffect } from "react";

import {
  players as fallbackPlayers,
  getTeamColor,
  type Player,
  type StatMode,
} from "../components/court-data";

import {
  getSavedCompareSlots,
  saveCompareSlots,
} from "../components/players/player-storage";

import { PlayerComparisonRadar } from "../components/court/player-comparison-radar";
import { CourtPlayerPanel } from "../components/court/court-player-panel";
import { getRadarData } from "../components/court/court-radar-data";

import { CourtComparisonHeader } from "../components/court/court-comparison-header";
import { CourtComparisonEdges } from "../components/court/court-comparison-edges";
import { CourtMatchupSummary } from "../components/court/court-matchup-summary";

import { CourtPlayerPickerModal } from "../components/court/court-player-picker-modal";

export default function Court() {
  // Compare state
  const [comparePlayers, setComparePlayers] =
    useState<Player[]>(fallbackPlayers);
  const [leftPlayer, setLeftPlayer] = useState("");
  const [rightPlayer, setRightPlayer] = useState("");
  const [statMode, setStatMode] = useState<StatMode>("career");

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

  // Saved compare slots
  const [hasLoadedSavedPlayers, setHasLoadedSavedPlayers] = useState(false);

  // Load full player data, including stat profiles
  useEffect(() => {
    let isActive = true;

    async function loadPlayers() {
      try {
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
      } catch {
        if (isActive) {
          setComparePlayers(fallbackPlayers);
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
    const savedSlots = getSavedCompareSlots();

    const timer = window.setTimeout(() => {
      setLeftPlayer(savedSlots.left);
      setRightPlayer(savedSlots.right);
      setHasLoadedSavedPlayers(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Save comparison players after initial load
  useEffect(() => {
    if (!hasLoadedSavedPlayers) return;

    saveCompareSlots({
      left: leftPlayer,
      right: rightPlayer,
    });
  }, [leftPlayer, rightPlayer, hasLoadedSavedPlayers]);

  // Radar chart data
  const radarData = getRadarData(
    selectedLeftPlayer,
    selectedRightPlayer,
    statMode,
  );

  // Chosen results
  const filteredPickerPlayers = comparePlayers.filter((player) =>
    player.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  function selectModalPlayer(playerName: string) {
    if (activePickerSide === "left") {
      setLeftPlayer(playerName);
    }

    if (activePickerSide === "right") {
      setRightPlayer(playerName);
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
          statMode={statMode}
          onStatModeChange={setStatMode}
        />

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
      </section>

      <CourtPlayerPickerModal
        isOpen={activePickerSide !== null}
        side={activePickerSide}
        players={filteredPickerPlayers}
        search={pickerSearch}
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
