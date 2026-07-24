"use client";

import { DatabaseLoadingState } from "../components/loading/database-loading-state";
import { DatabaseErrorState } from "../components/loading/database-error-state";

import {
  getPlayerRating,
  type PlayerRatingCategory,
} from "../components/player-ratings";

import {
  players as fallbackPlayers,
  getPlayerInsights,
} from "../components/court-data";
import type { Team, Position, StatMode } from "../components/court-data";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type DefaultPlayerView,
  useUserSettings,
} from "../lib/use-user-settings";

import {
  RankingTabs,
  rankingTabs,
  type RankingTab,
} from "../components/rankings/ranking-tabs";
import { getArchetypePillStyle } from "../components/rankings/ranking-style-helpers";
import { RankingLeaderboardSection } from "../components/rankings/ranking-leaderboard-section";
import { RankingPageDescription } from "../components/rankings/ranking-page-description";

import { archetypeInfoByLabel } from "../components/rankings/archetype-metadata";
import { ArchetypesSection } from "../components/rankings/archetypes-section";

import { RemainingRankingList } from "../components/rankings/remaining-ranking-list";

type RankingStatProfile = "career" | "peak" | "current";
type ArchetypeSort = "rarity" | "name";

const archetypeRarityRank = {
  gold: 0,
  purple: 1,
  blue: 2,
  gray: 3,
  red: 4,
} as const;

const RANKING_BASE_DISPLAY_LIMIT = 50;
const RANKING_BASE_LOAD_MORE_AMOUNT = 50;

export default function Rankings() {
  const { settings, isLoadingSettings } = useUserSettings();

  // Page state
  const [activeTab, setActiveTab] = useState<RankingTab>("careerOverall");
  const [openFilter, setOpenFilter] = useState<
    "profile" | "position" | "team" | "archetype" | "view" | null
  >(null);
  const [statProfileFilter, setStatProfileFilter] =
    useState<RankingStatProfile>("career");
  const [positionFilter, setPositionFilter] = useState<Position | "">("");
  const [teamFilter, setTeamFilter] = useState<Team | "">("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [displayView, setDisplayView] = useState<DefaultPlayerView>("cards");
  const [rankingDisplayLimit, setRankingDisplayLimit] = useState(
    RANKING_BASE_DISPLAY_LIMIT,
  );
  const [rankingLoadMoreAmount, setRankingLoadMoreAmount] = useState(
    RANKING_BASE_LOAD_MORE_AMOUNT,
  );
  const [archetypeSort, setArchetypeSort] =
    useState<ArchetypeSort>("rarity");
  const [
    shouldScrollToArchetypeDescription,
    setShouldScrollToArchetypeDescription,
  ] = useState(false);
  const [players, setPlayers] = useState(fallbackPlayers);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const deferredPlayerSearch = useDeferredValue(playerSearch);
  const statMode: StatMode = statProfileFilter;

  // Refs and routing
  const archetypeDescriptionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const hasAppliedDefaultStatProfileRef = useRef(false);
  const hasAppliedDefaultPlayerViewRef = useRef(false);

  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultStatProfileRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setStatProfileFilter(settings.defaultStatMode);
      setActiveTab("careerOverall");
      hasAppliedDefaultStatProfileRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultStatMode]);

  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultPlayerViewRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setDisplayView(settings.defaultPlayerView);
      hasAppliedDefaultPlayerViewRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultPlayerView]);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        setPlayerLoadError("");

        const response = await fetch("/api/players", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load ranking players");
        }

        const data = (await response.json()) as {
          players?: typeof fallbackPlayers;
        };

        const loadedPlayers = data.players ?? [];

        if (isMounted && loadedPlayers.length > 0) {
          setPlayers(loadedPlayers);
        }
      } catch (error) {
        console.error("Failed to load ranking players", error);

        if (isMounted) {
          setPlayers(fallbackPlayers);
          setPlayerLoadError("Could not load ranking database.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Archetype data
  const archetypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          players
            .map(
              (player) => getPlayerInsights(player, statMode).archetype?.label,
            )
            .filter((label): label is string => Boolean(label)),
        ),
      ).sort(),
    [players, statMode],
  );

  const archetypeOptionDetails = useMemo(
    () =>
      archetypeOptions
        .map((archetypeLabel) => {
          const matchingPlayer = players.find(
            (player) =>
              getPlayerInsights(player, statMode).archetype?.label ===
              archetypeLabel,
          );

          return {
            label: archetypeLabel,
            archetype: matchingPlayer
              ? getPlayerInsights(matchingPlayer, statMode).archetype
              : null,
          };
        })
        .sort((a, b) => {
          if (archetypeSort === "name") {
            return a.label.localeCompare(b.label);
          }

          const aRank = a.archetype
            ? archetypeRarityRank[a.archetype.rarity]
            : 99;
          const bRank = b.archetype
            ? archetypeRarityRank[b.archetype.rarity]
            : 99;

          return aRank - bRank || a.label.localeCompare(b.label);
        }),
    [archetypeOptions, archetypeSort, players, statMode],
  );

  const selectedArchetypeOption = archetypeOptionDetails.find(
    (option) => option.label === archetypeFilter,
  );

  const selectedArchetypeColor = selectedArchetypeOption?.archetype
    ? getArchetypePillStyle(selectedArchetypeOption.archetype).color
    : undefined;

  const overallCategoryByProfile: Record<
    RankingStatProfile,
    PlayerRatingCategory
  > = {
    career: "careerOverall",
    peak: "peakOverall",
    current: "currentOverall",
  };

  const selectedOverallCategory = overallCategoryByProfile[statProfileFilter];

  const selectedArchetypePlayers = useMemo(
    () =>
      archetypeFilter
        ? players
            .filter(
              (player) =>
                getPlayerInsights(player, statMode).archetype?.label ===
                archetypeFilter,
            )
            .sort(
              (a, b) =>
                getPlayerRating(b, selectedOverallCategory, statProfileFilter) -
                getPlayerRating(a, selectedOverallCategory, statProfileFilter),
            )
        : [],
    [
      archetypeFilter,
      players,
      selectedOverallCategory,
      statMode,
      statProfileFilter,
    ],
  );

  const selectedArchetypeInfo =
    archetypeFilter in archetypeInfoByLabel
      ? archetypeInfoByLabel[
          archetypeFilter as keyof typeof archetypeInfoByLabel
        ]
      : undefined;

  // Ranking data
  const ratingCategory: PlayerRatingCategory =
    activeTab === "archetypes"
      ? "careerOverall"
      : activeTab === "careerOverall"
        ? selectedOverallCategory
        : activeTab;

  const filteredPlayers = useMemo(
    () =>
      players.filter((player) => {
        const archetype = getPlayerInsights(player, statMode).archetype;

        const matchesSearch = player.name
          .toLowerCase()
          .includes(deferredPlayerSearch.toLowerCase());

        const matchesPosition = positionFilter
          ? player.position === positionFilter
          : true;

        const matchesTeam = teamFilter ? player.team === teamFilter : true;

        const matchesArchetype = archetypeFilter
          ? archetype?.label === archetypeFilter
          : true;

        return (
          matchesSearch && matchesPosition && matchesTeam && matchesArchetype
        );
      }),
    [
      players,
      statMode,
      deferredPlayerSearch,
      positionFilter,
      teamFilter,
      archetypeFilter,
    ],
  );

  const rankedPlayers = useMemo(
    () =>
      filteredPlayers
        .filter((player) => {
          const rating = getPlayerRating(
            player,
            ratingCategory,
            statProfileFilter,
          );

          if (ratingCategory === "shooting" || ratingCategory === "efficiency") {
            return rating > 0;
          }

          return true;
        })
        .sort(
          (a, b) =>
            getPlayerRating(b, ratingCategory, statProfileFilter) -
            getPlayerRating(a, ratingCategory, statProfileFilter),
        ),
    [filteredPlayers, ratingCategory, statProfileFilter],
  );

  const topThreePlayers = useMemo(() => rankedPlayers.slice(0, 3), [rankedPlayers]);

  const activeTabLabel =
    rankingTabs.find((tab) => tab.value === activeTab)?.label ?? "Overall";

  const selectedStatProfileLabel =
    statProfileFilter === "career"
      ? "Career"
      : statProfileFilter === "peak"
        ? "Peak"
        : "Current";

  const rankingHeading =
    activeTab === "careerOverall"
      ? `Top ${selectedStatProfileLabel} Overall Players`
      : `Top ${activeTabLabel} Ratings`;

  const ratingLabel =
    activeTab === "careerOverall"
      ? `${selectedStatProfileLabel} Overall Rating`
      : `${activeTabLabel} Rating`;

  // Event handlers
  function viewPlayerCard(playerName: string) {
    router.push(`/players/${encodeURIComponent(playerName)}`);
  }

  function loadMoreRankings() {
    setRankingDisplayLimit((currentLimit) =>
      Math.min(currentLimit + rankingLoadMoreAmount, rankedPlayers.length),
    );
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setRankingDisplayLimit(RANKING_BASE_DISPLAY_LIMIT);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeTab,
    archetypeFilter,
    deferredPlayerSearch,
    positionFilter,
    ratingCategory,
    statProfileFilter,
    teamFilter,
  ]);

  useEffect(() => {
    if (!shouldScrollToArchetypeDescription || !archetypeFilter) return;

    let animationFrameId = 0;
    let isCancelled = false;

    const scrollTimer = window.setTimeout(() => {
      animationFrameId = window.requestAnimationFrame(() => {
        const archetypeDescription = archetypeDescriptionRef.current;

        if (!archetypeDescription) return;

        const targetTop =
          archetypeDescription.getBoundingClientRect().top +
          window.scrollY -
          78;

        const startTop = window.scrollY;
        const endTop = Math.max(targetTop, 0);
        const distance = endTop - startTop;
        const duration = 850;
        const startTime = performance.now();

        if (settings.reducedMotion) {
          window.scrollTo(0, endTop);
          setShouldScrollToArchetypeDescription(false);
          return;
        }

        function easeInOutCubic(progress: number) {
          return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        }

        function scrollStep(currentTime: number) {
          if (isCancelled) return;

          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeInOutCubic(progress);

          window.scrollTo(0, startTop + distance * easedProgress);

          if (progress < 1) {
            animationFrameId = window.requestAnimationFrame(scrollStep);
            return;
          }

          setShouldScrollToArchetypeDescription(false);
        }

        animationFrameId = window.requestAnimationFrame(scrollStep);
      });
    }, 80);

    return () => {
      isCancelled = true;
      window.clearTimeout(scrollTimer);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    archetypeFilter,
    settings.reducedMotion,
    shouldScrollToArchetypeDescription,
  ]);

  function selectArchetypeCard(label: string) {
    setArchetypeFilter(label);
    setShouldScrollToArchetypeDescription(true);
  }

  return (
    <main className="page-enter scrollbar-none relative min-h-screen overflow-x-hidden text-white">
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12">
        <RankingTabs
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setArchetypeFilter("");
          }}
        />

        <RankingPageDescription activeTab={activeTab} />

        <div className="pt-2">
          <div className="mb-6">
            {activeTab === "archetypes" ? (
              isLoadingPlayers ? (
                <DatabaseLoadingState
                  title="Loading Archetypes"
                  description="Classifying player profiles..."
                />
              ) : (
                <>
                  {playerLoadError && (
                    <DatabaseErrorState
                      title="Archetypes Unavailable"
                      description="Showing fallback archetype data."
                    />
                  )}

                  <ArchetypesSection
                    players={players}
                    statProfileFilter={statProfileFilter}
                    statMode={statMode}
                    isProfileFilterOpen={openFilter === "profile"}
                    onToggleProfileFilter={() =>
                      setOpenFilter(openFilter === "profile" ? null : "profile")
                    }
                    onSelectProfileFilter={(profile) => {
                      setStatProfileFilter(profile);
                      setArchetypeFilter("");
                      setOpenFilter(null);
                    }}
                    archetypeSort={archetypeSort}
                    onToggleArchetypeSort={() =>
                      setArchetypeSort((current) =>
                        current === "rarity" ? "name" : "rarity",
                      )
                    }
                    archetypeOptionDetails={archetypeOptionDetails}
                    selectedArchetype={archetypeFilter}
                    selectedArchetypeColor={selectedArchetypeColor}
                    selectedArchetypeInfo={selectedArchetypeInfo}
                    selectedArchetypePlayers={selectedArchetypePlayers}
                    archetypeDescriptionRef={archetypeDescriptionRef}
                    onSelectArchetype={selectArchetypeCard}
                    onViewPlayer={viewPlayerCard}
                  />
                </>
              )
            ) : isLoadingPlayers ? (
              <DatabaseLoadingState
                title="Loading Rankings"
                description="Syncing top player ratings..."
              />
            ) : (
              <RankingLeaderboardSection
                rankingHeading={rankingHeading}
                topThreePlayers={topThreePlayers}
                ratingCategory={ratingCategory}
                ratingLabel={ratingLabel}
                openFilter={openFilter}
                statProfileFilter={statProfileFilter}
                positionFilter={positionFilter}
                teamFilter={teamFilter}
                playerSearch={playerSearch}
                archetypeFilter={archetypeFilter}
                displayView={displayView}
                selectedArchetypeColor={selectedArchetypeColor}
                selectedArchetypeOption={selectedArchetypeOption}
                archetypeOptionDetails={archetypeOptionDetails}
                onOpenFilter={setOpenFilter}
                onStatProfileFilterChange={setStatProfileFilter}
                onPositionFilterChange={setPositionFilter}
                onTeamFilterChange={setTeamFilter}
                onArchetypeFilterChange={setArchetypeFilter}
                onDisplayViewChange={setDisplayView}
                onPlayerSearchChange={setPlayerSearch}
                onViewPlayer={viewPlayerCard}
              />
            )}
          </div>

          {activeTab !== "archetypes" && !isLoadingPlayers && (
            <>
              {playerLoadError && (
                <DatabaseErrorState
                  title="Rankings Unavailable"
                  description="Showing fallback rankings."
                />
              )}

              <RemainingRankingList
                players={rankedPlayers}
                ratingCategory={ratingCategory}
                ratingLabel={ratingLabel}
                statProfileFilter={statProfileFilter}
                displayView={displayView}
                displayLimit={rankingDisplayLimit}
                loadMoreAmount={rankingLoadMoreAmount}
                onSelectDisplayLimit={setRankingDisplayLimit}
                onSelectLoadMoreAmount={setRankingLoadMoreAmount}
                onLoadMore={loadMoreRankings}
                onViewPlayer={viewPlayerCard}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
