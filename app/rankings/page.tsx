"use client";

import {
  getPlayerRating,
  type PlayerRatingCategory,
} from "../components/player-ratings";

import {
  players as fallbackPlayers,
  getPlayerInsights,
} from "../components/court-data";
import type { Team, Position } from "../components/court-data";

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

export default function Rankings() {
  // Page state
  const [activeTab, setActiveTab] = useState<RankingTab>("careerOverall");
  const [openFilter, setOpenFilter] = useState<
    "era" | "position" | "team" | "archetype" | null
  >(null);
  const [eraFilter, setEraFilter] = useState("all-time");
  const [positionFilter, setPositionFilter] = useState<Position | "">("");
  const [teamFilter, setTeamFilter] = useState<Team | "">("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [players, setPlayers] = useState(fallbackPlayers);

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
        .map((player) => getPlayerInsights(player).archetype?.label)
        .filter((label): label is string => Boolean(label)),
    ),
  ).sort();

  const archetypeOptionDetails = archetypeOptions.map((archetypeLabel) => {
    const matchingPlayer = players.find(
      (player) => getPlayerInsights(player).archetype?.label === archetypeLabel,
    );

    return {
      label: archetypeLabel,
      archetype: matchingPlayer
        ? getPlayerInsights(matchingPlayer).archetype
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
            getPlayerInsights(player).archetype?.label === archetypeFilter,
        )
        .sort(
          (a, b) =>
            getPlayerRating(b, "careerOverall") - getPlayerRating(a, "careerOverall"),
        )
    : [];

  const selectedArchetypeInfo =
    archetypeFilter in archetypeInfoByLabel
      ? archetypeInfoByLabel[
          archetypeFilter as keyof typeof archetypeInfoByLabel
        ]
      : undefined;

  // Ranking data
  const ratingCategory: PlayerRatingCategory =
    activeTab === "archetypes" ? "careerOverall" : activeTab;

  const filteredPlayers = players.filter((player) => {
    const archetype = getPlayerInsights(player).archetype;

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

  const rankedPlayers = [...filteredPlayers].sort(
    (a, b) =>
      getPlayerRating(b, ratingCategory) - getPlayerRating(a, ratingCategory),
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
              <ArchetypesSection
                archetypeOptionDetails={archetypeOptionDetails}
                selectedArchetype={archetypeFilter}
                selectedArchetypeInfo={selectedArchetypeInfo}
                selectedArchetypePlayers={selectedArchetypePlayers}
                archetypeDescriptionRef={archetypeDescriptionRef}
                onSelectArchetype={selectArchetypeCard}
                onViewPlayer={viewPlayerCard}
              />
            ) : (
              <RankingLeaderboardSection
                rankingHeading={rankingHeading}
                topThreePlayers={topThreePlayers}
                ratingCategory={ratingCategory}
                ratingLabel={ratingLabel}
                openFilter={openFilter}
                eraFilter={eraFilter}
                positionFilter={positionFilter}
                teamFilter={teamFilter}
                playerSearch={playerSearch}
                archetypeFilter={archetypeFilter}
                selectedArchetypeColor={selectedArchetypeColor}
                selectedArchetypeOption={selectedArchetypeOption}
                archetypeOptionDetails={archetypeOptionDetails}
                onOpenFilter={setOpenFilter}
                onEraFilterChange={setEraFilter}
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
                onViewPlayer={viewPlayerCard}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

