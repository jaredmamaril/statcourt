"use client";

import { useState, useRef, useEffect } from "react";

import { players, teamColors } from "../components/court-data";

import {
  getSavedCompareSlots,
  saveCompareSlots,
} from "../components/players/player-storage";

import { PlayerComparisonRadar } from "../components/court/player-comparison-radar";
import { CourtPlayerPanel } from "../components/court/court-player-panel";
import { getRadarData } from "../components/court/court-radar-data";

export default function Court() {
  // Compare state
  const [leftPlayer, setLeftPlayer] = useState("");
  const [rightPlayer, setRightPlayer] = useState("");

  const selectedLeftPlayer = players.find(
    (player) => player.name === leftPlayer,
  );
  const selectedRightPlayer = players.find(
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
  const radarData = getRadarData(selectedLeftPlayer, selectedRightPlayer);

  // Dropdown search results
  const filteredLeftPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(leftSearch.toLowerCase()),
  );
  const filteredRightPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(rightSearch.toLowerCase()),
  );

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="relative flex min-h-screen overflow-hidden items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="absolute left-1/2 top-6 z-30 max-w-xl -translate-x-1/2 text-center">
          <p className="font-michroma text-xs leading-relaxed text-white/40">
            Choose two players to compare their scoring, shooting, playmaking,
            rebounding, and efficiency profiles.
          </p>
        </div>
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
            selectedLeftPlayer ? teamColors[selectedLeftPlayer.team] : "#F4BB44"
          }
          rightColor={
            selectedRightPlayer
              ? teamColors[selectedRightPlayer.team]
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
      </section>
    </main>
  );
}
