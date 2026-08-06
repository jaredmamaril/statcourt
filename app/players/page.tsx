"use client";

import { AuthPrompt } from "../components/auth/auth-prompt";
import { useAuthUser } from "../lib/use-auth-user";
import {
  type DefaultPlayerView,
  useUserSettings,
} from "../lib/use-user-settings";
import { DatabaseLoadingState } from "../components/loading/database-loading-state";
import { DatabaseErrorState } from "../components/loading/database-error-state";
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
import { PlayerPageControlsSkeleton } from "../components/players/player-page-skeletons";
import {
  DatabaseSnapshot,
  FeaturedPlayerPanel,
  PlayerDashboardSkeleton,
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
import { useCompareSlots } from "../components/players/use-compare-slots";
import { useFavoritePlayers } from "../components/players/use-favorite-players";
import { useRecentPlayers } from "../components/players/use-recent-players";
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
} from "../components/court-data";
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

const archetypeRarityRank = {
  gold: 5,
  purple: 4,
  blue: 3,
  gray: 2,
  red: 1,
};

const PLAYER_LIST_DISPLAY_OPTIONS = [50, 100, 200];
const PLAYER_LIST_LOAD_MORE_OPTIONS = [25, 50, 100];

function getFeaturedPlayerScore(player: Player) {
  const careerOverall = getPlayerRating(player, "careerOverall");
  const starPower = getPlayerRating(player, "starPower");
  const careerLegacy = player.ratings.careerLegacy ?? 0;
  const games = player.stats.games ?? 0;
  const sampleScore = Math.min(games / 900, 1) * 100;

  return (
    careerOverall * 0.42 +
    starPower * 0.28 +
    careerLegacy * 0.2 +
    sampleScore * 0.1
  );
}

function isFeaturedPlayerEligible(player: Player) {
  const careerOverall = getPlayerRating(player, "careerOverall");
  const starPower = getPlayerRating(player, "starPower");
  const careerLegacy = player.ratings.careerLegacy ?? 0;
  const games = player.stats.games ?? 0;

  const hasStrongProfile =
    careerOverall >= 84 || starPower >= 86 || careerLegacy >= 70;
  const hasEnoughSample = games >= 350 || starPower >= 90 || careerLegacy >= 80;

  return hasStrongProfile && hasEnoughSample;
}

export default function PlayersPage() {
  return (
    <Suspense fallback={null}>
      <Players />
    </Suspense>
  );
}

function Players() {
  const { user } = useAuthUser();
  const { settings, isLoadingSettings } = useUserSettings();
  const { favorites, toggleFavorite } = useFavoritePlayers(user);
  const { compareSlots, updateCompareSlots } = useCompareSlots(user);
  const { recentPlayers, addViewedPlayer } = useRecentPlayers(user);

  // URL/navigation
  const searchParams = useSearchParams();
  const router = useRouter();

  // Refs
  const filtersRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const hasAppliedDefaultRatingViewRef = useRef(false);
  const hasAppliedDefaultPlayerViewRef = useRef(false);

  // Page state
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [filteredTeam, setFilteredTeam] = useState<Team | "">("");
  const [filteredPosition, setFilteredPosition] = useState<Position | "">("");
  const [filteredArchetype, setFilteredArchetype] = useState("");
  const [selectedRatingView, setSelectedRatingView] =
    useState<PlayerRatingCategory>("careerOverall");
  const [playerDisplayView, setPlayerDisplayView] =
    useState<DefaultPlayerView>("cards");
  const [sortBy, setSortBy] = useState<SortValue>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("primary");
  const [playerListBaseLimit, setPlayerListBaseLimit] = useState(50);
  const [playerListLoadMoreAmount, setPlayerListLoadMoreAmount] = useState(50);
  const [visiblePlayerCount, setVisiblePlayerCount] = useState(50);
  const [openDropdown, setOpenDropdown] = useState<
    | "team"
    | "position"
    | "sort"
    | "archetype"
    | "skill"
    | "view"
    | null
  >(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGoingToCourt, setIsGoingToCourt] = useState(false);
  const [featuredPlayerIndex, setFeaturedPlayerIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const deferredPlayerSearch = useDeferredValue(playerSearch);

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

  const playerInsights = useMemo(
    () =>
      selectedPlayer
        ? getPlayerInsights(selectedPlayer, selectedStatMode)
        : null,
    [selectedPlayer, selectedStatMode],
  );

  const similarPlayers = useMemo(
    () =>
      selectedPlayer
        ? getSimilarPlayers(selectedPlayer, players, 3, selectedStatMode)
        : [],
    [selectedPlayer, players, selectedStatMode],
  );

  const bestLineupFits = useMemo(
    () =>
      selectedPlayer ? getBestLineupFits(selectedPlayer, selectedStatMode) : [],
    [selectedPlayer, selectedStatMode],
  );

  const archetypeOptions = useMemo(
    () =>
      Array.from(
        new Map(
          players
            .map(
              (player) => getPlayerInsights(player, selectedStatMode).archetype,
            )
            .filter((archetype) => archetype !== null)
            .map((archetype) => [archetype.label, archetype]),
        ).values(),
      ).sort(
        (a, b) =>
          archetypeRarityRank[b.rarity] - archetypeRarityRank[a.rarity] ||
          a.label.localeCompare(b.label),
      ),
    [players, selectedStatMode],
  );

  const hasUnclassifiedPlayers = useMemo(
    () =>
      players.some(
        (player) =>
          getPlayerInsights(player, selectedStatMode).archetype === null,
      ),
    [players, selectedStatMode],
  );

  const teamOptions = useMemo(
    () =>
      Array.from(
        new Set(players.map((player) => normalizeTeamCode(player.team))),
      ).sort(),
    [players],
  );

  // Filtered list data
  const filteredPlayers = useMemo(
    () =>
      getFilteredPlayers({
        players,
        playerSearch: deferredPlayerSearch,
        favorites,
        showFavorites,
        filteredTeam,
        filteredPosition,
        filteredArchetype,
        sortBy,
        sortDirection,
        selectedRatingView,
      }),
    [
      players,
      deferredPlayerSearch,
      favorites,
      showFavorites,
      filteredTeam,
      filteredPosition,
      filteredArchetype,
      sortBy,
      sortDirection,
      selectedRatingView,
    ],
  );

  const visiblePlayers = filteredPlayers.slice(0, visiblePlayerCount);

  const hasActiveFilters = Boolean(
    showFavorites ||
    filteredTeam ||
    filteredPosition ||
    filteredArchetype ||
    sortBy ||
    playerSearch,
  );

  // Database snapshot data
  const positionBreakdown = useMemo(
    () => getPositionBreakdown(players),
    [players],
  );

  const topArchetypeDistribution = useMemo(
    () => getTopArchetypeDistribution(players, selectedStatMode),
    [players, selectedStatMode],
  );

  const {
    highestOverallPlayer,
    mostVersatilePlayer,
    bestShooter,
    bestPlaymaker,
  } = useMemo(() => getPlayerDatabaseLeaders(players), [players]);

  // Effects
  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultRatingViewRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setSelectedRatingView(
        settings.defaultStatMode === "peak"
          ? "peakOverall"
          : settings.defaultStatMode === "current"
            ? "currentOverall"
            : "careerOverall",
      );
      hasAppliedDefaultRatingViewRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultStatMode]);

  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultPlayerViewRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setPlayerDisplayView(settings.defaultPlayerView);
      hasAppliedDefaultPlayerViewRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultPlayerView]);

  useEffect(() => {
    let isActive = true;

    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        setPlayerLoadError("");

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
      } catch (error) {
        console.error("Failed to load players", error);

        if (isActive) {
          setPlayers(fallbackPlayers);
          setPlayerLoadError("Could not load player database.");
        }
      } finally {
        if (isActive) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisiblePlayerCount(playerListBaseLimit);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    deferredPlayerSearch,
    favorites,
    filteredArchetype,
    filteredPosition,
    filteredTeam,
    playerListBaseLimit,
    selectedRatingView,
    showFavorites,
    sortBy,
    sortDirection,
  ]);

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
    const rankedPlayers = [...players].sort(
      (a, b) => getFeaturedPlayerScore(b) - getFeaturedPlayerScore(a),
    );
    const notablePlayers = rankedPlayers
      .filter(isFeaturedPlayerEligible)
      .slice(0, 75);

    return notablePlayers.length > 0 ? notablePlayers : rankedPlayers.slice(0, 25);
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

  const openPlayerCard = useCallback(
    (playerName: string) => {
      setCurrentPlayer(playerName);
      void addViewedPlayer(playerName);
      setIsCardFlipped(false);
    },
    [addViewedPlayer],
  );

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
    setSortBy("");

    if (selectedRatingView === skill) {
      setSortDirection(sortDirection === "primary" ? "reverse" : "primary");
    } else {
      setSelectedRatingView(skill);
      setSortDirection("primary");
    }

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

      void updateCompareSlots(nextSlots);

      setIsGoingToCourt(true);

      setTimeout(() => {
        router.push("/court");
      }, 450);
    });
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

  function selectPlayerDisplayView(view: DefaultPlayerView) {
    setPlayerDisplayView(view);
    setOpenDropdown(null);
  }

  function selectPlayerListBaseLimit(limit: number) {
    setPlayerListBaseLimit(limit);
    setVisiblePlayerCount(limit);
  }

  function loadMorePlayers() {
    setVisiblePlayerCount((currentCount) =>
      Math.min(currentCount + playerListLoadMoreAmount, filteredPlayers.length),
    );
  }

  function selectSortFilter(sort: SortValue) {
    handleSortClick(sort);
    setOpenDropdown(null);
  }

  function toggleFavoritesFilter() {
    requireAuth("Sign in to view favorite players", () => {
      setShowFavorites((currentShowFavorites) => !currentShowFavorites);
    });
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
    <main className="page-enter min-h-screen overflow-x-hidden text-white">
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
            {isDesktop &&
              !selectedPlayer &&
              isLoadingPlayers && <PlayerDashboardSkeleton />}

            {isDesktop &&
              !selectedPlayer &&
              !isLoadingPlayers &&
              featuredPlayer && (
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
                    recentlyViewedPlayers={recentPlayers}
                    onViewPlayer={openPlayerCard}
                  />
                </FeaturedPlayerPanel>
              )}

            {isDesktop && !selectedPlayer && !isLoadingPlayers && (
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
            {isLoadingPlayers ? (
              <PlayerPageControlsSkeleton />
            ) : (
              <>
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
                  selectedView={playerDisplayView}
                  onSelectView={selectPlayerDisplayView}
                />
              </>
            )}

            {isLoadingPlayers ? (
              <DatabaseLoadingState
                title="Loading Players"
                description="Building player dashboard..."
                skeleton={
                  playerDisplayView === "cards" ? "player-cards" : "player-rows"
                }
              />
            ) : (
              <>
                {playerLoadError && <DatabaseErrorState />}

                <PlayerList
                  players={visiblePlayers}
                  totalPlayersCount={filteredPlayers.length}
                  currentPlayer={currentPlayer}
                  favorites={favorites}
                  showFavorites={showFavorites}
                  selectedSkill={selectedRatingView}
                  sortBy={sortBy}
                  displayView={playerDisplayView}
                  baseDisplayCount={playerListBaseLimit}
                  loadMoreAmount={playerListLoadMoreAmount}
                  displayCountOptions={PLAYER_LIST_DISPLAY_OPTIONS}
                  loadMoreOptions={PLAYER_LIST_LOAD_MORE_OPTIONS}
                  onSelectBaseDisplayCount={selectPlayerListBaseLimit}
                  onSelectLoadMoreAmount={setPlayerListLoadMoreAmount}
                  onLoadMore={loadMorePlayers}
                  onToggleFavorite={(playerName) =>
                    requireAuth("Sign in to save favorite players", () => {
                      void toggleFavorite(playerName);
                    })
                  }
                  onSelectPlayer={selectPlayerFromList}
                />
              </>
            )}
          </div>

          <div className="flex w-full items-start justify-center">
            {selectedPlayer && (
              <div
                key={selectedPlayer.id}
                ref={playerCardRef}
                className="w-full max-w-85 sm:max-w-md"
              >
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
