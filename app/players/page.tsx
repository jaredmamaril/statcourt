"use client";

import {
  players,
  positions,
  teams,
  teamColors,
  teamLogos,
  sortOptions,
} from "../components/court-data";
import type {
  SortValue,
  Team,
  Position,
  SortDirection,
} from "../components/court-data";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Players() {
  // State for filters and dropdowns
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filteredTeam, setFilteredTeam] = useState<Team | "">("");
  const [filteredPosition, setFilteredPosition] = useState<Position | "">("");
  const [sortBy, setSortBy] = useState<SortValue>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("primary");
  const [openDropdown, setOpenDropdown] = useState<
    "team" | "position" | "sort" | null
  >(null);

  // Filter and sort players based on search input, favorites toggle, team and position filters, and sorting options
  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(playerSearch.toLowerCase());
      const matchesFavorites = showFavorites
        ? favorites.includes(player.name)
        : true;
      const matchesTeam = filteredTeam ? player.team === filteredTeam : true;
      const matchesPosition = filteredPosition
        ? player.position === filteredPosition
        : true;

      return (
        matchesSearch && matchesFavorites && matchesTeam && matchesPosition
      );
    })
    // Sort players based on selected sorting option and direction
    .sort((a, b) => {
      if (!sortBy) return 0;

      let result = 0;
      // For name sorting, split the name into first and last to allow sorting by either, while for stat sorting, compare the relevant stat values directly.
      const aSpaceIndex = a.name.indexOf(" ");
      const aFirstName = a.name.slice(0, aSpaceIndex);
      const aLastName = a.name.slice(aSpaceIndex + 1);
      const bSpaceIndex = b.name.indexOf(" ");
      const bFirstName = b.name.slice(0, bSpaceIndex);
      const bLastName = b.name.slice(bSpaceIndex + 1);
      if (sortBy === "first-name")
        result = aFirstName.localeCompare(bFirstName);
      if (sortBy === "last-name") result = aLastName.localeCompare(bLastName);
      if (sortBy === "ppg") result = b.stats.ppg - a.stats.ppg;
      if (sortBy === "rpg") result = b.stats.rpg - a.stats.rpg;
      if (sortBy === "apg") result = b.stats.apg - a.stats.apg;
      if (sortBy === "fgPercent")
        result = b.stats.fgPercent - a.stats.fgPercent;
      if (sortBy === "threePercent")
        result = b.stats.threePercent - a.stats.threePercent;
      if (sortBy === "ftPercent")
        result = b.stats.ftPercent - a.stats.ftPercent;

      // If sort direction is reverse, invert the result
      return sortDirection === "primary" ? result : -result;
    });

  // Get selected player for player card display
  const selectedPlayer = players.find(
    (player) => player.name === currentPlayer,
  );

  // Function to toggle a player as a favorite, adding them to the favorites list if they're not already in it or removing them if they are
  const toggleFavorite = (playerName: string) => {
    setFavorites((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName],
    );
  };

  // Function to close dropdown when clicking outside
  function handleSortClick(sortValue: SortValue) {
    if (sortValue === "") {
      setSortBy("");
      setSortDirection("primary");
      return;
    }

    if (sortBy === sortValue) {
      setSortDirection(sortDirection === "primary" ? "reverse" : "primary");
    } else {
      setSortBy(sortValue);
      setSortDirection("primary");
    }
  }

  // Get label for currently selected sort option
  const selectedSortOption = sortOptions.find(
    (option) => option.value === sortBy,
  );

  // Determine if any filters are active to show reset button
  const hasActiveFilters =
    playerSearch || showFavorites || filteredTeam || filteredPosition || sortBy;
  // Function to reset all filters and put sorting options to default setting when button is clicked
  function resetAllFilters() {
    setPlayerSearch("");
    setShowFavorites(false);
    setFilteredTeam("");
    setFilteredPosition("");
    setSortBy("");
    setSortDirection("primary");
    setOpenDropdown(null);
  }

  // Close dropdown when clicking outside
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Node)) {
        return;
      }
      const target = event.target;
      if (filtersRef.current && !filtersRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden text-white overflow-y-auto">
      <section className="min-h-screen container mx-auto px-6 pt-10 pb-12 flex flex-col items-center relative">
        {/* Wrapper that slides everything */}
        <div
          className={`flex flex-col items-center transition-transform duration-2000 ease-out ${
            currentPlayer ? "translate-x-[-75%] opacity-10" : "translate-x-0"
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
              className="w-full sm:w-64 rounded-md border border-white/30 bg-black/40 px-4 py-2 text-white/80 placeholder:text-[#2da6c4]/80 font-michroma text-sm outline-none focus:border-white text-center"
            />
          </div>

          <p className="font-michroma text-sm font-medium tracking-wider text-white/80 mb-2">
            {" "}
            Filters
          </p>

          {/* Filter buttons row */}
          <div
            ref={filtersRef}
            className="flex flex-wrap items-center justify-center gap-2 mb-4"
          >
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
                onClick={() =>
                  setOpenDropdown(openDropdown === "team" ? null : "team")
                }
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
                  filteredTeam
                    ? "bg-[#1bc2ec]/10"
                    : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
                }`}
                style={{
                  color: filteredTeam ? teamColors[filteredTeam] : undefined,
                  borderColor: filteredTeam
                    ? teamColors[filteredTeam]
                    : undefined,
                }}
              >
                {filteredTeam && (
                  <Image
                    src={teamLogos[filteredTeam]}
                    alt={`${filteredTeam} logo`}
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                )}
                <span>{filteredTeam ? filteredTeam : "All Teams"}</span>
                <span className="text-[#1bc2ec]">▾</span>
              </button>

              {openDropdown === "team" && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFilteredTeam("");
                      setOpenDropdown(null);
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
                        setOpenDropdown(null);
                      }}
                      className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                        filteredTeam === team
                          ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Position filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "position" ? null : "position",
                  )
                }
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
                  filteredPosition
                    ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
                    : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
                }`}
              >
                <span>
                  {filteredPosition ? filteredPosition : "All Positions"}
                </span>
                <span className="text-[#1bc2ec]">▾</span>
              </button>

              {openDropdown === "position" && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFilteredPosition("");
                      setOpenDropdown(null);
                    }}
                    className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
                  >
                    All Positions
                  </button>

                  {positions.map((position) => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => {
                        setFilteredPosition(position);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                        filteredPosition === position
                          ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort by ... */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "sort" ? null : "sort")
                }
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
                  sortBy
                    ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
                    : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
                }`}
              >
                <span>
                  Sort: {selectedSortOption ? selectedSortOption.label : "None"}{" "}
                  {sortBy &&
                    (sortBy === "first-name" || sortBy === "last-name"
                      ? sortDirection === "primary"
                        ? "A-Z"
                        : "Z-A"
                      : sortDirection === "primary"
                        ? "Hi-Lo"
                        : "Lo-Hi")}
                </span>
                <span className="text-[#1bc2ec]">▾</span>
              </button>

              {openDropdown === "sort" && (
                <div className="absolute left-0 top-full z-30 mt-2 max-h-52 w-44 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleSortClick(option.value);
                        setOpenDropdown(null);
                      }}
                      className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                        sortBy === option.value
                          ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="cursor-pointer rounded-md border border-white/20 bg-black/10 px-2 py-1 font-michroma text-xs text-white/60 transition-all duration-200 hover:border-red-700/60 hover:text-red-700"
              >
                Reset Filters
              </button>
            )}
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
                const teamColor = teamColors[player.team];
                const selectedStatValue =
                  sortBy && sortBy !== "first-name" && sortBy !== "last-name"
                    ? player.stats[sortBy]
                    : null;
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
                      className="flex min-w-0 flex-1 cursor-pointer px-1 py-3.5 text-left font-michroma text-xs"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{player.name}</span>
                        <span className="mt-1 flex items-center gap-1.5">
                          <span
                            className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/80"
                            style={{
                              backgroundColor: teamColor,
                              borderColor: teamColor,
                            }}
                          >
                            {player.team}
                          </span>
                          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                            {player.position}
                          </span>
                          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                            #{player.jerseyNumber}
                          </span>
                          {/* Show value of currently selected sorting stat */}
                          {selectedStatValue !== null && (
                            <span className="shrink-0 rounded border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-1.5 py-0.5 text-10px text-[#1bc2ec]">
                              {selectedStatValue}{" "}
                              {sortBy === "fgPercent" ||
                              sortBy === "threePercent" ||
                              sortBy === "ftPercent"
                                ? "%"
                                : ""}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Player card section */}
        {selectedPlayer && (
          <div
            key={selectedPlayer.id}
            className="absolute right-8 top-10 w-175 rounded-md border border-[#1bc2ec]/10 bg-black-30 p-4 font-michroma text-white animate-[cardIn_2000ms_ease-out]"
          >
            <Image
              src={selectedPlayer.image}
              alt={selectedPlayer.name}
              width={144}
              height={144}
              className="mx-auto h-52 w-52 rounded-md object-cover"
            />
          </div>
        )}
      </section>
    </main>
  );
}
