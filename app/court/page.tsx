"use client";

import Image from "next/image";
import { useState } from "react";

export default function Court() {
  const players = [
    {
      value: "lebron-james",
      label: "LeBron James",
      image: "/temp-players/lebron-james.png",
    },
    {
      value: "michael-jordan",
      label: "Michael Jordan",
      image: "/temp-players/michael-jordan.jpg",
    },
    {
      value: "kobe-bryant",
      label: "Kobe Bryant",
      image: "/temp-players/kobe-bryant.jpg",
    },
    {
      value: "stephen-curry",
      label: "Stephen Curry",
      image: "/temp-players/stephen-curry.png",
    },
  ];

  const [leftPlayer, setLeftPlayer] = useState("");
  const selectedLeftPlayer = players.find(
    (player) => player.value === leftPlayer,
  );
  const [rightPlayer, setRightPlayer] = useState("");
  const selectedRightPlayer = players.find(
    (player) => player.value === rightPlayer,
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative flex min-h-screen items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="absolute left-0 top-0 z-10 flex h-full w-1/2 justify-start pl-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl text-white font-bold">
              CHOOSE YOUR PLAYER
            </h1>

            <div className="mt-6 flex h-56 w-56 items-center justify-center rounded-md border border-white/30 bg-black/30 text-sm text-white/60 backdrop-blur-sm ">
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

            <select
              value={leftPlayer}
              onChange={(e) => setLeftPlayer(e.target.value)}
              className="mt-8 w-56 rounded-md border border-white/30 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm"
            >
              <option value=""> Choose Player</option>
              {players.map((player) => (
                <option key={player.value} value={player.value}>
                  {player.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="absolute right-0 top-0 z-10 flex h-full w-1/2 justify-end pr-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl font-bold text-white">
              CHOOSE YOUR PLAYER
            </h1>

            <div className="mt-6 flex h-56 w-56 items-center justify-center rounded-md border border-white/30 bg-black/30 text-sm text-white/60 backdrop-blur-sm ">
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

            <select
              value={rightPlayer}
              onChange={(e) => setRightPlayer(e.target.value)}
              className="mt-8 w-56 rounded-md border border-white/30 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm"
            >
              <option value=""> Choose Player</option>
              {players.map((player) => (
                <option key={player.value} value={player.value}>
                  {player.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </main>
  );
}
