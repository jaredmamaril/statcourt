"use client";

import {
  players,
  statMaxValues,
  normalizeStat,
  teamColors,
} from "../components/court-data";
import { RadarStatRow } from "../components/court-data";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TooltipContentProps } from "recharts";

export default function Court() {
  // State for left player selection
  const [leftPlayer, setLeftPlayer] = useState("");
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const selectedLeftPlayer = players.find(
    (player) => player.name === leftPlayer,
  );

  // State for right player selection
  const [rightPlayer, setRightPlayer] = useState("");
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const selectedRightPlayer = players.find(
    (player) => player.name === rightPlayer,
  );

  // Prepare radar chart data
  const radarData: RadarStatRow[] = [
    {
      stat: "PPG",
      playerOne: selectedLeftPlayer
        ? normalizeStat(selectedLeftPlayer.stats.ppg, statMaxValues.ppg)
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(selectedRightPlayer.stats.ppg, statMaxValues.ppg)
        : 0,
      playerOneActual: selectedLeftPlayer ? selectedLeftPlayer.stats.ppg : 0,
      playerTwoActual: selectedRightPlayer ? selectedRightPlayer.stats.ppg : 0,
    },
    {
      stat: "RPG",
      playerOne: selectedLeftPlayer
        ? normalizeStat(selectedLeftPlayer.stats.rpg, statMaxValues.rpg)
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(selectedRightPlayer.stats.rpg, statMaxValues.rpg)
        : 0,
      playerOneActual: selectedLeftPlayer ? selectedLeftPlayer.stats.rpg : 0,
      playerTwoActual: selectedRightPlayer ? selectedRightPlayer.stats.rpg : 0,
    },
    {
      stat: "APG",
      playerOne: selectedLeftPlayer
        ? normalizeStat(selectedLeftPlayer.stats.apg, statMaxValues.apg)
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(selectedRightPlayer.stats.apg, statMaxValues.apg)
        : 0,
      playerOneActual: selectedLeftPlayer ? selectedLeftPlayer.stats.apg : 0,
      playerTwoActual: selectedRightPlayer ? selectedRightPlayer.stats.apg : 0,
    },
    {
      stat: "FG%",
      playerOne: selectedLeftPlayer
        ? normalizeStat(
            selectedLeftPlayer.stats.fgPercent,
            statMaxValues.fgPercent,
          )
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(
            selectedRightPlayer.stats.fgPercent,
            statMaxValues.fgPercent,
          )
        : 0,
      playerOneActual: selectedLeftPlayer
        ? selectedLeftPlayer.stats.fgPercent
        : 0,
      playerTwoActual: selectedRightPlayer
        ? selectedRightPlayer.stats.fgPercent
        : 0,
    },
    {
      stat: "3PT%",
      playerOne: selectedLeftPlayer
        ? normalizeStat(
            selectedLeftPlayer.stats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(
            selectedRightPlayer.stats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerOneActual: selectedLeftPlayer
        ? selectedLeftPlayer.stats.threePercent
        : 0,
      playerTwoActual: selectedRightPlayer
        ? selectedRightPlayer.stats.threePercent
        : 0,
    },
    {
      stat: "FT%",
      playerOne: selectedLeftPlayer
        ? normalizeStat(
            selectedLeftPlayer.stats.ftPercent,
            statMaxValues.ftPercent,
          )
        : 0,
      playerTwo: selectedRightPlayer
        ? normalizeStat(
            selectedRightPlayer.stats.ftPercent,
            statMaxValues.ftPercent,
          )
        : 0,
      playerOneActual: selectedLeftPlayer
        ? selectedLeftPlayer.stats.ftPercent
        : 0,
      playerTwoActual: selectedRightPlayer
        ? selectedRightPlayer.stats.ftPercent
        : 0,
    },
  ];

  // Custom tooltip for radar chart stats
  function customTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload || !payload.length) {
      return null;
    }

    if (active && payload && payload.length) {
      const data = payload[0].payload as RadarStatRow;

      return (
        <div className="rounded-md border border-[#347A99]/50 bg-[#07111f]/80 px-4 py-3 text-sm shadow-lg">
          <p className="font-michroma text-base font-bold text-[#1bc2ec]">
            {label}
          </p>
          <p className=" text-[#F4BB44] mt-2 font-michroma">
            {selectedLeftPlayer ? selectedLeftPlayer.name : "Player 1"}:{" "}
            {data.playerOneActual}
          </p>
          <p className=" text-[#50b4de] mt-2 font-michroma">
            {selectedRightPlayer ? selectedRightPlayer.name : "Player 2"}:{" "}
            {data.playerTwoActual}
          </p>
        </div>
      );
    }
  }

  // Search states for dropdowns
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  // Filtered player lists based on search input
  const filteredLeftPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(leftSearch.toLowerCase()),
  );
  const filteredRightPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(rightSearch.toLowerCase()),
  );

  // Function to close dropdown when clicking outside
  const leftDropdownRef = useRef<HTMLDivElement>(null);
  const rightDropdownRef = useRef<HTMLDivElement>(null);
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <section className="relative flex min-h-screen overflow-hidden items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        {/* Left player selection */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full w-1/2 justify-start pl-3 pt-20">
          <div className="pointer-events-auto flex flex-col items-center">
            {/* Heading for player selection */}
            <h1 className="font-michroma text-xl text-white font-bold">
              CHOOSE YOUR PLAYER
            </h1>

            {/* Player image container with conditional rendering */}
            <div className="mt-2 flex h-64 w-64 items-center justify-center rounded-md border border-[#347A99]/50 bg-black/5 text-sm text-white/70">
              {selectedLeftPlayer ? (
                <Image
                  src={selectedLeftPlayer.image}
                  alt={selectedLeftPlayer.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-full w-full"
                />
              ) : (
                "Player Image"
              )}
            </div>

            {/* Dropdown for left player selection */}
            <div ref={leftDropdownRef} className="relative mt-2 w-56">
              <button
                type="button"
                onClick={() => setIsLeftDropdownOpen(!isLeftDropdownOpen)}
                className="flex cursor-pointer w-full items-center justify-between rounded-md border border-[#347A99]/50 bg-black/60 px-4 py-2 font-michroma text-white outline-none"
              >
                <span>
                  {selectedLeftPlayer
                    ? selectedLeftPlayer.name
                    : "Choose Player"}
                </span>
                <span className="text-[#347A99]">▾</span>
              </button>

              {/* Dropdown menu for left player selection, conditionally rendered based on state */}
              {isLeftDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-51 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-xs text-white shadow-xl">
                  {/* Search input for filtering players in the dropdown */}
                  <input
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    placeholder="Search Player..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-white/30 bg-black/40 px-3 py-1.5 text-white/80 placeholder:text-[#2da6c4] font-michroma"
                  />
                  {/* List of players filtered based on search input, rendered as buttons in the dropdown */}
                  {filteredLeftPlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setLeftPlayer(
                          leftPlayer === player.name ? "" : player.name,
                        );
                        setIsLeftDropdownOpen(false);
                        setLeftSearch("");
                      }}
                      className={`cursor-pointer flex w-full items-center gap-1 px-4 py-3 text-left font-michroma text-xs text-white hover:bg-white/10 transition-all duration-200 ${leftPlayer === player.name ? "border-[#178aa7] bg-[#1bc2ec]/30 text-[#1bc2ec]" : "border-white/10 bg-black/20 text-white/90 hover:bg-white/5 hover:border-white/30"}`}
                    >
                      <span className="block flex-1">{player.name}</span>
                      <span
                        className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60"
                        style={{
                          backgroundColor: teamColors[player.team],
                          borderColor: teamColors[player.team],
                        }}
                      >
                        {player.team}
                      </span>
                      <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                        {player.position}
                      </span>
                      <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                        #{player.jerseyNumber}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Radar chart container, centered on the court background */}
        <div className="absolute left-1/2 top-1/2 z-20 flex h-120 w-130 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 backdrop">
          {/* Responsive container for the radar chart, ensuring it scales properly within the available space */}
          <ResponsiveContainer width="100%" height="100%">
            {/* Main radar chart component */}
            <RadarChart data={radarData}>
              {/* Grid lines */}
              <PolarGrid stroke="rgba(255,255,255,0.25)" />
              {/* Stat labels */}
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "white", fontSize: 14, fontFamily: "Michroma" }}
              />
              {/* Radial axis, hidden for cleaner look */}
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              {/* Custom tooltip for displaying actual stat values on hover */}
              <Tooltip content={customTooltip} />
              {/* Radar area for left player */}
              <Radar
                name={
                  selectedLeftPlayer ? selectedLeftPlayer.name : "Player One"
                }
                dataKey="playerOne"
                stroke="#F4BB44"
                strokeWidth={2}
                fill="#F4BB44"
                fillOpacity={0.14}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              />
              {/* Radar area for right player */}
              <Radar
                name={
                  selectedRightPlayer ? selectedRightPlayer.name : "Player Two"
                }
                dataKey="playerTwo"
                stroke="#347A99"
                strokeWidth={2}
                fill="#347A99"
                fillOpacity={0.22}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* Right player selection */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 flex h-full w-1/2 justify-end pr-3 pt-20">
          <div className="pointer-events-auto flex flex-col items-center">
            {/* Heading for player selection */}
            <h1 className="font-michroma text-xl font-bold text-white">
              CHOOSE YOUR PLAYER
            </h1>

            {/* Player image container with conditional rendering */}
            <div className="mt-2 flex h-64 w-64 items-center justify-center rounded-md border border-[#347A99]/50 bg-black/5 text-sm text-white/70">
              {selectedRightPlayer ? (
                <Image
                  src={selectedRightPlayer.image}
                  alt={selectedRightPlayer.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-full w-full"
                />
              ) : (
                "Player Image"
              )}
            </div>

            {/* Dropdown for right player selection */}
            <div ref={rightDropdownRef} className="relative mt-2 w-56">
              <button
                type="button"
                onClick={() => setIsRightDropdownOpen(!isRightDropdownOpen)}
                className="flex cursor-pointer w-full items-center justify-between rounded-md border border-[#347A99]/50 bg-black/60 px-4 py-2 font-michroma text-white outline-none"
              >
                <span>
                  {selectedRightPlayer
                    ? selectedRightPlayer.name
                    : "Choose Player"}
                </span>
                <span className="text-[#347A99]">▾</span>
              </button>

              {/* Dropdown menu for right player selection, conditionally rendered based on state */}
              {isRightDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-51 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-xs text-white shadow-xl">
                  {/* Search input for filtering players in the dropdown */}
                  <input
                    value={rightSearch}
                    onChange={(e) => setRightSearch(e.target.value)}
                    placeholder="Search Player..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-white/30 bg-black/40 px-3 py-1.5 text-white/80 placeholder:text-[#2da6c4] font-michroma"
                  />
                  {/* List of players filtered based on search input, rendered as buttons in the dropdown */}
                  {filteredRightPlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setRightPlayer(
                          rightPlayer === player.name ? "" : player.name,
                        );
                        setIsRightDropdownOpen(false);
                        setRightSearch("");
                      }}
                      className={`cursor-pointer flex w-full items-center gap-1 px-4 py-3 text-left font-michroma text-xs text-white hover:bg-white/10 transition-all duration-200 ${rightPlayer === player.name ? "border-[#178aa7] bg-[#1bc2ec]/30 text-[#1bc2ec]" : "border-white/10 bg-black/20 text-white/90 hover:bg-white/5 hover:border-white/30"}`}
                    >
                      <span className="block flex-1">{player.name}</span>
                      <span
                        className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/80"
                        style={{
                          backgroundColor: teamColors[player.team],
                          borderColor: teamColors[player.team],
                        }}
                      >
                        {player.team}
                      </span>
                      <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                        {player.position}
                      </span>
                      <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] text-white/60">
                        #{player.jerseyNumber}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
