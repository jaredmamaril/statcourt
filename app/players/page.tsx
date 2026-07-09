"use client";

import { AuthPrompt } from "../components/auth/auth-prompt";
import { mockUser as user } from "../lib/mock-auth";
import {
  players as fallbackPlayers,
  positions,
  getPlayerInsights,
  getSimilarPlayers,
  normalizeTeamCode,
  type Player,
  type StatMode,
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
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [selectedRatingView, setSelectedRatingView] =
    useState<PlayerRatingCategory>("careerOverall");
  const [sortBy, setSortBy] = useState<SortValue>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("primary");
  const [openDropdown, setOpenDropdown] = useState<
    "team" | "position" | "sort" | "archetype" | "skill" | null
  >(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGoingToCourt, setIsGoingToCourt] = useState(false);
  const [compareSlots, setCompareSlots] = useState<CompareSlots>({
    left: "",
    right: "",
  });
  const [recentlyViewedPlayers, setRecentlyViewedPlayers] = useState<string[]>(
    [],
  );
  const [featuredPlayerIndex, setFeaturedPlayerIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Auth
  const [authPromptMessage, setAuthPromptMessage] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Derived player data
  const selectedPlayer = players.find(
    (player) => player.name === currentPlayer,
  );

  const selectedStatMode = getStatModeFromRatingView(selectedRatingView);

  const selectedStatModeLabel =
    selectedRatingView === "peakOverall"
      ? "3-Year Peak"
      : selectedRatingView === "currentOverall"
        ? "Latest Season"
        : "Career";

  const playerInsights = selectedPlayer
    ? getPlayerInsights(selectedPlayer, selectedStatMode)
    : null;

  const similarPlayers = selectedPlayer
    ? getSimilarPlayers(selectedPlayer, players, 3, selectedStatMode)
    : [];

  const bestLineupFits = selectedPlayer
    ? getBestLineupFits(selectedPlayer, selectedStatMode)
    : [];

  const rarityRank = {
    gold: 5,
    purple: 4,
    blue: 3,
    gray: 2,
    red: 1,
  };

  const archetypeOptions = Array.from(
    new Map(
      players
        .map((player) => getPlayerInsights(player, selectedStatMode).archetype)
        .filter((archetype) => archetype !== null)
        .map((archetype) => [archetype.label, archetype]),
    ).values(),
  ).sort(
    (a, b) =>
      rarityRank[b.rarity] - rarityRank[a.rarity] ||
      a.label.localeCompare(b.label),
  );

  const hasUnclassifiedPlayers = players.some(
    (player) => getPlayerInsights(player, selectedStatMode).archetype === null,
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
    selectedRatingView,
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

  const topArchetypeDistribution = getTopArchetypeDistribution(
    players,
    selectedStatMode,
  );

  const {
    highestOverallPlayer,
    mostVersatilePlayer,
    bestShooter,
    bestPlaymaker,
  } = getPlayerDatabaseLeaders(players);

  // Effects
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setRecentlyViewedPlayers(getSavedRecentPlayers());
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setCompareSlots(getSavedCompareSlots());
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function handleScreenChange() {
      setIsDesktop(mediaQuery.matches);
    }

    handleScreenChange();

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  // Get random featured player from notable players only
  const featuredPlayerPool = useMemo(() => {
    const notablePlayers = players.filter(
      (player) =>
        getPlayerRating(player, "careerOverall") >= 75 ||
        getPlayerRating(player, "starPower") >= 75,
    );

    return notablePlayers.length > 0 ? notablePlayers : players;
  }, [players]);

  useEffect(() => {
    if (featuredPlayerPool.length === 0) return;

    const timer = window.setTimeout(() => {
      setFeaturedPlayerIndex(
        Math.floor(Math.random() * featuredPlayerPool.length),
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [featuredPlayerPool]);

  const featuredPlayer =
    featuredPlayerPool[featuredPlayerIndex % featuredPlayerPool.length];

  const featuredPlayerInsights = featuredPlayer
    ? getPlayerInsights(featuredPlayer, selectedStatMode)
    : null;

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
  }, [searchParams, router, players, openPlayerCard]);

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
  const addRecentlyViewedPlayer = useCallback((playerName: string) => {
    setRecentlyViewedPlayers((currentRecentPlayers) => {
      const nextRecentPlayers = addRecentPlayer(
        currentRecentPlayers,
        playerName,
      );

      saveRecentPlayers(nextRecentPlayers);

      return nextRecentPlayers;
    });
  }, []);

  const updateFavorite = (playerName: string) => {
    setFavorites((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName],
    );
  };

  function toggleFavorite(playerName: string) {
    requireAuth("Create an account to track your favorite players", () => {
      updateFavorite(playerName);
    });
  }

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
    setSelectedRatingView(skill);
    setOpenDropdown(null);
  }

  function resetAllFilters() {
    setPlayerSearch("");
    setShowFavorites(false);
    setFilteredTeam("");
    setFilteredPosition("");
    setFilteredArchetype("");
    setSortBy("");
    setSortDirection("primary");
    setOpenDropdown(null);
  }

  function addPlayerToCompare(slot: "left" | "right") {
    requireAuth("Sign in to save player comparisons", () => {
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
    });
  }

  const openPlayerCard = useCallback((playerName: string) => {
    setCurrentPlayer(playerName);
    addRecentlyViewedPlayer(playerName);
    setIsCardFlipped(false);
  }, [addRecentlyViewedPlayer]);

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

  function getStatModeFromRatingView(
    ratingView: PlayerRatingCategory,
  ): StatMode {
    if (ratingView === "peakOverall") return "peak";
    if (ratingView === "currentOverall") return "current";

    return "career";
  }

  // Auth
  function requireAuth(message: string, action: () => void) {
    if (!user) {
      setAuthPromptMessage(message);
      setShowAuthPrompt(true);
      return;
    }

    action();
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-3 pb-12 lg:px-6">
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
                ? "hidden h-full w-full flex-col opacity-10 transition-all duration-500 ease-out lg:relative lg:flex lg:-translate-x-5 [&_button]:pointer-events-none"
                : "pointer-events-auto relative flex h-full w-full flex-col translate-x-0 opacity-100 transition-all duration-500 ease-out"
            }
          >
            {isDesktop && !selectedPlayer && featuredPlayer && (
              <FeaturedPlayerPanel
                featuredPlayer={featuredPlayer}
                ratingView={selectedRatingView}
                statMode={selectedStatMode}
                statModeLabel={selectedStatModeLabel}
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
            {/* Desktop-only side panels */}
            {isDesktop && !selectedPlayer && (
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
              selectedSkill={selectedRatingView}
              onSelectSkill={selectSkillFilter}
            />
            <PlayerList
              players={visiblePlayers}
              totalPlayersCount={filteredPlayers.length}
              currentPlayer={currentPlayer}
              favorites={favorites}
              showFavorites={showFavorites}
              selectedSkill={selectedRatingView}
              sortBy={sortBy}
              onToggleFavorite={toggleFavorite}
              onSelectPlayer={selectPlayerFromList}
            />
          </div>

          <div className="flex w-full items-start justify-center">
            {selectedPlayer && (
              <div ref={playerCardRef} className="w-full max-w-85 sm:max-w-md">
                <SelectedPlayerCard
                  player={selectedPlayer}
                  statMode={selectedStatMode}
                  statModeLabel={selectedStatModeLabel}
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

          {showAuthPrompt && (
            <AuthPrompt
              title={authPromptMessage}
              description="Sign in to sync favorites, saved comparisons, and player history."
              onClose={() => setShowAuthPrompt(false)}
            />
          )}
        </div>
      </section>
    </main>
  );
}
