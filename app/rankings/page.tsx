"use client";

import Image from "next/image";
import {
  players,
  getPlayerInsights,
  normalizeStat,
  statMaxValues,
} from "../components/court-data";
import { useState } from "react";

type RankingTab =
  | "overall"
  | "scoring"
  | "shooting"
  | "playmaking"
  | "rebounding"
  | "efficiency"
  | "archetypes";

const rankingTabs: { label: string; value: RankingTab }[] = [
  { label: "Overall", value: "overall" },
  { label: "Scoring", value: "scoring" },
  { label: "Shooting", value: "shooting" },
  { label: "Playmaking", value: "playmaking" },
  { label: "Rebounding", value: "rebounding" },
  { label: "Efficiency", value: "efficiency" },
  { label: "Archetypes", value: "archetypes" },
];

function getRankingScore(player: (typeof players)[number], tab: RankingTab) {
  if (tab === "scoring") {
    return normalizeStat(player.stats.ppg, statMaxValues.ppg);
  }

  if (tab === "shooting") {
    return (
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent) *
        0.55 +
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent) * 0.25 +
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent) * 0.2
    );
  }

  if (tab === "playmaking") {
    return normalizeStat(player.stats.apg, statMaxValues.apg);
  }

  if (tab === "rebounding") {
    return normalizeStat(player.stats.rpg, statMaxValues.rpg);
  }

  if (tab === "efficiency") {
    return (
      normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent) * 0.5 +
      normalizeStat(player.stats.threePercent, statMaxValues.threePercent) *
        0.25 +
      normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent) * 0.25
    );
  }

  return (
    normalizeStat(player.stats.ppg, statMaxValues.ppg) * 0.3 +
    normalizeStat(player.stats.rpg, statMaxValues.rpg) * 0.18 +
    normalizeStat(player.stats.apg, statMaxValues.apg) * 0.18 +
    normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent) * 0.16 +
    normalizeStat(player.stats.threePercent, statMaxValues.threePercent) *
      0.12 +
    normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent) * 0.06
  );
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<RankingTab>("overall");

  const rankedPlayers = [...players].sort(
    (a, b) => getRankingScore(b, activeTab) - getRankingScore(a, activeTab),
  );

  const topThreePlayers = rankedPlayers.slice(0, 3);
  const activeTabLabel =
    rankingTabs.find((tab) => tab.value === activeTab)?.label ?? "Overall";

  return (
    <main className="min-h-screen overflow-hidden text-white overflow-y-auto">
      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        {/* Ranking tabs */}
        <div className="mt-8 flex w-full items-end gap-2 overflow-x-auto border-b border-[#1bc2ec]/30 pb-0">
          {rankingTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
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
              Top {activeTabLabel} Players
            </h1>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {topThreePlayers.map((player, index) => {
                const rankLabel =
                  index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
                const archetype = getPlayerInsights(player).archetype;
                const rating = getRankingScore(player, activeTab).toFixed(1);

                return (
                  <div
                    key={player.id}
                    className="relative overflow-hidden rounded-md border border-[#1bc2ec]/30 bg-black/40 px-4 py-4 transition-all duration-200 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-michroma text-xs font-bold text-[#1bc2ec]">
                          {rankLabel}
                        </p>

                        <p className="mt-2 truncate font-michroma text-sm text-white">
                          {player.name}
                        </p>

                        {archetype && (
                          <p className="mt-1 truncate font-michroma text-[10px] text-[#EFBF04]">
                            {archetype.label}
                          </p>
                        )}

                        <p className="mt-1 font-michroma text-[10px] text-white/50">
                          {player.team} - {player.position}
                        </p>
                      </div>

                      <p className="font-michroma text-xl font-bold text-white">
                        {rating}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-center">
                      <Image
                        src={player.image}
                        alt={player.name}
                        width={120}
                        height={120}
                        className="h-28 w-28 rounded-md object-cover"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-2 grid grid-cols-[56px_1fr_64px_64px] items-center px-3 font-michroma text-[9px] uppercase tracking-wide text-white/40">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Team</span>
            <span className="text-right">Rating</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {rankedPlayers.slice(3).map((player, index) => {
              const archetype = getPlayerInsights(player).archetype;
              const rating = getRankingScore(player, activeTab).toFixed(1);

              return (
                <div
                  key={player.id}
                  className="grid grid-cols-[56px_1fr_64px_64px] items-center rounded-md border border-white/10 bg-black/30 px-3 py-2 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10"
                >
                  <span className="font-michroma text-xs font-bold text-[#1bc2ec]">
                    #{index + 4}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-michroma text-xs text-white">
                      {player.name}
                    </p>

                    {archetype && (
                      <p className="mt-0.5 truncate font-michroma text-[9px] text-[#EFBF04]">
                        {archetype.label}
                      </p>
                    )}

                    <p className="mt-0.5 font-michroma text-[9px] text-white/40">
                      {player.position} - #{player.jerseyNumber}
                    </p>
                  </div>

                  <span className="text-right font-michroma text-[11px] text-white/60">
                    {player.team}
                  </span>

                  <span className="text-right font-michroma text-xs font-bold text-white">
                    {rating}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
