"use client";

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

export default function Court() {
  type PlayerStats = {
    ppg: number; // Points Per Game
    rpg: number; // Rebounds Per Game
    apg: number; // Assists Per Game
    fgPercent: number; // Field Goal Percentage
    threePercent: number; // Three Point Percentage
    ftPercent: number; // Free Throw Percentage
  };

  type Player = {
    value: string;
    label: string;
    image: string;
    stats: PlayerStats;
  };

  const players: Player[] = [
    {
      value: "lebron-james",
      label: "LeBron James",
      image: "/temp-players/lebron-james.png",
      stats: {
        ppg: 27.0,
        rpg: 7.4,
        apg: 8.3,
        fgPercent: 50.4,
        threePercent: 34.5,
        ftPercent: 73.4,
      },
    },
    {
      value: "michael-jordan",
      label: "Michael Jordan",
      image: "/temp-players/michael-jordan.jpg",
      stats: {
        ppg: 30.1,
        rpg: 6.2,
        apg: 3.4,
        fgPercent: 49.7,
        threePercent: 37.9,
        ftPercent: 83.5,
      },
    },
    {
      value: "kobe-bryant",
      label: "Kobe Bryant",
      image: "/temp-players/kobe-bryant.jpg",
      stats: {
        ppg: 25.0,
        rpg: 5.2,
        apg: 4.7,
        fgPercent: 44.7,
        threePercent: 32.9,
        ftPercent: 83.7,
      },
    },
    {
      value: "stephen-curry",
      label: "Stephen Curry",
      image: "/temp-players/stephen-curry.png",
      stats: {
        ppg: 24.2,
        rpg: 4.6,
        apg: 6.5,
        fgPercent: 47.7,
        threePercent: 43.3,
        ftPercent: 90.6,
      },
    },
  ];

  const [leftPlayer, setLeftPlayer] = useState("");
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const selectedLeftPlayer = players.find(
    (player) => player.value === leftPlayer,
  );

  const [rightPlayer, setRightPlayer] = useState("");
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const selectedRightPlayer = players.find(
    (player) => player.value === rightPlayer,
  );

  const statMaxValues = {
    ppg: 35,
    rpg: 15,
    apg: 12,
    fgPercent: 65,
    threePercent: 45,
    ftPercent: 95,
  };

  function normalizeStat(value: number, max: number) {
    return Math.min((value / max) * 100, 100);
  }

  type radarStatRow = {
    stat: string;
    playerOne: number;
    playerTwo: number;
    playerOneActual: number;
    playerTwoActual: number;
  };

  const radarData: radarStatRow[] = [
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

  type CustomTooltipProps = {
    active?: boolean;
    payload?: {
      payload: radarStatRow;
    }[];
    label?: string;
  };

  function customTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
    }
    return null;
  }

  return (
    <main className="h-screen overflow-hidden bg-[#07111f] text-white">
      <section className="relative flex h-screen overflow-hidden items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="absolute left-0 top-0 z-10 flex h-full w-1/2 justify-start pl-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl text-white font-bold">
              CHOOSE YOUR PLAYER
            </h1>

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

              {isLeftDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-32 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
                  {players.map((player) => (
                    <button
                      key={player.value}
                      type="button"
                      onClick={() => {
                        setLeftPlayer(player.value);
                        setIsLeftDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left font-michroma text-sm text-white hover:bg-white/10"
                    >
                      {player.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-120 w-130 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/7 backdrop-blur-lg">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.25)" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "white", fontSize: 14, fontFamily: "Michroma" }}
              />
              <PolarRadiusAxis
                angle={50}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip />
              <Radar
                name={
                  selectedLeftPlayer ? selectedLeftPlayer.label : "Player One"
                }
                dataKey="playerOne"
                stroke="#F4BB44"
                strokeWidth={2}
                fill="#F4BB44"
                fillOpacity={0.14}
              />
              <Radar
                name={
                  selectedRightPlayer ? selectedRightPlayer.label : "Player Two"
                }
                dataKey="playerTwo"
                stroke="#347A99"
                strokeWidth={2}
                fill="#347A99"
                fillOpacity={0.22}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute right-0 top-0 z-10 flex h-full w-1/2 justify-end pr-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl font-bold text-white">
              CHOOSE YOUR PLAYER
            </h1>

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

              {isRightDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-32 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
                  {players.map((player) => (
                    <button
                      key={player.value}
                      type="button"
                      onClick={() => {
                        setRightPlayer(player.value);
                        setIsRightDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left font-michroma text-sm text-white hover:bg-white/10"
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
