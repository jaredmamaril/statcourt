"use client";

import { useState, useRef, useEffect } from "react";

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
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const leftDropdownRef = useRef<HTMLDivElement>(null);
  const rightDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Node)) {
        return;
      }
      const target = event.target;
      if (
        leftDropdownRef.current &&
        !leftDropdownRef.current.contains(target)
      ) {
        setIsLeftDropdownOpen(false);
      }
      if (
        rightDropdownRef.current &&
        !rightDropdownRef.current.contains(target)
      ) {
        setIsRightDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Radar chart data
  const radarData = getRadarData(
    selectedLeftPlayer,
    selectedRightPlayer,
    statMode,
  );

  // Dropdown search results
  const filteredLeftPlayers = comparePlayers.filter((player) =>
    player.name.toLowerCase().includes(leftSearch.toLowerCase()),
  );
  const filteredRightPlayers = comparePlayers.filter((player) =>
    player.name.toLowerCase().includes(rightSearch.toLowerCase()),
  );

  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden bg-background text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      <section className="relative z-10 min-h-screen px-6 pt-2 pb-8 sm:px-10">
        <CourtComparisonHeader
          leftPlayer={selectedLeftPlayer}
          rightPlayer={selectedRightPlayer}
          statMode={statMode}
          onStatModeChange={setStatMode}
        />

        <div className="mx-auto mt-1 grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[320px_minmax(420px,1fr)_320px]">
          <CourtPlayerPanel
            side="left"
            selectedPlayer={selectedLeftPlayer}
            fallbackColor="#FFEA00"
            dropdownRef={leftDropdownRef}
            selectedPlayerName={leftPlayer}
            isOpen={isLeftDropdownOpen}
            setIsOpen={setIsLeftDropdownOpen}
            search={leftSearch}
            setSearch={setLeftSearch}
            filteredPlayers={filteredLeftPlayers}
            setPlayer={setLeftPlayer}
          />

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

          <CourtPlayerPanel
            side="right"
            selectedPlayer={selectedRightPlayer}
            fallbackColor="#347A99"
            dropdownRef={rightDropdownRef}
            selectedPlayerName={rightPlayer}
            isOpen={isRightDropdownOpen}
            setIsOpen={setIsRightDropdownOpen}
            search={rightSearch}
            setSearch={setRightSearch}
            filteredPlayers={filteredRightPlayers}
            setPlayer={setRightPlayer}
          />
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
    </main>
  );
}
