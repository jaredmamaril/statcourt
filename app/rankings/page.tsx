"use client";

import {
  getPlayerRating,
  type PlayerRatingCategory,
} from "../components/player-ratings";

import {
  players as fallbackPlayers,
  getPlayerInsights,
} from "../components/court-data";
import type {
  Player,
  Team,
  Position,
  StatMode,
} from "../components/court-data";

import { RankingStatProfileFilter } from "../components/rankings/ranking-stat-profile-filter";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function Rankings() {
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
  const [players, setPlayers] = useState(fallbackPlayers);
  const statMode: StatMode = statProfileFilter;

  // Refs and routing
  const archetypeDescriptionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      const loadedPlayers = await getPlayersFromSupabaseWithFallback();

      if (isMounted) {
        setPlayers(loadedPlayers);
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Archetype data
  const archetypeOptions = Array.from(
    new Set(
      players
        .map((player) => getPlayerInsights(player, statMode).archetype?.label)
        .filter((label): label is string => Boolean(label)),
    ),
  ).sort();

  const archetypeOptionDetails = archetypeOptions.map((archetypeLabel) => {
    const matchingPlayer = players.find(
      (player) =>
        getPlayerInsights(player, statMode).archetype?.label === archetypeLabel,
    );

    return {
      label: archetypeLabel,
      archetype: matchingPlayer
        ? getPlayerInsights(matchingPlayer, statMode).archetype
        : null,
    };
  });

  const selectedArchetypeOption = archetypeOptionDetails.find(
    (option) => option.label === archetypeFilter,
  );

  const selectedArchetypeColor = selectedArchetypeOption?.archetype
    ? getArchetypePillStyle(selectedArchetypeOption.archetype).color
    : undefined;

  const selectedArchetypePlayers = archetypeFilter
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
    : [];

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

  function shouldShowPlayerInRanking(player: Player) {
    const rating = getPlayerRating(player, ratingCategory, statProfileFilter);

    if (ratingCategory === "shooting" || ratingCategory === "efficiency") {
      return rating > 0;
    }

    return true;
  }

  const filteredPlayers = players.filter((player) => {
    const archetype = getPlayerInsights(player, statMode).archetype;

    const matchesSearch = player.name
      .toLowerCase()
      .includes(playerSearch.toLowerCase());

    const matchesPosition = positionFilter
      ? player.position === positionFilter
      : true;

    const matchesTeam = teamFilter ? player.team === teamFilter : true;

    const matchesArchetype = archetypeFilter
      ? archetype?.label === archetypeFilter
      : true;

    return matchesSearch && matchesPosition && matchesTeam && matchesArchetype;
  });

  const rankedPlayers = filteredPlayers
    .filter(shouldShowPlayerInRanking)
    .sort(
      (a, b) =>
        getPlayerRating(b, ratingCategory, statProfileFilter) -
        getPlayerRating(a, ratingCategory, statProfileFilter),
    );

  const topThreePlayers = rankedPlayers.slice(0, 3);

  const activeTabLabel =
    rankingTabs.find((tab) => tab.value === activeTab)?.label ?? "Overall";

  const rankingHeading =
    activeTab === "careerOverall"
      ? "Top Overall Players"
      : `Top ${activeTabLabel} Ratings`;

  const ratingLabel = `${activeTabLabel} Rating`;

  // Event handlers
  function viewPlayerCard(playerName: string) {
    router.push(`/players?player=${encodeURIComponent(playerName)}`);
  }

  function selectArchetypeCard(label: string) {
    setArchetypeFilter(label);

    setTimeout(() => {
      archetypeDescriptionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  return (
    <main className="scrollbar-none min-h-screen overflow-x-hidden text-white">
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
              <>
                <div className="mb-1 flex justify-center">
                  <RankingStatProfileFilter
                    isOpen={openFilter === "profile"}
                    selectedProfile={statProfileFilter}
                    onToggle={() =>
                      setOpenFilter(openFilter === "profile" ? null : "profile")
                    }
                    onSelectProfile={(profile) => {
                      setStatProfileFilter(profile);
                      setOpenFilter(null);
                    }}
                  />
                </div>

                <ArchetypesSection
                  players={players}
                  statProfileFilter={statProfileFilter}
                  statMode={statMode}
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

          {activeTab !== "archetypes" && (
            <>
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
