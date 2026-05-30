"use client";

import { players } from "../components/court-data";
import Image from "next/image";
import { useState } from "react";

export default function Players() {
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(playerSearch.toLowerCase()),
  );

  return (
    <main className="min-h-screen overflow-hidden text-white overflow-y-auto">
      <section className="min-h-screen container mx-auto px-6 pt-10 pb-12 flex flex-col items-center relative">
        {/* Wrapper that slides everything */}
        <div
          className={`flex flex-col items-center transition-transform duration-2000 ease-out ${
            currentPlayer ? "translate-x-[-180%] blur-xs" : "translate-x-0"
          }`}
        >
          {/* Header section */}
          <div className="flex flex-col items-center justify-between gap-2 mb-2">
            <h1 className="font-michroma text-lg font-bold tracking-wide text-[#1bc2ec]">
              CHOOSE A PLAYER
            </h1>

            <input
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Search for a Player..."
              className="w-full sm:w-64 rounded-md border border-white/30 bg-black/40 px-4 py-2 text-white/80 placeholder:text-[#2da6c4]/80 font-michroma text-sm backdrop-blur-sm outline-none focus:border-white text-center"
            />
          </div>

          <p className="font-michroma text-sm font-medium tracking-wider text-white/80 mb-2">
            {" "}
            Filters
          </p>

          {/* Filter buttons row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {/* Favorites filter */}
            <button
              type="button"
              // onClick
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-michroma text-xs transition-all duration-200 ${2}`}
            >
              <span>★☆</span>
              Favorites
            </button>
          </div>

          {/* Player list */}
          <div className="flex flex-col w-full max-w-100 gap-1 max-h-[70vh] overflow-y-auto pr-2">
            {filteredPlayers.map((player) => {
              const isSelected = player.name === currentPlayer;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() =>
                    setCurrentPlayer(
                      currentPlayer === player.name ? "" : player.name,
                    )
                  }
                  className={`cursor-pointer flex items-center w-full px-4 py-4 text-left font-michroma text-xs rounded-md border transition-all duration-200
                    ${
                      isSelected
                        ? "border-[#178aa7] bg-[#1bc2ec]/10 text-[#1bc2ec]"
                        : "border-white/10 bg-black/20 text-white/90 hover:bg-white/5 hover:border-white/30"
                    }`}
                >
                  {player.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
