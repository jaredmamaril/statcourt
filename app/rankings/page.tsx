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
import { useUserSettings } from "../lib/use-user-settings";

import { getPlayersFromSupabaseWithFallback } from "../components/supabase-players";

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

export default function Rankings() {
  const { settings, isLoadingSettings } = useUserSettings();

  // Page state
  const [activeTab, setActiveTab] = useState<RankingTab>("careerOverall");
  const [openFilter, setOpenFilter] = useState<
    "profile" | "position" | "team" | "archetype" | null
  >(null);
  const [statProfileFilter, setStatProfileFilter] =
    useState<RankingStatProfile>("career");
  const [positionFilter, setPositionFilter] = useState<Position | "">("");
  const [teamFilter, setTeamFilter] = useState<Team | "">("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
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

  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultStatProfileRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setStatProfileFilter(settings.defaultStatMode);
      setActiveTab(
        settings.defaultStatMode === "peak"
          ? "peakOverall"
          : settings.defaultStatMode === "current"
            ? "currentOverall"
            : "careerOverall",
      );
      hasAppliedDefaultStatProfileRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultStatMode]);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        setPlayerLoadError("");

        const loadedPlayers = await getPlayersFromSupabaseWithFallback();

        if (isMounted) {
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
                getPlayerRating(b, "careerOverall", statProfileFilter) -
                getPlayerRating(a, "careerOverall", statProfileFilter),
            )
        : [],
    [archetypeFilter, players, statMode, statProfileFilter],
  );

  const selectedArchetypeInfo =
    archetypeFilter in archetypeInfoByLabel
      ? archetypeInfoByLabel[
          archetypeFilter as keyof typeof archetypeInfoByLabel
        ]
      : undefined;

  // Ranking data
  const overallCategoryByProfile: Record<
    RankingStatProfile,
    PlayerRatingCategory
  > = {
    career: "careerOverall",
    peak: "peakOverall",
    current: "currentOverall",
  };

  const ratingCategory: PlayerRatingCategory =
    activeTab === "archetypes"
      ? "careerOverall"
      : activeTab === "careerOverall"
        ? overallCategoryByProfile[statProfileFilter]
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

  const rankingHeading =
    activeTab === "careerOverall"
      ? "Top Overall Players"
      : `Top ${activeTabLabel} Ratings`;

  const ratingLabel = `${activeTabLabel} Rating`;

  // Event handlers
  function viewPlayerCard(playerName: string) {
    router.push(`/players/${encodeURIComponent(playerName)}`);
  }

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
  }, [archetypeFilter, shouldScrollToArchetypeDescription]);

  function selectArchetypeCard(label: string) {
    setArchetypeFilter(label);
    setShouldScrollToArchetypeDescription(true);
  }

  return (
    <main className="page-enter scrollbar-none min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
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
                selectedArchetypeColor={selectedArchetypeColor}
                selectedArchetypeOption={selectedArchetypeOption}
                archetypeOptionDetails={archetypeOptionDetails}
                onOpenFilter={setOpenFilter}
                onStatProfileFilterChange={setStatProfileFilter}
                onPositionFilterChange={setPositionFilter}
                onTeamFilterChange={setTeamFilter}
                onArchetypeFilterChange={setArchetypeFilter}
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
                onViewPlayer={viewPlayerCard}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
