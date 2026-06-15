"use client";

import {
  players,
  positions,
  teams,
  teamColors,
  teamLogos,
  sortOptions,
  normalizeStat,
  statMaxValues,
  getPlayerInsights,
  getSimilarPlayers,
} from "../components/court-data";
import type {
  SortValue,
  Team,
  Position,
  SortDirection,
  PlayerInsightDisplay,
  CompareSlots,
} from "../components/court-data";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import PlayerImage from "../components/player-image";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  // State for front face and back face of card
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const searchParams = useSearchParams();

  // Open a player card when coming from rankings with /players?player=name
  useEffect(() => {
    const playerFromUrl = searchParams.get("player");

    if (!playerFromUrl) return;

    const matchingPlayer = players.find(
      (player) => player.name === playerFromUrl,
    );

    if (!matchingPlayer) return;

    const timer = window.setTimeout(() => {
      setCurrentPlayer(matchingPlayer.name);
      setIsCardFlipped(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

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

  // Get player insights of selected player
  const playerInsights = selectedPlayer
    ? getPlayerInsights(selectedPlayer)
    : null;

  // Get trait rarity
  function getInsightRarityStyles(insight: PlayerInsightDisplay) {
    if (insight.rarity === "gold") {
      return {
        borderColor: "#EFBF04",
        backgroundColor: "#EFBF0499",
        color: "#FFE88A",
      };
    }

    if (insight.rarity === "purple") {
      return {
        borderColor: "#A855F7",
        backgroundColor: "#A855F766",
        color: "#E9D5FF",
      };
    }

    if (insight.rarity === "blue") {
      return {
        borderColor: "#38BDF8",
        backgroundColor: "#38BDF866",
        color: "#E0F2FE",
      };
    }

    if (insight.rarity === "red") {
      return {
        borderColor: "#EF4444",
        backgroundColor: "#EF444455",
        color: "#FECACA",
      };
    }

    return {
      borderColor: "#94A3B8",
      backgroundColor: "#94A3B840",
      color: "#E2E8F0",
    };
  }

  // Use rarities as labels
  function getInsightRarityLabel(rarity: PlayerInsightDisplay["rarity"]) {
    if (rarity === "gold") return "Generational";
    if (rarity === "purple") return "Historic";
    if (rarity === "blue") return "Elite";
    if (rarity === "red") return "Weakness";
    return "Basic";
  }

  // Get players similar to current player
  const similarPlayers = selectedPlayer
    ? getSimilarPlayers(selectedPlayer)
    : [];

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

  // Router to travel to court page
  const router = useRouter();

  // Current players being compared on court
  function getSavedCompareSlots(): CompareSlots {
    if (typeof window === "undefined") return { left: "", right: "" };

    const savedSlots = localStorage.getItem("statcourt-compare-slots");

    if (!savedSlots) return { left: "", right: "" };

    return JSON.parse(savedSlots) as CompareSlots;
  }

  // State for player being sent to court page
  const [isGoingToCourt, setIsGoingToCourt] = useState(false);
  // State of who is currently being compared
  const [compareSlots, setCompareSlots] =
    useState<CompareSlots>(getSavedCompareSlots);
  function addPlayerToCompare(slot: "left" | "right") {
    if (!selectedPlayer) return;

    const nextSlots = {
      ...compareSlots,
      [slot]: selectedPlayer.name,
    };

    setCompareSlots(nextSlots);
    localStorage.setItem("statcourt-compare-slots", JSON.stringify(nextSlots));

    setIsGoingToCourt(true);

    setTimeout(() => {
      router.push("/court");
    }, 450);
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="relative mx-auto w-full max-w-6xl px-6 pt-4 pb-12">
        <div
          className={
            selectedPlayer
              ? "relative grid h-full min-h-0 w-full gap-10 lg:grid-cols-[46%_1fr]"
              : "relative mx-auto h-full min-h-0 w-full max-w-3xl"
          }
        >
          {/* Wrapper that contains the left controls */}
          <div
            className={
              selectedPlayer
                ? "relative flex h-full w-full flex-col transition-all duration-500 ease-out opacity-10 lg:-translate-x-5"
                : "relative flex h-full w-full flex-col transition-all duration-500 ease-out opacity-100 translate-x-0"
            }
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
                placeholder="Search For a Player..."
                className="w-full sm:w-64 rounded-md border border-white/30 bg-black/40 px-4 py-2 text-white/80 placeholder:text-white/35 font-michroma text-sm outline-none focus:border-white text-center"
              />
            </div>
            <div className="flex items-center justify-center">
              <p className="font-michroma text-sm font-medium tracking-wider text-white/80 mb-2">
                {" "}
                Filters
              </p>
            </div>

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
                        style={{ color: teamColors[team] }}
                      >
                        <span className="flex items-center gap-2">
                          <Image
                            src={teamLogos[team]}
                            alt={`${team} logo`}
                            width={16}
                            height={16}
                            className="h-4 w-4 object-contain"
                          />
                          <span>{team}</span>
                        </span>
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
                    Sort:{" "}
                    {selectedSortOption ? selectedSortOption.label : "None"}{" "}
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
            <div className="player-list-scroll max-h-[450px] overflow-y-auto pr-2">
              <div className="mx-auto flex w-full max-w-100 flex-col gap-1">
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
                      sortBy &&
                      sortBy !== "first-name" &&
                      sortBy !== "last-name"
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
                            setIsCardFlipped(false);
                          }}
                          className="flex min-w-0 flex-1 cursor-pointer px-1 py-3.5 text-left font-michroma text-xs"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {player.name}
                            </span>
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
          </div>

          <div className="flex items-start justify-center">
            {/* Player card section */}
            {selectedPlayer && (
              <div className="flex flex-col items-start gap-2 w-full max-w-md">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPlayer("");
                    setIsCardFlipped(false);
                  }}
                  className="flex items-center gap-1 font-michroma text-xs text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  ← Back
                </button>

                <div
                  key={selectedPlayer.id}
                  className={`relative w-full max-w-md min-h-134 overflow-hidden rounded-3xl animate-[cardIn_500ms_ease-out] transition-all duration-500 ${
                    isGoingToCourt
                      ? "scale-90 translate-y-20 opacity-0"
                      : "scale-100 translate-y-0 opacity-100"
                  }`}
                  style={{ perspective: "1000px" }}
                  onClick={(e) => {
                    if (
                      e.target instanceof HTMLElement &&
                      e.target.closest("button")
                    ) {
                      return;
                    }

                    setIsCardFlipped((prev) => !prev);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.target instanceof HTMLElement &&
                      e.target.closest("button")
                    ) {
                      return;
                    }

                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsCardFlipped((prev) => !prev);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${selectedPlayer.name} player card — click to flip`}
                >
                  {/* Rotating container */}
                  <div
                    className="relative w-full min-h-134"
                    style={{
                      transformStyle: "preserve-3d",
                      transition: "transform 0.5s ease-out",
                      transform: isCardFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                  >
                    {/* Front face */}
                    <div
                      className={`absolute inset-0 min-h-134 border border-[#1bc2ec]/10 bg-black/30 p-6 rounded-3xl ${
                        isCardFlipped
                          ? "pointer-events-none"
                          : "pointer-events-auto"
                      }`}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Team-colored card border */}
                      <svg
                        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          {/* Mask */}
                          <mask id={`team-frame-mask-${selectedPlayer.id}`}>
                            <rect width="100" height="100" fill="white" />
                            <polygon
                              points="8,8 82,8 92,18 92,92 18,92 8,82"
                              fill="black"
                            />
                          </mask>
                        </defs>

                        {/* Base team color frame */}
                        <rect
                          x="0"
                          y="0"
                          width="100"
                          height="100"
                          fill={teamColors[selectedPlayer.team]}
                          mask={`url(#team-frame-mask-${selectedPlayer.id})`}
                        />

                        {/* Inner white trim */}
                        <polygon
                          points="8,8 82,8 92,18 92,92 18,92 8,82"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      {/* Card background (court) */}
                      <div className="absolute -inset-30 z-10 transform rotate-90 opacity-50">
                        <Image
                          src={"/court.svg"}
                          alt={"Court background"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      {/* Jersey number and position - top right corner */}
                      <div
                        className="absolute top-18 right-14 z-30"
                        style={{ color: teamColors[selectedPlayer.team] }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-bold font-michroma opacity-70">
                            #{selectedPlayer.jerseyNumber}
                          </span>
                          <span className="text-white text-2xl font-bold font-michroma opacity-70">
                            {selectedPlayer.position}
                          </span>
                        </div>
                      </div>

                      {/* Team logo - top left corner */}
                      <div className="absolute top-18 left-12 z-30 opacity-70">
                        <Image
                          src={teamLogos[selectedPlayer.team]}
                          alt={`${selectedPlayer.team} logo`}
                          width={32}
                          height={32}
                          className="h-20 w-20 object-contain"
                        />
                      </div>

                      {/* Player image */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center -top-18">
                        <PlayerImage
                          src={selectedPlayer.image}
                          alt={selectedPlayer.name}
                          width={144}
                          height={144}
                          className="h-84 w-84 rounded-md object-cover"
                        />
                      </div>

                      {/* Player name */}
                      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-center px-6 text-center">
                        <span className="py-11 text-xl font-bold font-michroma uppercase text-white tracking-wide wrap-break-word w-full">
                          {selectedPlayer.name}
                        </span>
                      </div>
                    </div>

                    {/* Back face */}
                    <div
                      className={`absolute inset-0 min-h-134 rounded-3xl border bg-black/30 ${
                        isCardFlipped
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderColor: teamColors[selectedPlayer.team],
                      }}
                    >
                      {/* Card background (court) */}
                      <div className="absolute -inset-1 z-0 opacity-50">
                        <Image
                          src={"/court-pattern.svg"}
                          alt={"Court background"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2 font-michroma uppercase pt-1">
                        {/* Player headshot */}
                        <PlayerImage
                          src={selectedPlayer.image}
                          alt={selectedPlayer.name}
                          width={96}
                          height={96}
                          className="rounded-md object-contain z-10"
                        />
                        {/* Player info */}
                        <span className="font-bold z-10">
                          {selectedPlayer.name}
                        </span>
                        <span className="text-xs opacity-80 z-10">
                          {selectedPlayer.position} • {selectedPlayer.team} • #
                          {selectedPlayer.jerseyNumber}
                        </span>
                      </div>

                      {/* Player stats radar chart */}
                      {isCardFlipped && (
                        <div className="relative z-10 w-full h-48 mt-2">
                          {/* Left side stats — FG%, 3PT%, FT% */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-around py-2 z-10 ml-6">
                            <div className="flex flex-col items-start">
                              <span className="font-michroma text-[10px] text-white">
                                FG%
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.fgPercent}
                              </span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-michroma text-[10px] text-white">
                                3PT%
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.threePercent}
                              </span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-michroma text-[10px] text-white">
                                FT%
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.ftPercent}
                              </span>
                            </div>
                          </div>

                          {/* Right side stats — PPG, RPG, APG */}
                          <div className="absolute right-0 top-0 h-full flex flex-col justify-around py-2 z-10 mr-6">
                            <div className="flex flex-col items-end">
                              <span className="font-michroma text-[10px] text-white">
                                PPG
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.ppg}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-michroma text-[10px] text-white">
                                RPG
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.rpg}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-michroma text-[10px] text-white">
                                APG
                              </span>
                              <span
                                className="font-michroma text-xs font-bold"
                                style={{
                                  color: teamColors[selectedPlayer.team],
                                }}
                              >
                                {selectedPlayer.stats.apg}
                              </span>
                            </div>
                          </div>

                          {/* Radar chart */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={[
                                {
                                  stat: "PPG",
                                  value: normalizeStat(
                                    selectedPlayer.stats.ppg,
                                    statMaxValues.ppg,
                                  ),
                                },
                                {
                                  stat: "RPG",
                                  value: normalizeStat(
                                    selectedPlayer.stats.rpg,
                                    statMaxValues.rpg,
                                  ),
                                },
                                {
                                  stat: "APG",
                                  value: normalizeStat(
                                    selectedPlayer.stats.apg,
                                    statMaxValues.apg,
                                  ),
                                },
                                {
                                  stat: "FG%",
                                  value: normalizeStat(
                                    selectedPlayer.stats.fgPercent,
                                    statMaxValues.fgPercent,
                                  ),
                                },
                                {
                                  stat: "3PT%",
                                  value: normalizeStat(
                                    selectedPlayer.stats.threePercent,
                                    statMaxValues.threePercent,
                                  ),
                                },
                                {
                                  stat: "FT%",
                                  value: normalizeStat(
                                    selectedPlayer.stats.ftPercent,
                                    statMaxValues.ftPercent,
                                  ),
                                },
                              ]}
                            >
                              <PolarGrid stroke="rgba(255,255,255,0.2)" />
                              <PolarAngleAxis
                                dataKey="stat"
                                tick={{
                                  fill: "white",
                                  fontSize: 10,
                                  fontFamily: "Michroma",
                                }}
                              />
                              <PolarRadiusAxis
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                              />
                              <Radar
                                dataKey="value"
                                stroke={teamColors[selectedPlayer.team]}
                                strokeWidth={2}
                                fill={teamColors[selectedPlayer.team]}
                                fillOpacity={0.2}
                                isAnimationActive={true}
                                animationBegin={500}
                                animationDuration={900}
                                animationEasing="ease-out"
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <div className="mt-2 flex items-start justify-center gap-10">
                        {/* Insights */}
                        {playerInsights && (
                          <div className="flex w-fit flex-col items-center gap-1">
                            <span className="font-michroma text-[14px] uppercase tracking-wide text-white">
                              Insights
                            </span>

                            <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
                              Archetype
                            </span>
                            {/* Player archetype */}
                            {playerInsights.archetype && (
                              <div className="group relative z-100 w-fit">
                                <div
                                  className="w-fit rounded border px-2 py-1 font-michroma text-[10px] font-bold uppercase tracking-wide ml-2 text-center"
                                  style={{
                                    ...getInsightRarityStyles(
                                      playerInsights.archetype,
                                    ),
                                  }}
                                >
                                  {playerInsights.archetype.label}
                                </div>

                                <div className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <p className="font-michroma text-[10px] font-bold text-white/80">
                                    {playerInsights.archetype.label}
                                  </p>
                                  <p className="mt-1 font-michroma text-[9px] text-white/60">
                                    Tier:{" "}
                                    {getInsightRarityLabel(
                                      playerInsights.archetype.rarity,
                                    )}
                                  </p>
                                  <p className="mt-1 font-michroma text-[9px] text-white/80">
                                    {playerInsights.archetype.description}
                                  </p>
                                </div>
                              </div>
                            )}

                            <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
                              Traits
                            </span>
                            {/* Player traits */}
                            <div className="flex flex-col items-center gap-1">
                              {playerInsights.traits.map((trait) => (
                                <span
                                  key={trait.label}
                                  className="group relative z-90 w-fit hover:z-300"
                                >
                                  <span
                                    className="block w-fit rounded border px-1.5 py-0.5 font-michroma text-[10px]"
                                    style={{
                                      ...getInsightRarityStyles(trait),
                                    }}
                                  >
                                    {trait.label}
                                  </span>

                                  <span className="pointer-events-none absolute top-full left-1/2 z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <span className="block font-michroma text-[10px] font-bold text-white/80">
                                      {trait.label}
                                    </span>
                                    <span className="mt-1 block font-michroma text-[9px] text-white/60">
                                      Tier:{" "}
                                      {getInsightRarityLabel(trait.rarity)}
                                    </span>
                                    <span className="mt-1 block font-michroma text-[9px] text-white/80">
                                      {trait.description}
                                    </span>
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Similar To */}
                        <div className="relative z-30 flex w-fit flex-col items-center gap-1">
                          <span className="font-michroma text-[14px] uppercase tracking-wide text-white/50">
                            Similar To
                          </span>
                          <span className="font-michroma text-[6px] text-white/50 -mt-1">
                            by Career Statistical Match
                          </span>

                          <div className="flex flex-col items-center gap-1">
                            {similarPlayers.map(({ player, matchScore }) => (
                              <button
                                key={player.id}
                                type="button"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPlayer(player.name);
                                  setIsCardFlipped(false);
                                }}
                                className="flex w-44 cursor-pointer items-center justify-between gap-3 rounded border px-2 py-1 font-michroma text-[10px] text-white/70 transition-all duration-150 hover:brightness-150 mr-2"
                                style={{
                                  borderColor: `${teamColors[player.team]}`,
                                  backgroundColor: `${teamColors[player.team]}80`,
                                }}
                              >
                                <span className="min-w-0 flex-1 truncate text-left text-white">
                                  {player.name}
                                </span>
                                <span className="shrink-0 text-white/60">
                                  {matchScore}%
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Send to court page to compare with other player(s) button */}
                      <div
                        className="group absolute bottom-4 left-1/2 z-200 w-88 -translate-x-1/2"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="w-full cursor-pointer rounded-md border bg-black/60 px-4 py-2 font-michroma text-lg uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:brightness-250"
                          style={{
                            borderColor: teamColors[selectedPlayer.team],
                          }}
                        >
                          Add to Compare
                        </button>

                        <div className="pointer-events-none absolute bottom-full left-1/2 z-210 w-full -translate-x-1/2 rounded-md border border-white/20 bg-black/90 p-3 opacity-0 transition-opacity duration-200 after:absolute after:left-0 after:top-full after:h-3 after:w-full after:content-[''] group-hover:pointer-events-auto group-hover:opacity-100">
                          <p className="mb-2 text-center font-michroma text-[10px] uppercase text-white/60">
                            Replace on Court
                          </p>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addPlayerToCompare("left");
                              }}
                              className="cursor-pointer rounded border border-white/20 px-3 py-2 text-left font-michroma text-[10px] text-white/80 transition hover:bg-white/10"
                            >
                              Left: {compareSlots.left || "Empty"}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addPlayerToCompare("right");
                              }}
                              className="cursor-pointer rounded border border-white/20 px-3 py-2 text-left font-michroma text-[10px] text-white/80 transition hover:bg-white/10"
                            >
                              Right: {compareSlots.right || "Empty"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
