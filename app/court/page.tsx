"use client";

import Image from "next/image";
import { useState } from "react";

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

  const radarData = [
    {
      stat: "PPG",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.ppg : 0,
      playerTwo: selectedRightPlayer ? selectedRightPlayer.stats.ppg : 0,
    },
    {
      stat: "RPG",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.rpg : 0,
      playerTwo: selectedRightPlayer ? selectedRightPlayer.stats.rpg : 0,
    },
    {
      stat: "APG",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.apg : 0,
      playerTwo: selectedRightPlayer ? selectedRightPlayer.stats.apg : 0,
    },
    {
      stat: "FG%",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.fgPercent : 0,
      playerTwo: selectedRightPlayer ? selectedRightPlayer.stats.fgPercent : 0,
    },
    {
      stat: "3PT%",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.threePercent : 0,
      playerTwo: selectedRightPlayer
        ? selectedRightPlayer.stats.threePercent
        : 0,
    },
    {
      stat: "FT%",
      playerOne: selectedLeftPlayer ? selectedLeftPlayer.stats.ftPercent : 0,
      playerTwo: selectedRightPlayer ? selectedRightPlayer.stats.ftPercent : 0,
    },
  ];

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative flex min-h-screen items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
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
              </button>

              {isLeftDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-40 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
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

        <div className="absolute left-1/2 top-1/2 z-10 flex h-114 w-130 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
          <svg viewBox="0 0 300 300" className="h-full w-full">
            {/* outer radar shape */}
            <polygon
              points="150,25 258,88 258,212 150,275 42,212 42,88"
              fill="none"
              stroke="#347A99"
              strokeWidth="2"
            />

            {/* middle radar shape */}
            <polygon
              points="150,65 223,108 223,192 150,235 77,192 77,108"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />

            {/* inner radar shape */}
            <polygon
              points="150,105 188,128 188,172 150,195 112,172 112,128"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />

            {/* axis lines */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="25"
              stroke="rgba(255,255,255,0.25)"
            />
            <line
              x1="150"
              y1="150"
              x2="258"
              y2="88"
              stroke="rgba(255,255,255,0.25)"
            />
            <line
              x1="150"
              y1="150"
              x2="258"
              y2="212"
              stroke="rgba(255,255,255,0.25)"
            />
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="275"
              stroke="rgba(255,255,255,0.25)"
            />
            <line
              x1="150"
              y1="150"
              x2="42"
              y2="212"
              stroke="rgba(255,255,255,0.25)"
            />
            <line
              x1="150"
              y1="150"
              x2="42"
              y2="88"
              stroke="rgba(255,255,255,0.25)"
            />

            {/* stat labels */}
            <text
              x="150"
              y="16"
              textAnchor="middle"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              PPG
            </text>
            <text
              x="270"
              y="88"
              textAnchor="start"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              RPG
            </text>
            <text
              x="270"
              y="216"
              textAnchor="start"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              APG
            </text>
            <text
              x="150"
              y="295"
              textAnchor="middle"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              FG%
            </text>
            <text
              x="30"
              y="216"
              textAnchor="end"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              3PT%
            </text>
            <text
              x="30"
              y="88"
              textAnchor="end"
              className="fill-white text-[10px] font-michroma font-bold"
            >
              FT%
            </text>
          </svg>
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
              </button>

              {isRightDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-40 w-full overflow-y-auto rounded-md border border-white/30 bg-black/30 py-2 text-sm text-white shadow-xl">
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
