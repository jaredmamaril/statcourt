"use client";

import {
  players,
  positions,
  sortOptions,
  getPlayerInsights,
  getSimilarPlayers,
} from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import { SelectedPlayerCard } from "../components/player-card";
import { PlayerList } from "../components/player-list-panel";
import { PlayerFilters } from "../components/player-filters";
import {
  DatabaseSnapshot,
  FeaturedPlayerPanel,
  RecentlyScouted,
} from "../components/player-side-panels";
import { PlayerPageHeader } from "../components/player-page-header";
import {
  getPlayerDatabaseLeaders,
  getPositionBreakdown,
  getTopArchetypeDistribution,
} from "../components/player-page-stats";
import type {
  SortValue,
  Team,
  Position,
  SortDirection,
  PlayerInsightDisplay,
  CompareSlots,
} from "../components/court-data";
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

  const positionBreakdown = getPositionBreakdown();

  const topArchetypeDistribution = getTopArchetypeDistribution();

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
  const hasActiveFilters = Boolean(
    showFavorites || filteredTeam || filteredPosition || sortBy || playerSearch,
  );

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

  const {
    highestOverallPlayer,
    mostVersatilePlayer,
    bestShooter,
    bestPlaymaker,
  } = getPlayerDatabaseLeaders();

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
                ? "relative flex h-full w-full flex-col opacity-10 transition-all duration-500 ease-out lg:-translate-x-5 [&_button]:pointer-events-none"
                : "pointer-events-auto relative flex h-full w-full flex-col translate-x-0 opacity-100 transition-all duration-500 ease-out"
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

            {/* Search and filters heading */}
            <PlayerPageHeader
              playerSearch={playerSearch}
              onPlayerSearchChange={setPlayerSearch}
            />

            {/* Filter buttons row */}
            <PlayerFilters
              filtersRef={filtersRef}
              showFavorites={showFavorites}
              favoritesCount={favorites.length}
              filteredTeam={filteredTeam}
              filteredPosition={filteredPosition}
              sortBy={sortBy}
              sortDirection={sortDirection}
              selectedSortLabel={
                selectedSortOption ? selectedSortOption.label : "None"
              }
              openDropdown={openDropdown}
              hasActiveFilters={hasActiveFilters}
              onToggleFavorites={() => setShowFavorites(!showFavorites)}
              onOpenDropdown={setOpenDropdown}
              onSelectTeam={(team) => {
                setFilteredTeam(team);
                setOpenDropdown(null);
              }}
              onSelectPosition={(position) => {
                setFilteredPosition(position);
                setOpenDropdown(null);
              }}
              onSelectSort={(sort) => {
                handleSortClick(sort);
                setOpenDropdown(null);
              }}
              onResetFilters={resetAllFilters}
            />

            {/* Player list */}
            <PlayerList
              players={filteredPlayers}
              currentPlayer={currentPlayer}
              favorites={favorites}
              showFavorites={showFavorites}
              sortBy={sortBy}
              onToggleFavorite={toggleFavorite}
              onSelectPlayer={(playerName) => {
                if (currentPlayer === playerName) {
                  setCurrentPlayer("");
                } else {
                  setCurrentPlayer(playerName);
                  addRecentlyViewedPlayer(playerName);
                }

                setIsCardFlipped(false);
              }}
            />
          </div>

          <div className="flex items-start justify-center">
            {/* Player card section */}
            {selectedPlayer && (
              <div ref={playerCardRef} className="w-full max-w-md">
                <SelectedPlayerCard
                  player={selectedPlayer}
                  isCardFlipped={isCardFlipped}
                  isGoingToCourt={isGoingToCourt}
                  compareSlots={compareSlots}
                  playerInsights={playerInsights}
                  similarPlayers={similarPlayers}
                  bestLineupFits={bestLineupFits}
                  getPlayerNameTextClass={getPlayerNameTextClass}
                  getInsightRarityStyles={getInsightRarityStyles}
                  getInsightRarityLabel={getInsightRarityLabel}
                  getLineupFitStyles={getLineupFitStyles}
                  onBack={() => {
                    setCurrentPlayer("");
                    setIsCardFlipped(false);
                  }}
                  onToggleFlip={() => setIsCardFlipped((prev) => !prev)}
                  onSelectSimilarPlayer={(playerName) => {
                    setCurrentPlayer(playerName);
                    setIsCardFlipped(false);
                  }}
                  onAddPlayerToCompare={addPlayerToCompare}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
