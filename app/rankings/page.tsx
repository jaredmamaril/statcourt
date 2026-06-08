"use client";

import Image from "next/image";
import {
  players,
  getPlayerInsights,
  normalizeStat,
  statMaxValues,
  teamColors,
} from "../components/court-data";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Safety for tabs
type RankingTab =
  | "overall"
  | "scoring"
  | "shooting"
  | "playmaking"
  | "rebounding"
  | "efficiency"
  | "archetypes";

// Different ranking tabs to compare with
const rankingTabs: { label: string; value: RankingTab }[] = [
  { label: "Overall", value: "overall" },
  { label: "Scoring", value: "scoring" },
  { label: "Shooting", value: "shooting" },
  { label: "Playmaking", value: "playmaking" },
  { label: "Rebounding", value: "rebounding" },
  { label: "Efficiency", value: "efficiency" },
  { label: "Archetypes", value: "archetypes" },
];

// Rating shown on display for more appleasing results
function toDisplayRating(rawScore: number) {
  return 70 + rawScore * 0.3;
}

// Get score of player's stats
function getRankingScore(player: (typeof players)[number], tab: RankingTab) {
  const ppgScore = normalizeStat(player.stats.ppg, statMaxValues.ppg);
  const rpgScore = normalizeStat(player.stats.rpg, statMaxValues.rpg);
  const apgScore = normalizeStat(player.stats.apg, statMaxValues.apg);
  const fgScore = normalizeStat(
    player.stats.fgPercent,
    statMaxValues.fgPercent,
  );
  const threeScore = normalizeStat(
    player.stats.threePercent,
    statMaxValues.threePercent,
  );
  const ftScore = normalizeStat(
    player.stats.ftPercent,
    statMaxValues.ftPercent,
  );

  // Weighing score based on importance in category
  const scoringScore = ppgScore * 0.75 + fgScore * 0.15 + ftScore * 0.1;
  const shootingScore = threeScore * 0.65 + ftScore * 0.25 + fgScore * 0.1;
  const playmakingScore =
    apgScore * 0.75 + scoringScore * 0.15 + threeScore * 0.1;
  const reboundingScore = rpgScore * 0.9 + fgScore * 0.1;
  const efficiencyScore = fgScore * 0.45 + threeScore * 0.3 + ftScore * 0.25;

  // Specific ranking types
  if (tab === "scoring") {
    return toDisplayRating(scoringScore);
  }

  if (tab === "shooting") {
    return toDisplayRating(shootingScore);
  }

  if (tab === "playmaking") {
    return toDisplayRating(playmakingScore);
  }

  if (tab === "rebounding") {
    return toDisplayRating(reboundingScore);
  }

  if (tab === "efficiency") {
    return toDisplayRating(efficiencyScore);
  }

  // Bonus categories for exceptional stats
  const starCategories = [
    ppgScore >= 70,
    rpgScore >= 55,
    apgScore >= 55,
    fgScore >= 70,
    threeScore >= 70,
    ftScore >= 75,
  ].filter(Boolean).length;

  // Bonus weighing
  const versatilityBonus = starCategories * 2;

  // Overall score
  const overallScore =
    scoringScore * 0.3 +
    efficiencyScore * 0.23 +
    playmakingScore * 0.19 +
    reboundingScore * 0.15 +
    shootingScore * 0.13 +
    versatilityBonus;

  return toDisplayRating(overallScore);
}

// Archetype pill ranking and design
function getArchetypePillStyle(
  archetype: NonNullable<ReturnType<typeof getPlayerInsights>["archetype"]>,
) {
  const color =
    archetype.rarity === "gold"
      ? "#EFBF04"
      : archetype.rarity === "purple"
        ? "#A855F7"
        : archetype.rarity === "blue"
          ? "#38BDF8"
          : archetype.rarity === "red"
            ? "#EF4444"
            : "#94A3B8";

  return {
    color,
    borderColor: `${color}99`,
    backgroundColor: `${color}22`,
  };
}

export default function Rankings() {
  // Router to travel to players page
  const router = useRouter();

  // Current tab, default is overall tab
  const [activeTab, setActiveTab] = useState<RankingTab>("overall");

  // Get ranked players from highest rated to lowest based on category
  const rankedPlayers = [...players].sort(
    (a, b) => getRankingScore(b, activeTab) - getRankingScore(a, activeTab),
  );

  const topThreePlayers = rankedPlayers.slice(0, 3);

  // Differentiate which tab you are in
  const activeTabLabel =
    rankingTabs.find((tab) => tab.value === activeTab)?.label ?? "Overall";

  // Overall tab gets different header than specified stat categories
  const rankingHeading =
    activeTab === "overall"
      ? "Top Overall Players"
      : `Top ${activeTabLabel} Ratings`;

  // (Current stat category) Rating
  const ratingLabel = `${activeTabLabel} Rating`;

  return (
    <main className="min-h-screen overflow-hidden text-white overflow-y-auto">
      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        {/* Ranking tabs */}
        <div className="mt-8 flex w-full items-end gap-2 overflow-x-auto border-b border-[#1bc2ec]/30 pb-0">
          {rankingTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              // Each tab in row
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`min-w-36 cursor-pointer rounded-t-md border border-b-0 px-4 font-michroma text-xs uppercase tracking-wide transition-all duration-200 ${
                  isActive
                    ? "py-4 border-[#1bc2ec]/70 bg-[#1bc2ec]/20 text-[#1bc2ec]"
                    : "py-2.5 border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Open ranking panel */}
        <div className="rounded-b-md border border-t-0 border-[#1bc2ec]/30 bg-black/25 p-4">
          {/* Top ranking leaders */}
          <div className="mb-6">
            <h1 className="font-michroma text-sm uppercase tracking-wide text-white">
              {rankingHeading}
            </h1>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {/* Top 3 players in section */}
              {topThreePlayers.map((player, index) => {
                const rankLabel =
                  index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
                const archetype = getPlayerInsights(player).archetype;
                const rating = getRankingScore(player, activeTab).toFixed(1);
                const rankColor =
                  index === 0 ? "#EFBF04" : index === 1 ? "#C0C0C0" : "#CD7F32";

                return (
                  <div
                    key={player.id}
                    className="group relative rounded-md border border-[#1bc2ec]/30 bg-black/40 px-4 py-4 transition-all duration-200 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* 1st, 2nd, 3rd */}
                        <p className="font-michroma text-xs font-bold text-[#1bc2ec]">
                          {rankLabel}
                        </p>

                        {/* Name changes color based on which place they are in */}
                        <p
                          className="mt-2 truncate font-michroma font-semibold text-md text-white"
                          style={{
                            color: rankColor,
                          }}
                        >
                          {player.name}
                        </p>

                        {/* If they have an archetype, display with proper ranking style */}
                        {archetype && (
                          <span
                            className="mt-1 inline-flex w-fit max-w-full rounded border px-2 py-0.5 font-michroma text-[9px]"
                            style={getArchetypePillStyle(archetype)}
                          >
                            <span className="truncate uppercase">
                              {archetype.label}
                            </span>
                          </span>
                        )}

                        {/* Player team */}
                        <p
                          className="mt-1 font-michroma font-semibold text-[10px] text-white/50"
                          style={{
                            color: teamColors[player.team],
                          }}
                        >
                          {player.team}
                        </p>

                        {/* Player position */}
                        <p className="mt-1 font-michroma text-[10px] text-white/50">
                          {player.position}
                        </p>
                      </div>

                      {/* Player rating */}
                      <p className="font-michroma text-xl font-bold text-white">
                        {rating}
                      </p>
                    </div>

                    {/* Player headshot */}
                    <div className="mt-3 flex justify-center">
                      <Image
                        src={player.image}
                        alt={player.name}
                        width={120}
                        height={120}
                        className="h-28 w-28 rounded-md object-cover"
                      />
                    </div>

                    {/* Tooltip for stats and card viewing */}
                    <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
                      <p className="font-michroma text-[10px] font-bold text-white">
                        {player.name}
                      </p>

                      {/* Rating in current tab/category */}
                      <p className="mt-2 font-michroma text-[9px] text-[#1bc2ec]">
                        {ratingLabel}: {rating}
                      </p>

                      {/* Traits of the character based on calculations */}
                      <p className="mt-3 font-michroma text-[9px] uppercase text-white/50">
                        Top Traits
                      </p>
                      <div className="mt-1 flex flex-col gap-1">
                        {getPlayerInsights(player).traits.map((trait) => (
                          <p
                            key={trait.label}
                            className="font-michroma text-[9px] text-white/70"
                          >
                            - {trait.label}
                          </p>
                        ))}
                      </div>

                      {/* Go to players' card button */}
                      <button
                        type="button"
                        onClick={() => {
                          router.push(
                            `/players?player=${encodeURIComponent(player.name)}`,
                          );
                        }}
                        className="mt-3 w-full cursor-pointer rounded border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma font-bold text-[12px] uppercase tracking-wide text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
                      >
                        View Full Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rest of list/rankings */}
          <div className="mb-2 flex items-center justify-between px-3 font-michroma text-[9px] uppercase tracking-wide text-white/40">
            <span className="-ml-2">Remaining Rankings</span>
            <span className="-mr-2">Rating</span>
          </div>

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {rankedPlayers.slice(3).map((player, index) => {
              const archetype = getPlayerInsights(player).archetype;
              const rating = getRankingScore(player, activeTab).toFixed(1);

              return (
                <div
                  key={player.id}
                  className="group relative grid w-full grid-cols-[44px_40px_1fr_52px_56px] items-center rounded-md border border-white/10 bg-black/30 px-3 py-2 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10"
                >
                  {/* Rankings starting at #4 */}
                  <span className="font-michroma text-xs font-bold text-[#1bc2ec]">
                    #{index + 4}
                  </span>

                  {/* Player headshot */}
                  <Image
                    src={player.image}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                  />

                  {/* Player name */}
                  <div className="min-w-0 ml-4">
                    <p className="truncate font-michroma text-[13px] font-semibold text-white">
                      {player.name}
                    </p>

                    {/* If they have an archetype, display with proper ranking style */}
                    {archetype && (
                      <span
                        className="mt-1 inline-flex w-fit max-w-full rounded border px-2 py-0.5 font-michroma text-[9px]"
                        style={getArchetypePillStyle(archetype)}
                      >
                        <span className="truncate uppercase">
                          {archetype.label}
                        </span>
                      </span>
                    )}

                    {/* Player position and jersey number */}
                    <p className="mt-0.5 font-michroma text-[9px] text-white/40">
                      {player.position} - #{player.jerseyNumber}
                    </p>
                  </div>

                  {/* Player team */}
                  <span
                    className="text-right font-michroma font-semibold text-[11px]"
                    style={{
                      color: teamColors[player.team],
                    }}
                  >
                    {player.team}
                  </span>

                  {/* Player rating */}
                  <span className="text-right font-michroma text-xs font-bold text-white">
                    {rating}
                  </span>

                  {/* Tooltip for stats and card viewing */}
                  <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
                    <p className="font-michroma text-[10px] font-bold text-white">
                      {player.name}
                    </p>

                    {/* Rating in current tab/category */}
                    <p className="mt-2 font-michroma text-[9px] text-[#1bc2ec]">
                      {ratingLabel}: {rating}
                    </p>

                    {/* Traits of the character based on calculations */}
                    <p className="mt-3 font-michroma text-[9px] uppercase text-white/50">
                      Top Traits
                    </p>
                    <div className="mt-1 flex flex-col gap-1">
                      {getPlayerInsights(player).traits.map((trait) => (
                        <p
                          key={trait.label}
                          className="font-michroma text-[9px] text-white/70"
                        >
                          - {trait.label}
                        </p>
                      ))}
                    </div>

                    {/* Go to players' card button */}
                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/players?player=${encodeURIComponent(player.name)}`,
                        );
                      }}
                      className="mt-3 w-full cursor-pointer rounded border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma font-bold text-[12px] uppercase tracking-wide text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
                    >
                      View Full Card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
