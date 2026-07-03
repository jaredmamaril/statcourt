"use client";

import {
  players as fallbackPlayers,
  positions,
  getPlayerInsights,
  getSimilarPlayers,
  normalizeTeamCode,
  type Player,
} from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import type { PlayerRatingCategory } from "../components/player-ratings";
import { SelectedPlayerCard } from "../components/players/player-card";
import { PlayerList } from "../components/players/player-list";
import { PlayerFilters } from "../components/players/player-filters";
import {
  DatabaseSnapshot,
  FeaturedPlayerPanel,
  RecentlyScouted,
} from "../components/players/side-panels";
import { PlayerPageHeader } from "../components/players/player-page-header";
import {
  getPlayerDatabaseLeaders,
  getPositionBreakdown,
  getTopArchetypeDistribution,
} from "../components/players/player-page-stats";
import { getBestLineupFits } from "../components/players/player-lineup-fits";
import { getFilteredPlayers } from "../components/players/player-filtering";
import {
  addRecentPlayer,
  getSavedCompareSlots,
  getSavedRecentPlayers,
  saveCompareSlots,
  saveRecentPlayers,
} from "../components/players/player-storage";
import {
  getInsightRarityLabel,
  getInsightRarityStyles,
  getLineupFitStyles,
  getPlayerNameTextClass,
  getRarityColor,
} from "../components/players/player-style-helpers";
import type {
  SortValue,
  Team,
  Position,
  SortDirection,
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
  // URL/navigation
  const searchParams = useSearchParams();
  const router = useRouter();

  // Refs
  const filtersRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);

  // Page state
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filteredTeam, setFilteredTeam] = useState<Team | "">("");
  const [filteredPosition, setFilteredPosition] = useState<Position | "">("");
  const [filteredArchetype, setFilteredArchetype] = useState("");
  const [selectedSkill, setSelectedSkill] =
    useState<PlayerRatingCategory>("careerOverall");
  const [sortBy, setSortBy] = useState<SortValue>("careerOverall");
  const [sortDirection, setSortDirection] = useState<SortDirection>("primary");
  const [openDropdown, setOpenDropdown] = useState<
    "team" | "position" | "sort" | "archetype" | "skill" | null
  >(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGoingToCourt, setIsGoingToCourt] = useState(false);
  const [compareSlots, setCompareSlots] =
    useState<CompareSlots>(getSavedCompareSlots);
  const [recentlyViewedPlayers, setRecentlyViewedPlayers] = useState<string[]>(
    getSavedRecentPlayers,
  );
  const [featuredPlayer, setFeaturedPlayer] = useState<Player | null>(null);

  // Derived player data
  const selectedPlayer = players.find(
    (player) => player.name === currentPlayer,
  );

  const playerInsights = selectedPlayer
    ? getPlayerInsights(selectedPlayer)
    : null;

  const similarPlayers = selectedPlayer
    ? getSimilarPlayers(selectedPlayer)
    : [];

  const bestLineupFits = selectedPlayer
    ? getBestLineupFits(selectedPlayer)
    : [];

  const featuredPlayerInsights = featuredPlayer
    ? getPlayerInsights(featuredPlayer)
    : null;

  const archetypeOptions = Array.from(
    new Map(
      players
        .map((player) => getPlayerInsights(player).archetype)
        .filter((archetype) => archetype !== null)
        .map((archetype) => [archetype.label, archetype]),
    ).values(),
  );

  const hasUnclassifiedPlayers = players.some(
    (player) => getPlayerInsights(player).archetype === null,
  );

  const teamOptions = Array.from(
    new Set(players.map((player) => normalizeTeamCode(player.team))),
  ).sort();

  // Filtered list data
  const filteredPlayers = getFilteredPlayers({
    players,
    playerSearch,
    favorites,
    showFavorites,
    filteredTeam,
    filteredPosition,
    filteredArchetype,
    sortBy,
    sortDirection,
  });

  const visiblePlayers = filteredPlayers.slice(0, 100);

  const hasActiveFilters = Boolean(
    showFavorites ||
    filteredTeam ||
    filteredPosition ||
    filteredArchetype ||
    sortBy ||
    playerSearch,
  );

  // Database snapshot data
  const positionBreakdown = getPositionBreakdown(players);

  const topArchetypeDistribution = getTopArchetypeDistribution(players);

  const {
    highestOverallPlayer,
    mostVersatilePlayer,
    bestShooter,
    bestPlaymaker,
  } = getPlayerDatabaseLeaders(players);

  // Effects
  useEffect(() => {
    let isActive = true;

    async function loadPlayers() {
      try {
        const response = await fetch("/api/players");

        if (!response.ok) {
          throw new Error("Failed to load players");
        }

        const data = (await response.json()) as {
          players?: Player[];
        };

        if (isActive && data.players && data.players.length > 0) {
          setPlayers(data.players);
        }
      } catch {
        if (isActive) {
          setPlayers(fallbackPlayers);
        }
      }
    }

    loadPlayers();

    return () => {
      isActive = false;
    };
  }, []);

  // Get random featured player from notable players only
  useEffect(() => {
    if (players.length === 0) return;

    const featuredPlayerPool = [...players]
      .filter((player) => {
        const overall = getPlayerRating(player);

        return (
          overall >= 84 &&
          player.stats.ppg >= 10 &&
          player.ratings.starPower >= 75
        );
      })
      .sort((a, b) => getPlayerRating(b) - getPlayerRating(a))
      .slice(0, 25);

    const pool = featuredPlayerPool.length > 0 ? featuredPlayerPool : players;

    setFeaturedPlayer(pool[Math.floor(Math.random() * pool.length)]);
  }, [players]);

  // Open a player card when coming from rankings with /players?player=name
  useEffect(() => {
    const playerFromUrl = searchParams.get("player");

    if (!playerFromUrl) return;

    const matchingPlayer = players.find(
      (player) => player.name === playerFromUrl,
    );

    if (!matchingPlayer) return;

    const timer = window.setTimeout(() => {
      openPlayerCard(matchingPlayer.name);

      router.replace("/players", { scroll: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams, router]);

  // Close the selected card when clicking outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!selectedPlayer) return;

      if (!(event.target instanceof Node)) return;

      if (
        playerCardRef.current &&
        !playerCardRef.current.contains(event.target)
      ) {
        closePlayerCard();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedPlayer]);

  // Close open filter dropdowns when clicking outside the filter row
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

  // Event handlers
  function addRecentlyViewedPlayer(playerName: string) {
    setRecentlyViewedPlayers((currentRecentPlayers) => {
      const nextRecentPlayers = addRecentPlayer(
        currentRecentPlayers,
        playerName,
      );

      saveRecentPlayers(nextRecentPlayers);

      return nextRecentPlayers;
    });
  }

  const toggleFavorite = (playerName: string) => {
    setFavorites((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName],
    );
  };

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

  function selectSkillFilter(skill: PlayerRatingCategory) {
    setSelectedSkill(skill);
    setOpenDropdown(null);
  }

  function resetAllFilters() {
    setPlayerSearch("");
    setShowFavorites(false);
    setFilteredTeam("");
    setFilteredPosition("");
    setFilteredArchetype("");
    setSortBy("careerOverall");
    setSortDirection("primary");
    setOpenDropdown(null);
  }

  function addPlayerToCompare(slot: "left" | "right") {
    if (!selectedPlayer) return;

    const nextSlots = {
      ...compareSlots,
      [slot]: selectedPlayer.name,
    };

    setCompareSlots(nextSlots);
    saveCompareSlots(nextSlots);

    setIsGoingToCourt(true);

    setTimeout(() => {
      router.push("/court");
    }, 450);
  }

  function openPlayerCard(playerName: string) {
    setCurrentPlayer(playerName);
    addRecentlyViewedPlayer(playerName);
    setIsCardFlipped(false);
  }

  function closePlayerCard() {
    setCurrentPlayer("");
    setIsCardFlipped(false);
  }

  function toggleCardFlip() {
    setIsCardFlipped((currentIsCardFlipped) => !currentIsCardFlipped);
  }

  function selectTeamFilter(team: Team | "") {
    setFilteredTeam(team);
    setOpenDropdown(null);
  }

  function selectPositionFilter(position: Position | "") {
    setFilteredPosition(position);
    setOpenDropdown(null);
  }

  function selectArchetypeFilter(archetype: string) {
    setFilteredArchetype(archetype);
    setOpenDropdown(null);
  }

  function selectSortFilter(sort: SortValue) {
    handleSortClick(sort);
    setOpenDropdown(null);
  }

  function toggleFavoritesFilter() {
    setShowFavorites((currentShowFavorites) => !currentShowFavorites);
  }

  function selectPlayerFromList(playerName: string) {
    if (currentPlayer === playerName) {
      closePlayerCard();
      return;
    }

    openPlayerCard(playerName);
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
                onViewPlayer={openPlayerCard}
              >
                <RecentlyScouted
                  players={players}
                  recentlyViewedPlayers={recentlyViewedPlayers}
                  onViewPlayer={openPlayerCard}
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

            <PlayerPageHeader
              playerSearch={playerSearch}
              onPlayerSearchChange={setPlayerSearch}
            />

            <PlayerFilters
              filtersRef={filtersRef}
              showFavorites={showFavorites}
              favoritesCount={favorites.length}
              filteredTeam={filteredTeam}
              teamOptions={teamOptions}
              filteredPosition={filteredPosition}
              filteredArchetype={filteredArchetype}
              hasUnclassifiedPlayers={hasUnclassifiedPlayers}
              archetypeOptions={archetypeOptions}
              onSelectArchetype={selectArchetypeFilter}
              sortBy={sortBy}
              sortDirection={sortDirection}
              openDropdown={openDropdown}
              hasActiveFilters={hasActiveFilters}
              onToggleFavorites={toggleFavoritesFilter}
              onOpenDropdown={setOpenDropdown}
              onSelectTeam={selectTeamFilter}
              onSelectPosition={selectPositionFilter}
              onSelectSort={selectSortFilter}
              onResetFilters={resetAllFilters}
              selectedSkill={selectedSkill}
              onSelectSkill={selectSkillFilter}
            />

            <PlayerList
              players={visiblePlayers}
              totalPlayersCount={filteredPlayers.length}
              currentPlayer={currentPlayer}
              favorites={favorites}
              showFavorites={showFavorites}
              selectedSkill={selectedSkill}
              sortBy={sortBy}
              onToggleFavorite={toggleFavorite}
              onSelectPlayer={selectPlayerFromList}
            />
          </div>

          <div className="flex items-start justify-center">
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
                  onBack={closePlayerCard}
                  onToggleFlip={toggleCardFlip}
                  onSelectSimilarPlayer={openPlayerCard}
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
