"use client";

import { players, teams } from "../components/court-data";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Players() {
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filteredTeam, setFilteredTeam] = useState("");
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(playerSearch.toLowerCase());
    const matchesFavorites = showFavorites
      ? favorites.includes(player.name)
      : true;
    const matchesTeam = filteredTeam ? player.team === filteredTeam : true;

    return matchesSearch && matchesFavorites && matchesTeam;
  });

  const toggleFavorite = (playerName: string) => {
    setFavorites((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName],
    );
  };

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

            {/* Search bar */}
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
              onClick={() => setShowFavorites(!showFavorites)}
              className={`cursor-pointer flex items-center gap-1.5 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
                showFavorites
                  ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]/90"
                  : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
              }`}
            >
              <span>☆</span>
              Favorites
              {favorites.length > 0 && (
                <span className="ml-0.5 text-10px opacity-70">
                  ({favorites.length})
                </span>
              )}
            </button>

            {/* Team filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-black/10 px-2 py-1 font-michroma text-xs text-white/60 transition-all duration-200 hover:border-white/60"
              >
                <span>{filteredTeam ? filteredTeam : "All Teams"}</span>
                <span className="text-[#1bc2ec]">▾</span>
              </button>

              {isTeamDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFilteredTeam("");
                      setIsTeamDropdownOpen(false);
                    }}
                    className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
                  >
                    All Teams
                  </button>

                  {teams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => {
                        setFilteredTeam(team);
                        setIsTeamDropdownOpen(false);
                      }}
                      className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player list */}
          <div className="flex flex-col w-full max-w-100 gap-1 max-h-[70vh] overflow-y-auto pr-2">
            {/* No player(s) cases */}
            {filteredPlayers.length === 0 ? (
              <p className="text-center text-white/40 font-michroma text-xs py-8">
                {showFavorites
                  ? "No favorites yet. Click ☆ to add a player."
                  : "No players found."}
              </p>
            ) : (
              /* Filter based on chosen filters */
              filteredPlayers.map((player) => {
                const isSelected = player.name === currentPlayer;
                const isFavorite = favorites.includes(player.name);
                return (
                  <div
                    key={player.id}
                    className={`flex w-full items-stretch text-left font-michroma text-xs rounded-md border transition-all duration-200 ${
                      isSelected
                        ? "border-[#178aa7] bg-[#1bc2ec]/10 text-[#1bc2ec]"
                        : "border-white/10 bg-black/20 text-white/90 hover:bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {/* Favorite star button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleFavorite(player.name);
                      }}
                      aria-label={
                        isFavorite
                          ? `Remove ${player.name} from favorites`
                          : `Add ${player.name} to favorites`
                      }
                      className={`cursor-pointer px-1.5 py-1 text-sm transition-colors duration-200 shrink-0 ${
                        isFavorite
                          ? "text-[#1bc2ec]"
                          : "text-white/20 hover:text-[#1bc2ec]/60"
                      }`}
                    >
                      {isFavorite ? "★" : "☆"}
                    </button>

                    {/* Select player button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPlayer(
                          currentPlayer === player.name ? "" : player.name,
                        );
                      }}
                      className="min-w-0 flex-1 cursor-pointer px-1 py-3.5 text-left font-michroma text-xs"
                    >
                      <span className="block truncate">{player.name}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
