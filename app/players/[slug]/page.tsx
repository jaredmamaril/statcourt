"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "../../lib/use-auth-user";
import { DatabaseErrorState } from "../../components/loading/database-error-state";
import { DatabaseLoadingState } from "../../components/loading/database-loading-state";
import {
  getSavedBuilderDraft,
} from "../../components/players/player-storage";
import { useCompareSlots } from "../../components/players/use-compare-slots";
import { useFavoritePlayers } from "../../components/players/use-favorite-players";
import { getBestLineupFits } from "../../components/players/player-lineup-fits";
import { lineupFitDescriptions } from "../../components/players/player-card/player-card-similar-panel";
import {
  getInsightRarityStyles,
  getLineupFitStyles,
  getPlayerNameTextClass,
} from "../../components/players/player-style-helpers";
import {
  getPlayerInsights,
  getReadableTeamColor,
  getSimilarPlayers,
  getTeamColor,
  players as fallbackPlayers,
  type LineupSlot,
  type Player,
  type PlayerStatProfile,
  type StatMode,
} from "../../components/court-data";
import PlayerImage from "../../components/player-image";
import { getPlayerHeadshot } from "../../components/player-images";
import {
  getCareerLegacyTier,
  getPlayerRating,
  getStarPowerTier,
  type PlayerRatingCategory,
} from "../../components/player-ratings";

const statModeLabels: Record<StatMode, string> = {
  career: "Career",
  peak: "3-Year Peak",
  current: "Latest Season",
};

const builderSlots: LineupSlot[] = ["PG", "SG", "SF", "PF", "C"];

function normalizeSlug(value: string) {
  return decodeURIComponent(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStatsByMode(player: Player, statMode: StatMode) {
  if (statMode === "peak") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (statMode === "current") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

function getProfileLabel(profile?: PlayerStatProfile | null) {
  if (!profile?.seasonLabel) return null;

  return profile.seasonLabel;
}

function formatNumber(value: number | null | undefined, fallback = "--") {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;

  return value.toFixed(1);
}

export default function PlayerProfilePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthUser();
  const { compareSlots, updateCompareSlots } = useCompareSlots(user);
  const { favorites: favoritePlayers, toggleFavorite } =
    useFavoritePlayers(user);
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const [statMode, setStatMode] = useState<StatMode>("career");
  const [isBuildSlotModalOpen, setIsBuildSlotModalOpen] = useState(false);
  const [builderDraft, setBuilderDraft] = useState<Record<LineupSlot, string>>(
    getSavedBuilderDraft,
  );
  const [openLineupFitTooltip, setOpenLineupFitTooltip] = useState<
    string | null
  >(null);

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
        console.error("Failed to load profile players", error);

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
    const frameId = requestAnimationFrame(() => {
      setBuilderDraft(getSavedBuilderDraft());
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const player = useMemo(() => {
    const requestedSlug = normalizeSlug(params.slug);

    return players.find((candidate) => {
      return (
        normalizeSlug(candidate.name) === requestedSlug ||
        candidate.name.toLowerCase() ===
          decodeURIComponent(params.slug).toLowerCase()
      );
    });
  }, [params.slug, players]);

  const stats = player ? getStatsByMode(player, statMode) : null;
  const teamColor = player ? getTeamColor(player.team) : "#1bc2ec";
  const readableTeamColor = player
    ? getReadableTeamColor(player.team)
    : "#1bc2ec";
  const profileLabel =
    player && statMode === "peak"
      ? getProfileLabel(player.statProfiles?.peak)
      : player && statMode === "current"
        ? getProfileLabel(player.statProfiles?.current)
        : player
          ? getProfileLabel(player.statProfiles?.career)
          : null;

  const insights = player ? getPlayerInsights(player, statMode) : null;
  const similarPlayers = player
    ? getSimilarPlayers(player, players, 4, statMode)
    : [];
  const bestLineupFits = player ? getBestLineupFits(player, statMode) : [];

  const ratingCategory =
    statMode === "peak"
      ? "peakOverall"
      : statMode === "current"
        ? "currentOverall"
        : "careerOverall";

  const overall = player
    ? getPlayerRating(player, ratingCategory, statMode)
    : 0;
  const careerLegacy = player?.ratings.careerLegacy ?? 0;
  const starPower = player?.ratings.starPower ?? 0;
  const ratingBreakdown: {
    label: string;
    category: PlayerRatingCategory;
    value: number;
    color: string;
  }[] = player
    ? [
        {
          label: `${statModeLabels[statMode]} OVR`,
          category: ratingCategory,
          value: overall,
          color: teamColor,
        },
        {
          label: "Scoring",
          category: "scoring",
          value: getPlayerRating(player, "scoring", statMode),
          color: "#F97316",
        },
        {
          label: "Shooting",
          category: "shooting",
          value: getPlayerRating(player, "shooting", statMode),
          color: "#A855F7",
        },
        {
          label: "Playmaking",
          category: "playmaking",
          value: getPlayerRating(player, "playmaking", statMode),
          color: "#1bc2ec",
        },
        {
          label: "Rebounding",
          category: "rebounding",
          value: getPlayerRating(player, "rebounding", statMode),
          color: "#22C55E",
        },
        {
          label: "Efficiency",
          category: "efficiency",
          value: getPlayerRating(player, "efficiency", statMode),
          color: "#38BDF8",
        },
        {
          label: "Defense",
          category: "defense",
          value: getPlayerRating(player, "defense", statMode),
          color: "#EFBF04",
        },
        {
          label: "Star Power",
          category: "starPower",
          value: getPlayerRating(player, "starPower", statMode),
          color: "#F43F5E",
        },
        {
          label: "Career Legacy",
          category: "careerLegacy",
          value: getPlayerRating(player, "careerLegacy", statMode),
          color: "#EFBF04",
        },
      ]
    : [];
  const isFavorite = player ? favoritePlayers.includes(player.name) : false;

  function comparePlayer(slot: "left" | "right") {
    if (!player) return;

    void updateCompareSlots({
      ...compareSlots,
      [slot]: player.name,
    });

    router.push("/court");
  }

  function toggleFavoritePlayer() {
    if (!player) return;

    void toggleFavorite(player.name);
  }

  function openBuildSlotModal() {
    if (!player) return;

    setBuilderDraft(getSavedBuilderDraft());
    setIsBuildSlotModalOpen(true);
  }

  function buildWithPlayer(slot: LineupSlot) {
    if (!player) return;

    router.push(
      `/lineups?tab=builder&player=${encodeURIComponent(player.name)}&slot=${slot}`,
    );
  }

  return (
    <main className="page-enter relative min-h-screen overflow-x-hidden bg-background px-3 pb-10 pt-3 text-white lg:px-6 lg:pt-10">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
        }}
      />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-white/25 bg-white/8 px-3 py-2 font-michroma text-[8px] uppercase text-white/75 shadow-[0_0_12px_rgba(255,255,255,0.08)] transition hover:scale-[1.02] hover:border-white/45 hover:bg-white/12 hover:text-white lg:px-4 lg:text-[10px]"
          >
            Back
          </button>

          <Link
            href="/players"
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/16 px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] shadow-[0_0_14px_rgba(27,194,236,0.16)] transition hover:scale-[1.02] hover:bg-[#1bc2ec]/24 lg:px-4 lg:text-[10px]"
          >
            Browse Players
          </Link>
        </div>

        {isLoadingPlayers ? (
          <DatabaseLoadingState
            title="Loading Player Profile"
            description="Syncing career, peak, and latest season data..."
          />
        ) : !player ? (
          <div className="mx-auto mt-8 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-center">
            <p className="font-michroma text-sm uppercase text-red-200">
              Player Not Found
            </p>
            <p className="mt-3 font-michroma text-[9px] leading-relaxed text-white/45">
              This player is not available in the current StatCourt database.
            </p>
          </div>
        ) : (
          <>
            {playerLoadError && (
              <DatabaseErrorState
                title="Profile Data Limited"
                description="Showing fallback player data."
              />
            )}

            <div
              className="rounded-lg border bg-[#06131d]/86 p-2.5 shadow-[0_0_22px_rgba(27,194,236,0.12)] lg:p-6"
              style={{
                borderColor: `${teamColor}55`,
              }}
            >
              <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                <div className="text-center lg:text-left">
                  <div
                    className="mx-auto h-34 w-34 overflow-hidden rounded-lg border bg-black/30 sm:h-42 sm:w-42 lg:mx-0 lg:h-64 lg:w-64"
                    style={{
                      borderColor: `${teamColor}99`,
                    }}
                  >
                    <PlayerImage
                      src={getPlayerHeadshot(player)}
                      alt={player.name}
                      width={360}
                      height={360}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap justify-center gap-1.5 font-michroma text-[7px] uppercase sm:text-[8px] lg:mt-4 lg:justify-start lg:gap-2 lg:text-xs">
                    <span
                      className="rounded border px-2 py-1 text-white lg:px-3 lg:py-1.5"
                      style={{
                        backgroundColor: readableTeamColor,
                        borderColor: readableTeamColor,
                      }}
                    >
                      {player.team}
                    </span>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/60 lg:px-3 lg:py-1.5">
                      {player.position}
                    </span>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white/60 lg:px-3 lg:py-1.5">
                      #{player.jerseyNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] sm:text-[8px] lg:text-[10px]">
                    Player Profile
                  </p>

                  <h1
                    className={`mt-1.5 font-michroma text-[17px] uppercase leading-tight sm:text-3xl lg:mt-2 lg:text-6xl ${getPlayerNameTextClass(
                      player.name,
                    )}`}
                    style={{
                      color: teamColor,
                      textShadow: `0 0 18px ${teamColor}55`,
                    }}
                  >
                    {player.name}
                  </h1>

                  <div className="mt-2 inline-flex rounded-md border border-white/10 bg-black/25 p-0.5 lg:mt-3">
                    {(["career", "peak", "current"] as const).map((mode) => {
                      const isActive = statMode === mode;

                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setStatMode(mode)}
                          className={`rounded px-2 py-1 font-michroma text-[7px] uppercase transition lg:px-3 lg:text-[9px] ${
                            isActive
                              ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                              : "text-white/35 hover:bg-white/5 hover:text-white/70"
                          }`}
                        >
                          {statModeLabels[mode]}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-1.5 font-michroma text-[7px] uppercase text-white/35 sm:text-[8px] lg:mt-2 lg:text-[10px]">
                    {profileLabel ?? `${statModeLabels[statMode]} Profile`}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-3 lg:gap-2">
                    <div className="flex overflow-hidden rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/16 shadow-[0_0_14px_rgba(27,194,236,0.16)]">
                      <button
                        type="button"
                        onClick={() => comparePlayer("left")}
                        className="px-2.5 py-1.5 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/24 lg:px-3 lg:text-[9px]"
                      >
                        Left Compare
                      </button>
                      <button
                        type="button"
                        onClick={() => comparePlayer("right")}
                        className="border-l border-[#1bc2ec]/35 px-2.5 py-1.5 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/24 lg:px-3 lg:text-[9px]"
                      >
                        Right Compare
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={toggleFavoritePlayer}
                      className="rounded-md border border-[#EFBF04]/55 bg-[#EFBF04]/12 px-2.5 py-1.5 font-michroma text-[7px] uppercase text-[#EFBF04] shadow-[0_0_14px_rgba(239,191,4,0.12)] transition hover:scale-[1.03] hover:bg-[#EFBF04]/20 lg:px-3 lg:text-[9px]"
                    >
                      {isFavorite ? "Favorited" : "Add Favorite"}
                    </button>

                    <button
                      type="button"
                      onClick={openBuildSlotModal}
                      className="rounded-md border border-white/20 bg-white/8 px-2.5 py-1.5 font-michroma text-[7px] uppercase text-white/70 transition hover:scale-[1.03] hover:border-white/35 hover:bg-white/12 hover:text-white lg:px-3 lg:text-[9px]"
                    >
                      Build With Player
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 lg:mt-4 lg:max-w-2xl lg:gap-3">
                    <StatBox
                      label="OVR"
                      value={overall.toFixed(1)}
                      color={teamColor}
                    />
                    <StatBox
                      label="Legacy"
                      value={careerLegacy.toFixed(1)}
                      color="#EFBF04"
                    />
                    <StatBox
                      label="Star"
                      value={starPower.toFixed(0)}
                      color="#1bc2ec"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1.5 lg:mt-3 lg:max-w-2xl lg:gap-3">
                    <StatBox label="PPG" value={formatNumber(stats?.ppg)} />
                    <StatBox label="RPG" value={formatNumber(stats?.rpg)} />
                    <StatBox label="APG" value={formatNumber(stats?.apg)} />
                    <StatBox
                      label="FG%"
                      value={formatNumber(stats?.fgPercent)}
                    />
                    <StatBox
                      label="3PT%"
                      value={formatNumber(stats?.threePercent)}
                    />
                    <StatBox
                      label="FT%"
                      value={formatNumber(stats?.ftPercent)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-4">
                <section className="rounded-lg border border-white/10 bg-black/25 p-3 lg:p-5">
                  <p className="font-michroma text-[9px] uppercase text-[#1bc2ec] lg:text-xs">
                    Ratings Breakdown
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-3 lg:gap-2">
                    {ratingBreakdown.map((rating) => {
                      const displayValue =
                        rating.value > 0 ? rating.value.toFixed(1) : "--";
                      const barWidth = Math.max(0, Math.min(rating.value, 100));

                      return (
                        <div
                          key={rating.category}
                          className="rounded-md border border-white/10 bg-black/25 p-1.5 lg:p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-michroma text-[6px] uppercase text-white/45 lg:text-[9px]">
                              {rating.label}
                            </p>
                            <p
                              className="font-michroma text-[8px] lg:text-xs"
                              style={{ color: rating.color }}
                            >
                              {displayValue}
                            </p>
                          </div>

                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10 lg:mt-2 lg:h-1.5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: rating.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-black/25 p-2.5 lg:p-5">
                  <p className="font-michroma text-[8px] uppercase text-[#1bc2ec] lg:text-xs">
                    Scouting Identity
                  </p>

                  <div className="mt-2 grid gap-1.5 lg:mt-3 lg:grid-cols-2 lg:gap-2">
                    <InfoCard
                      title="Career Legacy"
                      value={getCareerLegacyTier(careerLegacy)}
                      description={`${careerLegacy.toFixed(1)} legacy score`}
                      color="#EFBF04"
                    />
                    <InfoCard
                      title="Star Power"
                      value={getStarPowerTier(starPower)}
                      description={`${starPower.toFixed(0)} star score`}
                      color="#1bc2ec"
                    />
                  </div>

                  {insights?.archetype && (
                    <div className="mt-2.5 lg:mt-3">
                      <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[9px]">
                        Archetype
                      </p>
                      <div
                        className="mt-1.5 rounded-md border bg-black/25 p-2 lg:mt-2 lg:p-3"
                        style={getInsightRarityStyles(insights.archetype, true)}
                      >
                        <p className="font-michroma text-xs uppercase lg:text-lg">
                          {insights.archetype.label}
                        </p>
                        <p className="mt-1.5 font-michroma text-[7px] leading-relaxed text-white/60 lg:mt-2 lg:text-[10px]">
                          {insights.archetype.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {insights && insights.traits.length > 0 && (
                    <div className="mt-3 lg:mt-4">
                      <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[9px]">
                        Traits
                      </p>
                      <div className="mt-1.5 grid gap-1.5 lg:mt-2 lg:grid-cols-2 lg:gap-2">
                        {insights.traits.slice(0, 4).map((trait) => (
                          <div
                            key={trait.label}
                            className="rounded-md border bg-black/25 p-1.5 lg:p-2"
                            style={getInsightRarityStyles(trait)}
                          >
                            <p className="font-michroma text-[8px] uppercase lg:text-xs">
                              {trait.label}
                            </p>
                            <p className="mt-1 font-michroma text-[6px] leading-relaxed text-white/55 lg:text-[9px]">
                              {trait.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="grid gap-4">
                <section className="rounded-lg border border-white/10 bg-black/25 p-3 lg:p-5">
                  <p className="font-michroma text-[9px] uppercase text-[#1bc2ec] lg:text-xs">
                    Similar Players
                  </p>
                  <div className="mt-3 grid gap-2">
                    {similarPlayers.map((match) => {
                      const matchTeamColor = getTeamColor(match.player.team);

                      return (
                        <Link
                          key={match.player.id}
                          href={`/players/${encodeURIComponent(match.player.name)}`}
                          className="flex items-center justify-between rounded-md border px-3 py-2 font-michroma text-[8px] transition brightness-150 hover:scale-[1.02] lg:text-[10px]"
                          style={{
                            borderColor: `${matchTeamColor}55`,
                            color: matchTeamColor,
                            backgroundColor: `${matchTeamColor}35`,
                          }}
                        >
                          <span>{match.player.name}</span>
                          <span>{match.matchScore}%</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-black/25 p-3 lg:p-5">
                  <p className="font-michroma text-[9px] uppercase text-[#1bc2ec] lg:text-xs">
                    Best Lineup Fits
                  </p>
                  <div className="mt-3 grid gap-2">
                    {bestLineupFits.map((fit) => {
                      const isTooltipOpen = openLineupFitTooltip === fit;

                      return (
                        <div
                          key={fit}
                          className={`group/lineupFit relative ${
                            isTooltipOpen ? "z-40" : "z-10"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenLineupFitTooltip((current) =>
                                current === fit ? null : fit,
                              )
                            }
                            onFocus={() => setOpenLineupFitTooltip(fit)}
                            onBlur={() => setOpenLineupFitTooltip(null)}
                            className="w-full cursor-help rounded-md border bg-black/20 px-3 py-2 text-left font-michroma text-[8px] transition hover:scale-[1.02] lg:text-[10px]"
                            style={getLineupFitStyles(fit)}
                          >
                            {fit}
                          </button>

                          <div
                            className={`pointer-events-none absolute bottom-full right-10 z-50 mb-1 w-44 max-w-[calc(100vw-2rem)] rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[6px] leading-relaxed text-white/80 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 lg:w-60 lg:p-3 lg:text-[8px] ${
                              isTooltipOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover/lineupFit:opacity-100"
                            }`}
                          >
                            {lineupFitDescriptions[fit] ??
                              "Recommended lineup fit based on this player's selected statistical profile."}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </section>

      {player && isBuildSlotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-3 pt-16 lg:pt-24"
          onMouseDown={() => setIsBuildSlotModalOpen(false)}
        >
          <div
            className="w-full max-w-82 rounded-lg border border-[#1bc2ec]/40 bg-[#06131d] p-3 shadow-[0_0_26px_rgba(27,194,236,0.16)] lg:max-w-md lg:p-5"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="font-michroma text-[9px] uppercase text-[#1bc2ec] lg:text-xs">
              Build With Player
            </p>

            <p className="mt-1 font-michroma text-sm uppercase text-white lg:text-xl">
              {player.name}
            </p>

            <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/45 lg:text-[9px]">
              Choose where to place this player. If a slot already has someone,
              that player will be replaced.
            </p>

            <div className="mt-3 grid gap-2">
              {builderSlots.map((slot) => {
                const currentSlotPlayer = builderDraft[slot];
                const isRecommended =
                  (player.position === "G" && (slot === "PG" || slot === "SG")) ||
                  (player.position === "F" && (slot === "SF" || slot === "PF")) ||
                  (player.position === "C" && (slot === "C" || slot === "PF"));

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => buildWithPlayer(slot)}
                    className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-white/10 bg-black/25 px-2.5 py-2 text-left transition hover:scale-[1.02] hover:border-[#1bc2ec]/55 hover:bg-[#1bc2ec]/10 lg:grid-cols-[44px_minmax(0,1fr)_auto] lg:px-3"
                  >
                    <span className="font-michroma text-[9px] text-[#1bc2ec] lg:text-xs">
                      {slot}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-michroma text-[8px] text-white lg:text-[10px]">
                        {currentSlotPlayer || "Empty Slot"}
                      </span>
                      <span className="block font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                        {currentSlotPlayer ? "Replace current player" : "Add here"}
                      </span>
                    </span>

                    {isRecommended && (
                      <span className="rounded border border-[#EFBF04]/45 bg-[#EFBF04]/10 px-1.5 py-1 font-michroma text-[6px] uppercase text-[#EFBF04] lg:text-[7px]">
                        Fit
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsBuildSlotModalOpen(false)}
              className="mt-3 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 font-michroma text-[8px] uppercase text-white/55 transition hover:border-white/30 hover:bg-white/10 hover:text-white lg:text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatBox({
  label,
  value,
  color = "#FFFFFF",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-2 text-center lg:p-3">
      <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
        {label}
      </p>
      <p className="mt-1 font-michroma text-sm lg:text-xl" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="rounded-md border bg-black/25 p-2 lg:p-3"
      style={{ borderColor: `${color}55` }}
    >
      <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[9px]">
        {title}
      </p>
      <p
        className="mt-1 font-michroma text-[10px] uppercase lg:text-sm"
        style={{ color }}
      >
        {value}
      </p>
      <p className="mt-1 font-michroma text-[6px] text-white/45 lg:text-[9px]">
        {description}
      </p>
    </div>
  );
}
