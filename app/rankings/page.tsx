"use client";

import Image from "next/image";
import {
  players,
  positions,
  teams,
  getPlayerInsights,
  normalizeStat,
  statMaxValues,
  teamColors,
  teamLogos,
} from "../components/court-data";
import type {
  Team,
  Position,
  PlayerInsightDisplay,
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

// Types for archetype description safety
type ArchetypeRarity = PlayerInsightDisplay["rarity"];
type ArchetypeMetadata = {
  description: string;
  coreTraits: string[];
  rarity: ArchetypeRarity;
};
// Archetype descriptions
const archetypeInfoByLabel = {
  "Generational Shooter": {
    description:
      "Transforms offensive spacing through elite perimeter shooting and high-volume scoring gravity.",
    coreTraits: [
      "Elite Perimeter Shooter",
      "Automatic at the Line",
      "Scoring Gravity",
    ],
    rarity: "gold",
  },
  "Generational Scorer": {
    description:
      "Produces all-time scoring volume and bends defensive game plans through constant shot pressure.",
    coreTraits: [
      "Elite Shot Creator",
      "High-Usage Offensive Focus",
      "Scoring Volume",
    ],
    rarity: "gold",
  },
  "Generational Creator": {
    description:
      "Controls possessions through elite passing vision, offensive command, and teammate creation.",
    coreTraits: ["Floor General", "Elite Playmaker", "Offense Orchestrator"],
    rarity: "gold",
  },
  "Triple-Double Machine": {
    description:
      "Impacts every phase of the game through scoring, rebounding, and playmaking production.",
    coreTraits: [
      "All-Around Production",
      "Elite Playmaker",
      "Strong Rebounding Impact",
    ],
    rarity: "purple",
  },
  "Interior Anchor": {
    description:
      "Controls the paint through rebounding, interior efficiency, and physical presence.",
    coreTraits: ["Dominant Rebounder", "Paint Presence", "Interior Efficiency"],
    rarity: "purple",
  },
  "Historic Rebounding": {
    description:
      "Creates a historic possession advantage through elite rebounding dominance.",
    coreTraits: ["Dominant Rebounder", "Second-Chance Value", "Paint Control"],
    rarity: "purple",
  },
  "Paint Dominator": {
    description:
      "Controls the interior through scoring, rebounding, and efficient finishing.",
    coreTraits: [
      "Dominant Rebounder",
      "Efficient Finisher",
      "Interior Scoring",
    ],
    rarity: "blue",
  },
  "Primary Scoring Engine": {
    description:
      "Carries offensive volume through elite shot creation and scoring pressure.",
    coreTraits: [
      "Elite Shot Creator",
      "Reliable Offensive Threat",
      "High-Usage Offensive Focus",
    ],
    rarity: "blue",
  },
  "Two-Way Threat": {
    description:
      "Pairs star-level scoring with major physical impact through rebounding and matchup versatility.",
    coreTraits: ["Scoring Pressure", "Rebounding Impact", "Versatile Profile"],
    rarity: "blue",
  },
  "Floor General": {
    description:
      "Runs the offense through elite passing, pace control, and efficient decision-making.",
    coreTraits: ["Elite Playmaker", "Offensive Control", "Decision-Making"],
    rarity: "blue",
  },
  "Balanced Star": {
    description:
      "Contributes across scoring, rebounding, playmaking, and efficiency without relying on one skill.",
    coreTraits: [
      "Versatile Production",
      "Efficient Scoring",
      "All-Around Impact",
    ],
    rarity: "blue",
  },
  "Post-Up Specialist": {
    description:
      "Creates offense from interior touches, physical positioning, and efficient close-range scoring.",
    coreTraits: ["Interior Scoring", "Efficient Finisher", "Paint Touches"],
    rarity: "blue",
  },
  "Stretch Big": {
    description:
      "Combines frontcourt size and rebounding with floor-spacing shooting value.",
    coreTraits: ["Floor Spacing", "Frontcourt Skill", "Rebounding Presence"],
    rarity: "blue",
  },
  "Volume Scorer": {
    description:
      "Carries a heavy scoring workload through shot volume, even without elite efficiency.",
    coreTraits: ["Scoring Volume", "Shot Creation", "High Usage"],
    rarity: "blue",
  },
  "Pure Point Guard": {
    description:
      "Creates value primarily through passing, tempo control, and organizing team offense.",
    coreTraits: ["Passing Control", "Floor General", "Team Creation"],
    rarity: "blue",
  },
  "Elite Shot Creator": {
    description:
      "Generates high-level scoring chances while maintaining strong offensive efficiency.",
    coreTraits: ["Shot Creation", "Scoring Pressure", "Self-Created Offense"],
    rarity: "blue",
  },
  "Elite Scorer": {
    description:
      "Produces star-level points with enough efficiency to lead an offense.",
    coreTraits: [
      "Scoring Volume",
      "Reliable Offensive Threat",
      "Shot Pressure",
    ],
    rarity: "blue",
  },
} satisfies Record<string, ArchetypeMetadata>;

export default function Rankings() {
  // Current filter being used
  const [openFilter, setOpenFilter] = useState<
    "era" | "position" | "team" | "archetype" | null
  >(null);
  // Different states for filters
  const [eraFilter, setEraFilter] = useState("all-time");
  const [positionFilter, setPositionFilter] = useState<Position | "">("");
  const [teamFilter, setTeamFilter] = useState<Team | "">("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  // Get archetypes available
  const archetypeOptions = Array.from(
    new Set(
      players
        .map((player) => getPlayerInsights(player).archetype?.label)
        .filter((label): label is string => Boolean(label)),
    ),
  ).sort();
  // Color for archetype options in dropdown
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
  // For displaying rarity color in main screen
  const selectedArchetypeOption = archetypeOptionDetails.find(
    (option) => option.label === archetypeFilter,
  );
  // For border rarity color in main screen
  const selectedArchetypeColor = selectedArchetypeOption?.archetype
    ? getArchetypePillStyle(selectedArchetypeOption.archetype).color
    : undefined;

  // Router to travel to players page
  const router = useRouter();

  // Current tab, default is overall tab
  const [activeTab, setActiveTab] = useState<RankingTab>("overall");

  // Filter out players based on search
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

  // Get ranked players from highest rated to lowest based on category and filter
  const rankedPlayers = [...filteredPlayers].sort(
    (a, b) => getRankingScore(b, activeTab) - getRankingScore(a, activeTab),
  );

  const topThreePlayers = rankedPlayers.slice(0, 3);

  // Filter players based on archetype chosen
  const selectedArchetypePlayers = archetypeFilter
    ? players
        .filter(
          (player) =>
            getPlayerInsights(player).archetype?.label === archetypeFilter,
        )
        .sort(
          (a, b) =>
            getRankingScore(b, "overall") - getRankingScore(a, "overall"),
        )
    : [];

  // Get info depending on which archetype is chosen
  const selectedArchetypeInfo =
    archetypeFilter in archetypeInfoByLabel
      ? archetypeInfoByLabel[
          archetypeFilter as keyof typeof archetypeInfoByLabel
        ]
      : undefined;

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
            {/* If current tab is archetypes */}
            {activeTab === "archetypes" ? (
              <div>
                <div>
                  <h1 className="font-michroma text-sm uppercase tracking-wide text-white">
                    Archetypes
                  </h1>
                </div>

                {/* All archetypes available */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {archetypeOptionDetails.map(({ label, archetype }) => {
                    const isSelected = archetypeFilter === label;
                    const archetypeColor = archetype
                      ? getArchetypePillStyle(archetype).color
                      : "#94A3B8";

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setArchetypeFilter(label)}
                        className="rounded-md border bg-black/30 px-3 py-3 text-left font-michroma text-xs transition hover:bg-white/10"
                        style={{
                          color: archetypeColor,
                          borderColor: isSelected
                            ? archetypeColor
                            : "rgba(255,255,255,0.12)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Archetype description */}
                {archetypeFilter && (
                  <div className="mt-6 rounded-md border border-white/10 bg-black/30 p-4">
                    <h2 className="font-michroma text-sm uppercase tracking-wide text-white">
                      {archetypeFilter}
                    </h2>

                    <p className="mt-3 font-michroma text-xs leading-relaxed text-white/60">
                      {selectedArchetypeInfo?.description ??
                        "A player identity class based on this player's strongest statistical profile."}
                    </p>

                    <div className="mt-5">
                      <p className="font-michroma text-[10px] uppercase text-white/40">
                        Core Traits
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(
                          selectedArchetypeInfo?.coreTraits ?? [
                            "Statistical Identity",
                          ]
                        ).map((trait) => (
                          <span
                            key={trait}
                            className="rounded border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 px-2 py-1 font-michroma text-[10px] text-[#1bc2ec]"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* List of players in chosen archetype */}
                <div className="mt-4">
                  <h2 className="font-michroma text-sm uppercase tracking-wide text-white">
                    Top Players In Selected Archetype
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
                  {selectedArchetypePlayers.length === 0 ? (
                    <p className="font-michroma text-xs text-white/40">
                      Select an archetype to view players.
                    </p>
                  ) : (
                    selectedArchetypePlayers.map((player, index) => {
                      const rating = getRankingScore(player, "overall").toFixed(
                        1,
                      );

                      return (
                        <div
                          key={player.id}
                          className="group relative grid w-full grid-cols-[44px_40px_1fr_52px_56px] items-center rounded-md border border-white/10 bg-black/30 px-3 py-2 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10"
                        >
                          <span className="font-michroma text-xs text-[#1bc2ec]">
                            #{index + 1}
                          </span>

                          <Image
                            src={player.image}
                            alt={player.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover -ml-5"
                          />

                          <div className="min-w-0 -ml-3">
                            <p className="truncate font-michroma text-xs text-white">
                              {player.name}
                            </p>
                            <p
                              className="mt-0.5 font-michroma text-[9px]"
                              style={{ color: teamColors[player.team] }}
                            >
                              {player.team}
                            </p>
                            <p className="mt-0.5 font-michroma text-[9px] text-white/40">
                              {player.position} - #{player.jerseyNumber}
                            </p>
                          </div>

                          {/* Overall score */}
                          <span className="text-right font-michroma text-xs font-bold text-white">
                            {rating}
                          </span>

                          {/* Tooltip for stats and card viewing */}
                          <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                            <p className="font-michroma text-[10px] font-bold text-white">
                              {player.name}
                            </p>

                            <p className="mt-2 font-michroma text-[9px] text-[#1bc2ec]">
                              Overall Rating: {rating}
                            </p>

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

                            <button
                              type="button"
                              onClick={() => {
                                router.push(
                                  `/players?player=${encodeURIComponent(
                                    player.name,
                                  )}`,
                                );
                              }}
                              className="mt-3 w-full cursor-pointer rounded border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma font-bold text-[12px] uppercase tracking-wide text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
                            >
                              View Full Card
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-michroma text-sm uppercase tracking-wide text-white">
                  {rankingHeading}
                </h1>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center justify-start gap-2 mt-2">
                  {/* Era filter */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFilter(openFilter === "era" ? null : "era")
                      }
                      className="flex min-w-28 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
                    >
                      <span>
                        {eraFilter === "all-time" ? "All-Time" : eraFilter}
                      </span>
                      <span className="text-[#1bc2ec]">▾</span>
                    </button>

                    {openFilter === "era" && (
                      <div className="absolute left-0 top-full z-80 mt-2 w-full rounded-md border border-white/20 bg-[#07111f] py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEraFilter("all-time");
                            setOpenFilter(null);
                          }}
                          className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                            eraFilter === "all-time"
                              ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          All-Time
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Position filter */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFilter(
                          openFilter === "position" ? null : "position",
                        )
                      }
                      className={`flex cursor-pointer items-center gap-3 rounded-md border font-michroma text-xs transition ${
                        positionFilter
                          ? "w-18 border-[#1bc2ec] bg-[#1bc2ec]/10 px-3 py-1 text-[#1bc2ec]"
                          : "w-40 border-white/20 bg-black/30 px-3 py-1 text-white/60 hover:border-white/60"
                      }`}
                    >
                      <span className="flex-1 text-left">
                        {positionFilter || "All Positions"}
                      </span>
                      <span className="shrink-0 text-[#1bc2ec]">▾</span>
                    </button>

                    {openFilter === "position" && (
                      <div className="absolute left-0 top-full z-80 mt-2 max-h-80 w-34 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPositionFilter("");
                            setOpenFilter(null);
                          }}
                          className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                            positionFilter === ""
                              ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          All Positions
                        </button>

                        {positions.map((position) => (
                          <button
                            key={position}
                            type="button"
                            onClick={() => {
                              setPositionFilter(position);
                              setOpenFilter(null);
                            }}
                            className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                              positionFilter === position
                                ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                                : "text-white/70 hover:bg-white/10"
                            }`}
                          >
                            {position}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team filter */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFilter(openFilter === "team" ? null : "team")
                      }
                      className="flex min-w-32 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
                      style={{
                        color: teamFilter ? teamColors[teamFilter] : undefined,
                        borderColor: teamFilter
                          ? teamColors[teamFilter]
                          : undefined,
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {teamFilter && (
                          <Image
                            src={teamLogos[teamFilter]}
                            alt={`${teamFilter} logo`}
                            width={16}
                            height={16}
                            className="h-4 w-4 object-contain"
                          />
                        )}
                        <span>{teamFilter || "All Teams"}</span>
                      </span>
                      <span className="text-[#1bc2ec]">▾</span>
                    </button>

                    {openFilter === "team" && (
                      <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTeamFilter("");
                            setOpenFilter(null);
                          }}
                          className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                            teamFilter === ""
                              ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          All Teams
                        </button>

                        {teams.map((team) => (
                          <button
                            key={team}
                            type="button"
                            onClick={() => {
                              setTeamFilter(team);
                              setOpenFilter(null);
                            }}
                            className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                              teamFilter === team
                                ? "bg-[#1bc2ec]/20"
                                : "hover:bg-white/10"
                            }`}
                            style={{ color: teamColors[team] }}
                          >
                            <span className="flex items-center gap-2">
                              <Image
                                src={teamLogos[team]}
                                alt={`${team} logo`}
                                width={16}
                                height={16}
                                className="h-4 w-4 object-contain"
                              />
                              <span>{team}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Archetype filter */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFilter(
                          openFilter === "archetype" ? null : "archetype",
                        )
                      }
                      className="flex min-w-40 cursor-pointer items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white/70 transition hover:border-[#1bc2ec]/60"
                      style={{
                        borderColor: selectedArchetypeColor,
                      }}
                    >
                      <span
                        className="truncate"
                        style={{
                          color: selectedArchetypeOption?.archetype
                            ? getArchetypePillStyle(
                                selectedArchetypeOption.archetype,
                              ).color
                            : undefined,
                        }}
                      >
                        {archetypeFilter || "All Archetypes"}
                      </span>
                      <span className="text-[#1bc2ec]">▾</span>
                    </button>

                    {openFilter === "archetype" && (
                      <div className="absolute left-0 top-full z-80 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setArchetypeFilter("");
                            setOpenFilter(null);
                          }}
                          className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                            archetypeFilter === ""
                              ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          All Archetypes
                        </button>

                        {archetypeOptionDetails.map(({ label, archetype }) => {
                          const archetypeColor = archetype
                            ? getArchetypePillStyle(archetype).color
                            : undefined;

                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                setArchetypeFilter(label);
                                setOpenFilter(null);
                              }}
                              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs transition ${
                                archetypeFilter === label
                                  ? "bg-[#1bc2ec]/20"
                                  : "hover:bg-white/10"
                              }`}
                              style={{
                                color: archetypeColor,
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Player search */}
                  <input
                    value={playerSearch}
                    onChange={(event) => setPlayerSearch(event.target.value)}
                    placeholder="Search Player..."
                    className="min-w-44 rounded-md border border-white/20 bg-black/30 px-3 py-1 font-michroma text-xs text-white outline-none placeholder:text-[#2da6c4]/80 focus:border-[#1bc2ec]"
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {/* Top 3 players in section */}
                  {topThreePlayers.map((player, index) => {
                    const rankLabel =
                      index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
                    const archetype = getPlayerInsights(player).archetype;
                    const rating = getRankingScore(player, activeTab).toFixed(
                      1,
                    );
                    const rankColor =
                      index === 0
                        ? "#EFBF04"
                        : index === 1
                          ? "#C0C0C0"
                          : "#CD7F32";

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
                        <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
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
              </>
            )}
          </div>

          {activeTab !== "archetypes" && (
            <>
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
                      <div className="pointer-events-none absolute left-1/2 top-full z-100 w-64 -translate-x-1/2 rounded-md border border-[#1bc2ec]/40 bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto">
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
