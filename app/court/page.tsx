"use client";

import {
  players,
  statMaxValues,
  normalizeStat,
  type RadarStatRow,
} from "./court-data";
import Image from "next/image";
import { useState } from "react";
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
    (player) => player.value === leftPlayer,
  );

  // State for right player selection
  const [rightPlayer, setRightPlayer] = useState("");
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const selectedRightPlayer = players.find(
    (player) => player.value === rightPlayer,
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
            {selectedLeftPlayer ? selectedLeftPlayer.label : "Player 1"}:{" "}
            {data.playerOneActual}
          </p>
          <p className=" text-[#50b4de] mt-2 font-michroma">
            {selectedRightPlayer ? selectedRightPlayer.label : "Player 2"}:{" "}
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
    player.label.toLowerCase().includes(leftSearch.toLowerCase()),
  );
  const filteredRightPlayers = players.filter((player) =>
    player.label.toLowerCase().includes(rightSearch.toLowerCase()),
  );

  return (
    // Main container with background and full screen height
    <main className="h-screen overflow-hidden bg-[#07111f] text-white">
      <section className="relative flex h-screen overflow-hidden items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        {/* Left player selection */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full w-1/2 justify-start pl-3 pt-35">
          <div className="pointer-events-auto flex flex-col items-center">
            {/* Heading for player selection */}
            <h1 className="font-michroma text-xl text-white font-bold">
              CHOOSE YOUR PLAYER
            </h1>

            {/* Player image container with conditional rendering */}
            <div className="mt-6 flex h-56 w-56 items-center justify-center rounded-md border border-[#347A99]/50 bg-black/30 text-sm text-white/60 backdrop-blur-sm ">
              {selectedLeftPlayer ? (
                <Image
                  src={selectedLeftPlayer.image}
                  alt={selectedLeftPlayer.label}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-full w-full"
                />
              ) : (
                "Player Image"
              )}
            </div>

            {/* Dropdown for left player selection */}
            <div className="relative mt-8 w-56">
              <button
                type="button"
                onClick={() => setIsLeftDropdownOpen(!isLeftDropdownOpen)}
                className="flex cursor-pointer w-full items-center justify-between rounded-md border border-[#347A99]/50 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm"
              >
                <span>
                  {selectedLeftPlayer
                    ? selectedLeftPlayer.label
                    : "Choose Player"}
                </span>
                <span className="text-[#347A99]">▾</span>
              </button>

              {/* Dropdown menu for left player selection, conditionally rendered based on state */}
              {isLeftDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-32 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
                  {/* Search input for filtering players in the dropdown */}
                  <input
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    placeholder="Search Player..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-white/30 bg-black/40 px-3 py-2 text-white placeholder:text-[#2da6c4] font-michroma backdrop-blur-sm"
                  />
                  {/* List of players filtered based on search input, rendered as buttons in the dropdown */}
                  {filteredLeftPlayers.map((player) => (
                    <button
                      key={player.value}
                      type="button"
                      onClick={() => {
                        setLeftPlayer(player.value);
                        setIsLeftDropdownOpen(false);
                        setLeftSearch("");
                      }}
                      className="cursor-pointer block w-full px-4 py-3 text-left font-michroma text-sm text-white hover:bg-white/10"
                    >
                      {player.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Radar chart container, centered on the court background */}
        <div className="absolute left-1/2 top-1/2 z-20 flex h-120 w-130 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/7 backdrop-blur-lg">
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
                  selectedLeftPlayer ? selectedLeftPlayer.label : "Player One"
                }
                dataKey="playerOne"
                stroke="#F4BB44"
                strokeWidth={2}
                fill="#F4BB44"
                fillOpacity={0.14}
                dot={{ r: 2, fill: "#F4BB44" }}
              />
              {/* Radar area for right player */}
              <Radar
                name={
                  selectedRightPlayer ? selectedRightPlayer.label : "Player Two"
                }
                dataKey="playerTwo"
                stroke="#347A99"
                strokeWidth={2}
                fill="#347A99"
                fillOpacity={0.22}
                dot={{ r: 2, fill: "#347A99" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* Right player selection */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 flex h-full w-1/2 justify-end pr-3 pt-35">
          <div className="pointer-events-auto flex flex-col items-center">
            {/* Heading for player selection */}
            <h1 className="font-michroma text-xl font-bold text-white">
              CHOOSE YOUR PLAYER
            </h1>

            {/* Player image container with conditional rendering */}
            <div className="mt-6 flex h-56 w-56 items-center justify-center rounded-md border border-[#347A99]/50 bg-black/30 text-sm text-white/60 backdrop-blur-sm ">
              {selectedRightPlayer ? (
                <Image
                  src={selectedRightPlayer.image}
                  alt={selectedRightPlayer.label}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-full w-full"
                />
              ) : (
                "Player Image"
              )}
            </div>

            {/* Dropdown for right player selection */}
            <div className="relative mt-8 w-56">
              <button
                type="button"
                onClick={() => setIsRightDropdownOpen(!isRightDropdownOpen)}
                className="flex cursor-pointer w-full items-center justify-between rounded-md border border-[#347A99]/50 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm"
              >
                <span>
                  {selectedRightPlayer
                    ? selectedRightPlayer.label
                    : "Choose Player"}
                </span>
                <span className="text-[#347A99]">▾</span>
              </button>

              {/* Dropdown menu for right player selection, conditionally rendered based on state */}
              {isRightDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-32 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
                  {/* Search input for filtering players in the dropdown */}
                  <input
                    value={rightSearch}
                    onChange={(e) => setRightSearch(e.target.value)}
                    placeholder="Search Player..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-white/30 bg-black/40 px-3 py-2 text-white placeholder:text-[#2da6c4] font-michroma backdrop-blur-sm"
                  />
                  {/* List of players filtered based on search input, rendered as buttons in the dropdown */}
                  {filteredRightPlayers.map((player) => (
                    <button
                      key={player.value}
                      type="button"
                      onClick={() => {
                        setRightPlayer(player.value);
                        setIsRightDropdownOpen(false);
                        setRightSearch("");
                      }}
                      className="cursor-pointer block w-full px-4 py-3 text-left font-michroma text-sm text-white hover:bg-white/10"
                    >
                      {player.label}
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
