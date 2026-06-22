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
import { getPlayerHeadshot } from "../components/player-images";
import { getPlayerRating } from "../components/player-ratings";
import {
  PlayerCardBackHeader,
  PlayerCardFront,
  PlayerCardInsights,
  PlayerCardRadar,
} from "../components/player-card";
import {
  DatabaseSnapshot,
  FeaturedPlayerPanel,
  RecentlyScouted,
} from "../components/player-side-panels";
import type {
  SortValue,
  Team,
  Position,
  SortDirection,
  PlayerInsightDisplay,
  CompareSlots,
} from "../components/court-data";
import Image from "next/image";
import PlayerImage from "../components/player-image";
import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlayersPage() {
  return (
    <Suspense fallback={null}>
      <Players />
    </Suspense>
  );
}
function Players() {
  const [featuredPlayer, setFeaturedPlayer] = useState<
    (typeof players)[number] | null
  >(null);

  const featuredPlayerInsights = featuredPlayer
    ? getPlayerInsights(featuredPlayer)
    : null;

  useEffect(() => {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    setFeaturedPlayer(randomPlayer);
  }, []);

  const positionBreakdown = positions.reduce(
    (counts, position) => {
      counts[position] = players.filter(
        (player) => player.position === position,
      ).length;
      return counts;
    },
    {} as Record<Position, number>,
  );
  const archetypeDistribution = players.reduce(
    (counts, player) => {
      const archetype = getPlayerInsights(player).archetype;

      const label = archetype?.label ?? "Unclassified";
      const rarity = archetype?.rarity ?? "gray";

      if (!counts[label]) {
        counts[label] = {
          count: 0,
          rarity,
        };
      }

      counts[label].count += 1;

      return counts;
    },
    {} as Record<
      string,
      {
        count: number;
        rarity: PlayerInsightDisplay["rarity"];
      }
    >,
  );

  const topArchetypeDistribution = Object.entries(archetypeDistribution)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4);

  const [recentlyViewedPlayers, setRecentlyViewedPlayers] = useState<string[]>(
    [],
  );

  useEffect(() => {
    const savedRecentPlayers = localStorage.getItem("statcourt-recent-players");

    if (!savedRecentPlayers) return;

    setRecentlyViewedPlayers(JSON.parse(savedRecentPlayers) as string[]);
  }, []);

  function addRecentlyViewedPlayer(playerName: string) {
    setRecentlyViewedPlayers((currentRecentPlayers) => {
      const nextRecentPlayers = [
        playerName,
        ...currentRecentPlayers.filter((name) => name !== playerName),
      ].slice(0, 6);

      localStorage.setItem(
        "statcourt-recent-players",
        JSON.stringify(nextRecentPlayers),
      );

      return nextRecentPlayers;
    });
  }

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
  const router = useRouter();

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
      addRecentlyViewedPlayer(matchingPlayer.name);
      setIsCardFlipped(false);

      router.replace("/players", { scroll: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams, router]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!selectedPlayer) return;

      if (!(event.target instanceof Node)) return;

      if (
        playerCardRef.current &&
        !playerCardRef.current.contains(event.target)
      ) {
        setCurrentPlayer("");
        setIsCardFlipped(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedPlayer]);

  function getPlayerNameTextClass(name: string) {
    if (name.length >= 20) {
      return "max-w-72 text-[18px] leading-tight whitespace-normal";
    }

    if (name.length >= 16) {
      return "max-w-80 text-[22px] leading-tight whitespace-normal";
    }

    if (name.length >= 15) {
      return "max-w-80 text-[24px] leading-tight whitespace-normal";
    }

    if (name.length >= 12) {
      return "max-w-80 text-[26px] leading-tight whitespace-normal";
    }

    return "max-w-88 text-2xl leading-none whitespace-nowrap";
  }

  // Get player insights of selected player
  const playerInsights = selectedPlayer
    ? getPlayerInsights(selectedPlayer)
    : null;

  // Get trait rarity
  function getInsightRarityStyles(
    insight: PlayerInsightDisplay,
    isArchetype = false,
  ) {
    const backgroundOpacity = isArchetype ? "99" : "33";

    if (insight.rarity === "gold") {
      return {
        borderColor: "#EFBF04",
        backgroundColor: `#EFBF04${backgroundOpacity}`,
        color: "#FFE88A",
      };
    }

    if (insight.rarity === "purple") {
      return {
        borderColor: "#A855F7",
        backgroundColor: `#A855F7${backgroundOpacity}`,
        color: "#E9D5FF",
      };
    }

    if (insight.rarity === "blue") {
      return {
        borderColor: "#38BDF8",
        backgroundColor: `#38BDF8${backgroundOpacity}`,
        color: "#E0F2FE",
      };
    }

    if (insight.rarity === "red") {
      return {
        borderColor: "#EF4444",
        backgroundColor: `#EF4444${backgroundOpacity}`,
        color: "#FECACA",
      };
    }

    return {
      borderColor: "#94A3B8",
      backgroundColor: `#94A3B8${backgroundOpacity}`,
      color: "#E2E8F0",
    };
  }

  function getRarityColor(rarity: PlayerInsightDisplay["rarity"]) {
    if (rarity === "gold") return "#EFBF04";
    if (rarity === "purple") return "#A855F7";
    if (rarity === "blue") return "#1bc2ec";
    if (rarity === "red") return "#EF4444";

    return "#94A3B8";
  }

  function getLineupFitStyles(fit: string) {
    let color = "#CBD5E1";

    if (fit === "Transition Attack" || fit === "Showtime Offense") {
      color = "#1bc2ec";
    }

    if (fit === "Defensive Powerhouse") {
      color = "#22C55E";
    }

    if (fit === "Spacing Superteam" || fit === "Floor Spacing Machine") {
      color = "#A855F7";
    }

    if (fit === "Offensive Superteam") {
      color = "#F97316";
    }

    if (fit === "Two-Way Dynasty") {
      color = "#EFBF04";
    }

    if (fit === "Star-Powered Contender") {
      color = "#38BDF8";
    }

    if (fit === "Paint Control Unit") {
      color = "#EF4444";
    }

    return {
      color,
      borderColor: `${color}99`,
      backgroundColor: `${color}33`,
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

  // Players similar to current player
  const similarPlayers = selectedPlayer
    ? getSimilarPlayers(selectedPlayer)
    : [];

  // Lineups the player fits with
  const bestLineupFits = selectedPlayer
    ? getBestLineupFits(selectedPlayer)
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

  // Current players being compared on court
  function getSavedCompareSlots(): CompareSlots {
    if (typeof window === "undefined") return { left: "", right: "" };

    const savedSlots = localStorage.getItem("statcourt-compare-slots");

    if (!savedSlots) return { left: "", right: "" };

    return JSON.parse(savedSlots) as CompareSlots;
  }

  const playerCardRef = useRef<HTMLDivElement>(null);

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

  const highestOverallPlayer = [...players].sort(
    (a, b) => getPlayerRating(b) - getPlayerRating(a),
  )[0];

  const mostVersatilePlayer = [...players].sort((a, b) => {
    function getVersatilityScore(player: (typeof players)[number]) {
      const ppgScore = normalizeStat(player.stats.ppg, statMaxValues.ppg);
      const rpgScore = normalizeStat(player.stats.rpg, statMaxValues.rpg);
      const apgScore = normalizeStat(player.stats.apg, statMaxValues.apg);
      const threeScore = normalizeStat(
        player.stats.threePercent,
        statMaxValues.threePercent,
      );

      return (
        ppgScore * 0.28 +
        rpgScore * 0.2 +
        apgScore * 0.25 +
        threeScore * 0.12 +
        player.defenseRating * 0.15
      );
    }

    return getVersatilityScore(b) - getVersatilityScore(a);
  })[0];

  const bestShooter = [...players].sort(
    (a, b) => b.stats.threePercent - a.stats.threePercent,
  )[0];

  const bestPlaymaker = [...players].sort(
    (a, b) => b.stats.apg - a.stats.apg,
  )[0];

  // Best lineup fit for player
  function getBestLineupFits(player: (typeof players)[number]) {
    const fits = [];

    if (player.stats.ppg >= 25 && player.stats.apg >= 5) {
      fits.push("Transition Attack");
    }

    if (player.stats.apg >= 7) {
      fits.push("Showtime Offense");
    }

    if (player.starPower >= 95) {
      fits.push("Star-Powered Contender");
    }

    if (player.stats.threePercent >= 38) {
      fits.push("Spacing Superteam");
    }

    if (player.defenseRating >= 90) {
      fits.push("Defensive Powerhouse");
    }

    if (player.stats.rpg >= 10 || player.position === "C") {
      fits.push("Paint Control Unit");
    }

    if (player.stats.ppg >= 22 && player.defenseRating >= 88) {
      fits.push("Two-Way Dynasty");
    }

    return fits.slice(0, 3);
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
            {!selectedPlayer && featuredPlayer && (
              <FeaturedPlayerPanel
                featuredPlayer={featuredPlayer}
                featuredPlayerInsights={featuredPlayerInsights}
                getInsightRarityStyles={getInsightRarityStyles}
                onViewPlayer={(playerName) => {
                  setCurrentPlayer(playerName);
                  addRecentlyViewedPlayer(playerName);
                  setIsCardFlipped(false);
                }}
              >
                <RecentlyScouted
                  recentlyViewedPlayers={recentlyViewedPlayers}
                  onViewPlayer={(playerName) => {
                    setCurrentPlayer(playerName);
                    setIsCardFlipped(false);
                    addRecentlyViewedPlayer(playerName);
                  }}
                />
              </FeaturedPlayerPanel>
            )}

            {!selectedPlayer && (
              <DatabaseSnapshot
                playersCount={players.length}
                positions={positions}
                positionBreakdown={positionBreakdown}
                topArchetypeDistribution={topArchetypeDistribution}
                highestOverallName={highestOverallPlayer.name}
                highestOverallRating={getPlayerRating(highestOverallPlayer)}
                mostVersatileName={mostVersatilePlayer.name}
                bestShooterName={bestShooter.name}
                bestPlaymakerName={bestPlaymaker.name}
                getRarityColor={getRarityColor}
              />
            )}

            {/* Header section */}
            <div className="flex flex-col items-center justify-between gap-1 mb-2">
              <h1 className="font-michroma text-2xl font-bold tracking-wide text-[#1bc2ec]">
                PICK A PLAYER
              </h1>

              <p className="max-w-xl text-center font-michroma text-xs leading-relaxed text-white/40">
                Browse player cards, filter by team or position, view
                archetypes, and send players to the comparison court.
              </p>

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
            <div className="player-list-scroll max-h-112.5 overflow-y-auto pr-2">
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
                    const playerOverall = getPlayerRating(player);
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
                            if (currentPlayer === player.name) {
                              setCurrentPlayer("");
                            } else {
                              setCurrentPlayer(player.name);
                              addRecentlyViewedPlayer(player.name);
                            }
                            setIsCardFlipped(false);
                          }}
                          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-2 py-2 text-left font-michroma text-xs"
                        >
                          <PlayerImage
                            src={getPlayerHeadshot(player)}
                            alt={player.name}
                            width={44}
                            height={44}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {player.name}
                            </span>

                            <span className="mt-1 flex items-center gap-1.5">
                              <span
                                className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/80"
                                style={{
                                  backgroundColor: teamColor,
                                  borderColor: teamColor,
                                }}
                              >
                                {player.team}
                              </span>

                              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
                                {player.position}
                              </span>

                              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
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

                          <span className="ml-auto flex w-20 shrink-0 flex-col items-end justify-center text-right">
                            <span
                              className="block leading-none font-michroma text-[13px]"
                              style={{
                                color: teamColor,
                                textShadow: `0 0 10px ${teamColor}88`,
                              }}
                            >
                              {playerOverall.toFixed(1)}
                            </span>

                            <span className="mt-1 block leading-none font-michroma text-[7px] uppercase text-white/35">
                              OVR
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
              <div
                ref={playerCardRef}
                className="flex flex-col items-start gap-2 w-full max-w-md"
              >
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
                    <PlayerCardFront
                      player={selectedPlayer}
                      isCardFlipped={isCardFlipped}
                    />

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

                      {/* Back face */}
                      <PlayerCardBackHeader
                        player={selectedPlayer}
                        getPlayerNameTextClass={getPlayerNameTextClass}
                      />

                      {/* Player stats radar chart */}
                      {isCardFlipped && (
                        <PlayerCardRadar
                          player={selectedPlayer}
                          isCardFlipped={isCardFlipped}
                        />
                      )}

                      <div className="flex items-start justify-center gap-10">
                        {/* Insights */}
                        {playerInsights && (
                          <PlayerCardInsights
                            playerInsights={playerInsights}
                            getInsightRarityStyles={getInsightRarityStyles}
                            getInsightRarityLabel={getInsightRarityLabel}
                          />
                        )}

                        {/* Similar To */}
                        <div className="relative z-30 flex w-40 flex-col items-center gap-0.5">
                          <span className="font-michroma text-[12px] uppercase tracking-wide text-white/50">
                            Similar To
                          </span>
                          <span className="-mt-1 font-michroma text-[6px] text-white/45">
                            by Career Statistical Match
                          </span>

                          <div className="mt-1 flex flex-col items-center gap-0.5 brightness-125">
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
                                className="mr-2 flex w-44 cursor-pointer items-center justify-between gap-2 rounded border px-1.5 py-0.5 font-michroma text-[9px] text-white/70 transition-all duration-150 hover:brightness-150"
                                style={{
                                  borderColor: `${teamColors[player.team]}`,
                                  backgroundColor: `${teamColors[player.team]}50`,
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

                          <div className="mt-1 flex flex-col items-center gap-0.5">
                            <span className="font-michroma text-[9px] uppercase tracking-wide text-white/50">
                              Best Lineup Fits
                            </span>

                            {bestLineupFits.map((fit) => (
                              <span
                                key={fit}
                                className="rounded border px-1.5 py-0.5 font-michroma text-[8px] brightness-125"
                                style={getLineupFitStyles(fit)}
                              >
                                ✓ {fit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Send to court page to compare with other player(s) button */}
                      <div
                        className="group absolute bottom-2 left-1/2 z-200 w-88 -translate-x-1/2"
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
