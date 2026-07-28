"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getPlayerInsights, type Player } from "../../components/court-data";
import { LineupBadgeIcon } from "../../components/lineups/shared/lineup-style-helpers";
import { supabase } from "../../components/supabase-client";

type PublicProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  public_profile_enabled: boolean | null;
  created_at: string | null;
};

type FavoritePlayerRow = {
  player_name: string;
};

type PublicFavoritePlayer = {
  name: string;
  nbaId: number | null;
  team: string | null;
  position: string | null;
  fallbackImage: string | null;
  archetype: string | null;
};

type PublicLineupGrades = Partial<
  Record<
    "offense" | "defense" | "shooting" | "playmaking" | "rebounding",
    string
  >
>;

type PublicSavedLineupRow = {
  id: string;
  name: string;
  stat_profile: string | null;
  overall: number | null;
  archetype: string | null;
  team_identity: string | null;
  x_factor_name: string | null;
  x_factor_description: string | null;
  similar_to: string | null;
  similar_to_description: string | null;
  summary: string | null;
  tier: string | null;
  court_balance: string | null;
  badges: string[] | null;
  strengths: string[] | null;
  grades: PublicLineupGrades | null;
  players: Record<string, string> | null;
};

const PUBLIC_FAVORITE_PREVIEW_LIMIT = 5;
const MAX_PUBLIC_FAVORITE_PLAYERS = 50;
const PUBLIC_LINEUP_SLOT_ORDER = ["PG", "SG", "SF", "PF", "C"] as const;

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) return "Member";

  return `Member since ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt))}`;
}

function formatStatProfile(profile: string | null) {
  if (profile === "peak") return "3-Year Peak";
  if (profile === "current") return "Latest Season";
  return "Career";
}

function getMostCommonValue(values: (string | null)[]) {
  const counts = new Map<string, number>();

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function getPublicFavoriteHeadshot(player: PublicFavoritePlayer) {
  if (player.nbaId) {
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nbaId}.png`;
  }

  return player.fallbackImage;
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = useMemo(
    () => decodeURIComponent(params.username ?? "").replace(/^@+/, ""),
    [params.username],
  );
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [favoritePlayers, setFavoritePlayers] = useState<string[]>([]);
  const [favoritePlayerDetails, setFavoritePlayerDetails] = useState<
    PublicFavoritePlayer[]
  >([]);
  const [publicPlayersByName, setPublicPlayersByName] = useState<
    Record<string, PublicFavoritePlayer>
  >({});
  const [isShowingAllFavorites, setIsShowingAllFavorites] = useState(false);
  const [publicLineups, setPublicLineups] = useState<PublicSavedLineupRow[]>(
    [],
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [isTopArchetypeOpen, setIsTopArchetypeOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPublicProfile() {
      setIsLoadingProfile(true);
      setProfileError("");

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          "id, display_name, username, avatar_url, public_profile_enabled, created_at",
        )
        .eq("username", username)
        .eq("public_profile_enabled", true)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.warn("Failed to load public profile", error);
        setProfile(null);
        setFavoritePlayers([]);
        setFavoritePlayerDetails([]);
        setPublicPlayersByName({});
        setProfileError("Could not load this profile.");
        setIsLoadingProfile(false);
        return;
      }

      const publicProfile = (data as PublicProfile | null) ?? null;

      if (!publicProfile) {
        setProfile(null);
        setFavoritePlayers([]);
        setFavoritePlayerDetails([]);
        setPublicPlayersByName({});
        setIsLoadingProfile(false);
        return;
      }

      const { data: favoriteRows, error: favoriteError } = await supabase
        .from("favorite_players")
        .select("player_name")
        .eq("user_id", publicProfile.id)
        .order("created_at", { ascending: false })
        .limit(MAX_PUBLIC_FAVORITE_PLAYERS);

      const { data: lineupRows, error: lineupError } = await supabase
        .from("saved_lineups")
        .select(
          "id, name, stat_profile, overall, archetype, team_identity, x_factor_name, x_factor_description, similar_to, similar_to_description, summary, tier, court_balance, badges, strengths, grades, players",
        )
        .eq("user_id", publicProfile.id)
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .limit(4);

      if (!isActive) return;

      if (favoriteError) {
        console.warn("Failed to load public favorite players", favoriteError);
      }

      if (lineupError) {
        console.warn("Failed to load public saved lineups", lineupError);
      }

      const favoriteNames = (
        (favoriteRows as FavoritePlayerRow[] | null) ?? []
      ).map((favoritePlayer) => favoritePlayer.player_name);
      const publicLineupRows =
        (lineupRows as PublicSavedLineupRow[] | null) ?? [];
      const publicLineupPlayerNames = publicLineupRows.flatMap((lineup) =>
        Object.values(lineup.players ?? {}).filter(Boolean),
      );
      const publicPlayerNames = Array.from(
        new Set([...favoriteNames, ...publicLineupPlayerNames]),
      );

      let favoriteDetails: PublicFavoritePlayer[] = [];
      let playerDetailsByName: Record<string, PublicFavoritePlayer> = {};

      if (publicPlayerNames.length > 0) {
        const playerResponse = await fetch("/api/players", {
          cache: "no-store",
        });

        const playerData = playerResponse.ok
          ? ((await playerResponse.json()) as { players?: Player[] })
          : { players: [] };

        const detailsByName = new Map(
          (playerData.players ?? []).map((favoritePlayer) => [
            favoritePlayer.name,
            {
              name: favoritePlayer.name,
              nbaId: favoritePlayer.nbaId ?? null,
              team: favoritePlayer.team,
              position: favoritePlayer.position,
              fallbackImage: favoritePlayer.fallbackImage ?? null,
              archetype:
                getPlayerInsights(favoritePlayer, "career").archetype?.label ??
                null,
            },
          ]),
        );

        playerDetailsByName = Object.fromEntries(detailsByName);
        favoriteDetails = favoriteNames.map(
          (favoriteName) =>
            detailsByName.get(favoriteName) ?? {
              name: favoriteName,
              nbaId: null,
              team: null,
              position: null,
              fallbackImage: null,
              archetype: null,
            },
          );
      }

      if (!isActive) return;

      setProfile(publicProfile);
      setFavoritePlayers(favoriteNames);
      setFavoritePlayerDetails(favoriteDetails);
      setPublicPlayersByName(playerDetailsByName);
      setIsShowingAllFavorites(false);
      setPublicLineups(publicLineupRows);
      setIsLoadingProfile(false);
    }

    if (!username) {
      const timeoutId = window.setTimeout(() => {
        if (!isActive) return;

        setProfile(null);
        setFavoritePlayers([]);
        setFavoritePlayerDetails([]);
        setPublicPlayersByName({});
        setIsShowingAllFavorites(false);
        setPublicLineups([]);
        setProfileError("Profile not found.");
        setIsLoadingProfile(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    loadPublicProfile();

    return () => {
      isActive = false;
    };
  }, [username]);

  const displayName = profile?.display_name ?? profile?.username ?? "StatCourt";
  const accountInitial = displayName.trim().charAt(0).toUpperCase() || "S";
  const favoritePlayerArchetype =
    getMostCommonValue(
      favoritePlayerDetails.map((favoritePlayer) => favoritePlayer.archetype),
    ) ?? "Not enough favorite data";
  const publicLineupArchetype =
    getMostCommonValue(publicLineups.map((lineup) => lineup.archetype)) ??
    "Not enough public data";
  const preferredStatProfile =
    getMostCommonValue(publicLineups.map((lineup) => lineup.stat_profile)) ??
    "career";
  const visibleFavoritePlayers = isShowingAllFavorites
    ? favoritePlayerDetails
    : favoritePlayerDetails.slice(0, PUBLIC_FAVORITE_PREVIEW_LIMIT);
  const hasMoreFavoritePlayers =
    favoritePlayerDetails.length > PUBLIC_FAVORITE_PREVIEW_LIMIT;
  const hiddenFavoritePlayerCount = Math.max(
    favoritePlayerDetails.length - PUBLIC_FAVORITE_PREVIEW_LIMIT,
    0,
  );
  const featuredPublicLineup =
    [...publicLineups].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0] ??
    null;
  const remainingPublicLineups = featuredPublicLineup
    ? publicLineups.filter((lineup) => lineup.id !== featuredPublicLineup.id)
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--court-panel-alt)] px-4 py-6 text-white lg:px-8 lg:py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "var(--court-pattern)",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/players"
          className="inline-flex rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:text-[10px]"
        >
          Browse Players
        </Link>

        <div className="mt-5 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_85%,transparent)] p-4 shadow-[0_0_26px_rgba(0,0,0,0.28)] lg:mt-8 lg:p-7">
          {isLoadingProfile ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="h-8 w-8 animate-spin rounded-full border border-[rgb(var(--court-accent-rgb)/0.2)] border-t-[var(--court-accent)]" />
              <p className="mt-4 font-michroma text-[9px] uppercase text-white/45 lg:text-xs">
                Loading Profile
              </p>
            </div>
          ) : profile ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-black/30 text-[var(--court-accent)] lg:h-26 lg:w-26">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt=""
                        fill
                        sizes="104px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-michroma text-xl lg:text-3xl">
                        {accountInitial}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-michroma text-[7px] uppercase tracking-wide text-[var(--court-accent)] lg:text-[10px]">
                      Public Profile
                    </p>

                    <h1 className="mt-1 truncate font-michroma text-2xl uppercase text-white lg:text-3xl">
                      {displayName}
                    </h1>

                    <p className="mt-1 font-michroma text-[9px] text-white/45 lg:text-xs">
                      @{profile.username}
                    </p>

                    <p className="mt-2 max-w-xl font-michroma text-[8px] leading-relaxed text-white/50 lg:mt-3 lg:text-[10px]">
                      StatCourt profile built around public lineups, favorite
                      players, and scouting identity.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-2 py-1 font-michroma text-[6px] uppercase text-[var(--court-accent)] lg:text-[8px]">
                        Lineup Builder
                      </span>

                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-michroma text-[6px] uppercase text-white/45 lg:text-[8px]">
                        {favoritePlayerArchetype}
                      </span>

                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-michroma text-[6px] uppercase text-white/45 lg:text-[8px]">
                        {formatStatProfile(preferredStatProfile)}
                      </span>

                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-michroma text-[6px] uppercase text-white/45 lg:text-[8px]">
                        {formatMemberSince(profile.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-5 grid grid-cols-4 gap-1.5 rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[rgb(var(--court-accent-rgb)/0.06)] p-1.5 shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.08)] lg:mt-7 lg:gap-3 lg:p-3">
                <div className="min-h-14 rounded border border-[#A855F7]/35 bg-[#A855F7]/12 p-1.5 text-center shadow-[inset_0_0_18px_rgba(168,85,247,0.08)] lg:min-h-24 lg:p-3">
                  <p className="font-michroma text-sm text-[#A855F7] lg:text-2xl">
                    {favoritePlayers.length}
                  </p>
                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Favorite Players
                  </p>
                </div>

                <div className="relative min-h-14 rounded border border-[#A855F7]/30 bg-[#A855F7]/10 p-1.5 text-center shadow-[inset_0_0_18px_rgba(168,85,247,0.08)] lg:min-h-24 lg:p-3">
                  <button
                    type="button"
                    onClick={() => setIsTopArchetypeOpen((current) => !current)}
                    className="mx-auto block max-w-18 font-michroma text-[7px] leading-tight text-white transition hover:text-[#A855F7] sm:max-w-30 sm:text-[8px] lg:max-w-36 lg:cursor-default lg:text-xs"
                    aria-expanded={isTopArchetypeOpen}
                  >
                    <span className="line-clamp-2">
                      {favoritePlayerArchetype}
                    </span>
                  </button>

                  {isTopArchetypeOpen && (
                    <div className="absolute left-1/2 z-30 mt-1 w-28 -translate-x-1/2 rounded border border-white/15 bg-black/90 px-1.5 py-1 text-center shadow-[0_0_10px_rgba(168,85,247,0.35)] lg:hidden">
                      <p className="font-michroma text-[6px] leading-snug text-white/85">
                        {favoritePlayerArchetype}
                      </p>
                    </div>
                  )}

                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Most Common
                    <br />
                    Player Archetype
                  </p>
                </div>

                <div className="min-h-14 rounded border border-[rgb(var(--court-accent-rgb)/0.32)] bg-[rgb(var(--court-accent-rgb)/0.12)] p-1.5 text-center shadow-[inset_0_0_18px_rgb(var(--court-accent-rgb)/0.08)] lg:min-h-24 lg:p-3">
                  <p className="font-michroma text-sm text-[var(--court-accent)] lg:text-2xl">
                    {publicLineups.length}
                  </p>
                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Public Lineup{publicLineups.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="relative min-h-14 rounded border border-[rgb(var(--court-accent-rgb)/0.26)] bg-[color:color-mix(in_srgb,var(--court-accent)_14%,var(--court-panel))] p-1.5 text-center shadow-[inset_0_0_18px_rgb(var(--court-accent-rgb)/0.08)] lg:min-h-24 lg:p-3">
                  <p className="mx-auto line-clamp-2 max-w-18 font-michroma text-[7px] leading-tight text-white sm:max-w-30 sm:text-[8px] lg:max-w-36 lg:text-xs">
                    {publicLineupArchetype}
                  </p>

                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Most Common
                    <br />
                    Lineup Archetype
                  </p>
                </div>
              </div>

              {featuredPublicLineup && (
                <div className="mt-4 rounded-lg border border-[#EFBF04]/45 bg-[color:color-mix(in_srgb,var(--court-panel)_92%,black)] p-3 shadow-[0_0_26px_rgba(239,191,4,0.1)] lg:mt-6 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-5 lg:p-5">
                  <div>
                    <p className="font-michroma text-[7px] uppercase tracking-wide text-[#EFBF04] lg:text-[9px]">
                      Featured Lineup
                    </p>

                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-michroma text-lg uppercase text-white lg:text-2xl">
                          {featuredPublicLineup.name}
                        </h2>

                        <p className="mt-1 font-michroma text-[8px] uppercase text-[#EFBF04] lg:text-[10px]">
                          {featuredPublicLineup.archetype ??
                            "Public StatCourt Build"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-michroma text-2xl text-[#EFBF04] lg:text-4xl">
                          {featuredPublicLineup.overall?.toFixed(1) ?? "--"}
                        </p>
                        <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                          OVR
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded border border-white/15 bg-white/8 px-2 py-1 font-michroma text-[6px] uppercase text-white/55 lg:text-[8px]">
                        {formatStatProfile(featuredPublicLineup.stat_profile)}
                      </span>

                      {featuredPublicLineup.tier && (
                        <span className="rounded border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[color:color-mix(in_srgb,var(--court-accent)_24%,var(--court-panel-alt))] px-2 py-1 font-michroma text-[6px] uppercase text-[var(--court-accent)] lg:text-[8px]">
                          {featuredPublicLineup.tier}
                        </span>
                      )}

                      {featuredPublicLineup.court_balance && (
                        <span className="rounded border border-white/15 bg-white/8 px-2 py-1 font-michroma text-[6px] uppercase text-white/55 lg:text-[8px]">
                          {featuredPublicLineup.court_balance}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 font-michroma text-[7px] leading-relaxed text-white/55 lg:text-[9px]">
                      {featuredPublicLineup.summary ??
                        featuredPublicLineup.team_identity ??
                        "Public lineup built through StatCourt scouting."}
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-md border border-white/10 bg-black/25 p-2">
                        <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                          Strengths
                        </p>
                        <div className="mt-1.5 grid grid-cols-2 gap-1">
                          {(featuredPublicLineup.strengths?.length
                            ? featuredPublicLineup.strengths
                            : ["Lineup Identity"]
                          )
                            .slice(0, 4)
                            .map((strength) => (
                              <span
                                key={strength}
                                className="min-w-0 truncate rounded border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-center font-michroma text-[5.5px] uppercase text-emerald-300 lg:text-[6px]"
                              >
                                {strength}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-md border border-white/10 bg-black/25 p-2">
                        <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                          Team Grades
                        </p>
                        <div className="mt-1.5 grid min-w-0 grid-cols-2 gap-x-2 gap-y-1 font-michroma text-[5.5px] uppercase text-white/45 lg:text-[6px]">
                          {Object.entries(featuredPublicLineup.grades ?? {})
                            .slice(0, 5)
                            .map(([gradeLabel, grade]) => (
                              <p
                                key={gradeLabel}
                                className="flex min-w-0 items-center justify-between gap-1"
                              >
                                <span className="min-w-0 truncate">
                                  {gradeLabel}
                                </span>
                                <span className="shrink-0 text-white">
                                  {grade}
                                </span>
                              </p>
                            ))}

                          {Object.keys(featuredPublicLineup.grades ?? {})
                            .length === 0 && (
                            <p className="col-span-2 text-white/35">
                              No grades public yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {featuredPublicLineup.badges &&
                      featuredPublicLineup.badges.length > 0 && (
                        <div className="statcourt-scroll mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
                          {featuredPublicLineup.badges.slice(0, 5).map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex shrink-0 items-center gap-1 rounded border border-[#EFBF04]/25 bg-[#EFBF04]/10 px-1.5 py-0.5 font-michroma text-[5px] uppercase text-[#EFBF04] lg:text-[6px]"
                            >
                              <LineupBadgeIcon badge={badge} />
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:mt-4">
                      <div className="min-w-0 rounded-md border border-[#EFBF04]/25 bg-[#EFBF04]/8 p-2">
                        <p className="font-michroma text-[5.5px] uppercase text-white/35 lg:text-[7px]">
                          Team Identity
                        </p>
                        <p className="mt-1 truncate font-michroma text-[7px] uppercase text-[#EFBF04] lg:text-[8px]">
                          {featuredPublicLineup.team_identity ??
                            "Identity Developing"}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-md border border-[rgb(var(--court-accent-rgb)/0.28)] bg-[rgb(var(--court-accent-rgb)/0.08)] p-2">
                        <p className="font-michroma text-[5.5px] uppercase text-white/35 lg:text-[7px]">
                          X-Factor
                        </p>
                        <p className="mt-1 truncate font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-[8px]">
                          {featuredPublicLineup.x_factor_name ?? "Not Set"}
                        </p>
                        {featuredPublicLineup.x_factor_description && (
                          <p className="mt-1 line-clamp-2 font-michroma text-[5.5px] leading-relaxed text-white/45 lg:text-[6px]">
                            {featuredPublicLineup.x_factor_description}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0 rounded-md border border-white/10 bg-black/25 p-2">
                        <p className="font-michroma text-[5.5px] uppercase text-white/35 lg:text-[7px]">
                          Similar To
                        </p>
                        <p className="mt-1 truncate font-michroma text-[7px] uppercase text-white lg:text-[8px]">
                          {featuredPublicLineup.similar_to ?? "No Match Yet"}
                        </p>
                        {featuredPublicLineup.similar_to_description && (
                          <p className="mt-1 line-clamp-2 font-michroma text-[5.5px] leading-relaxed text-white/45 lg:text-[6px]">
                            {featuredPublicLineup.similar_to_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-2 lg:mt-0 lg:p-3">
                    <p className="font-michroma text-[7px] uppercase text-white/35 lg:text-[9px]">
                      Court Preview
                    </p>

                    <div className="mt-2 grid gap-2">
                      {PUBLIC_LINEUP_SLOT_ORDER.map((slot) => {
                        const playerName = featuredPublicLineup.players?.[slot];
                        const playerDetail = playerName
                          ? publicPlayersByName[playerName]
                          : null;
                        const previewPlayer = playerDetail ?? {
                          name: playerName ?? "Empty",
                          nbaId: null,
                          team: null,
                          position: null,
                          fallbackImage: null,
                          archetype: null,
                        };

                        return (
                          <div
                            key={slot}
                            className="grid grid-cols-[24px_36px_minmax(0,1fr)] items-center gap-2 rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-1.5 lg:grid-cols-[30px_44px_minmax(0,1fr)] lg:p-2"
                          >
                            <p className="font-michroma text-[8px] text-[#EFBF04] lg:text-[10px]">
                              {slot}
                            </p>

                            <div className="relative h-9 w-9 overflow-hidden rounded bg-white/8 lg:h-11 lg:w-11">
                              {getPublicFavoriteHeadshot(previewPlayer) ? (
                                <Image
                                  src={
                                    getPublicFavoriteHeadshot(previewPlayer) ??
                                    "/blank-player.svg"
                                  }
                                  alt=""
                                  fill
                                  sizes="144px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-michroma text-[8px] text-white/45">
                                  {previewPlayer.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-michroma text-[8px] text-white lg:text-[10px]">
                                {previewPlayer.name}
                              </p>
                              <p className="mt-0.5 font-michroma text-[5.5px] uppercase text-white/35 lg:text-[7px]">
                                {previewPlayer.team ?? "FA"}{" "}
                                {previewPlayer.position
                                  ? `- ${previewPlayer.position}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 rounded-md border border-[#A855F7]/25 bg-black/20 p-3 lg:mt-4 lg:p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-[#A855F7] lg:h-4 lg:w-4" />
                  <p className="font-michroma text-[8px] uppercase text-white/40 lg:text-[10px]">
                    Favorite Players
                  </p>
                </div>

                {favoritePlayerDetails.length > 0 ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {visibleFavoritePlayers.map((favoritePlayer) => (
                        <div
                          key={favoritePlayer.name}
                          className="grid w-[calc(50%-0.25rem)] grid-cols-[30px_minmax(0,1fr)] items-center gap-2 rounded-md border border-[#A855F7]/30 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-1.5 lg:w-36 lg:grid-cols-[34px_minmax(0,1fr)] lg:p-2"
                        >
                          <div className="relative h-7.5 w-7.5 overflow-hidden rounded bg-[#A855F7]/15 lg:h-8.5 lg:w-8.5">
                            {getPublicFavoriteHeadshot(favoritePlayer) ? (
                              <Image
                                src={
                                  getPublicFavoriteHeadshot(favoritePlayer) ??
                                  "/blank-player.svg"
                                }
                                alt=""
                                fill
                                sizes="144px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-michroma text-[9px] text-[#A855F7]">
                                {favoritePlayer.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-michroma text-[7px] text-white lg:text-[9px]">
                              {favoritePlayer.name}
                            </p>
                            <p className="mt-0.5 truncate font-michroma text-[5px] uppercase text-white/40 lg:text-[7px]">
                              {favoritePlayer.team ?? "FA"}{" "}
                              {favoritePlayer.position
                                ? `- ${favoritePlayer.position}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}

                      {!isShowingAllFavorites &&
                        hiddenFavoritePlayerCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsShowingAllFavorites(true)}
                            className="flex w-[calc(50%-0.25rem)] items-center justify-center rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 p-2 font-michroma text-[9px] text-[#A855F7] transition hover:bg-[#A855F7]/20 lg:w-18 lg:text-xs"
                          >
                            +{hiddenFavoritePlayerCount}
                          </button>
                        )}
                    </div>

                    {hasMoreFavoritePlayers && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsShowingAllFavorites((current) => !current)
                        }
                        className="mt-3 rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 px-3 py-1.5 font-michroma text-[6px] uppercase text-[#A855F7] transition hover:bg-[#A855F7]/20 lg:text-[8px]"
                      >
                        {isShowingAllFavorites
                          ? "Show Fewer"
                          : "View All Favorites"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="mt-2 font-michroma text-[8px] text-white/55 lg:text-xs">
                    No public favorites yet.
                  </p>
                )}
              </div>

              {remainingPublicLineups.length > 0 && (
                <div className="mt-5 lg:mt-7">
                  <p className="font-michroma text-[8px] uppercase text-white/40 lg:text-[10px]">
                    More Public Lineups
                  </p>

                  <div className="mt-2 grid gap-2 lg:mt-3 lg:grid-cols-2">
                    {remainingPublicLineups.map((lineup) => (
                      <div
                        key={lineup.id}
                        className="rounded-md border border-[#EFBF04]/25 bg-black/20 p-3 transition hover:border-[#EFBF04]/50 hover:bg-[#171407]/70 lg:p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-michroma text-[10px] text-white lg:text-sm">
                              {lineup.name}
                            </p>

                            <p className="mt-1 font-michroma text-[7px] uppercase text-[#EFBF04] lg:text-[9px]">
                              {lineup.archetype ?? "Saved Lineup"}
                            </p>
                          </div>

                          <p className="shrink-0 font-michroma text-base text-[#EFBF04] lg:text-2xl">
                            {lineup.overall?.toFixed(1) ?? "--"}
                          </p>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded border border-white/10 bg-white/5 px-2 py-1 font-michroma text-[6px] uppercase text-white/45 lg:text-[8px]">
                            {formatStatProfile(lineup.stat_profile)}
                          </span>

                          {lineup.tier && (
                            <span className="rounded border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-2 py-1 font-michroma text-[6px] uppercase text-[var(--court-accent)] lg:text-[8px]">
                              {lineup.tier}
                            </span>
                          )}

                          {lineup.court_balance && (
                            <span className="rounded border border-white/10 bg-white/5 px-2 py-1 font-michroma text-[6px] uppercase text-white/45 lg:text-[8px]">
                              {lineup.court_balance}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-michroma text-[7px] text-white/55 lg:text-[9px]">
                          {lineup.summary ??
                            lineup.team_identity ??
                            "Public StatCourt build"}
                        </p>

                        <p className="mt-2 truncate font-michroma text-[6px] text-white/35 lg:text-[8px]">
                          {Object.values(lineup.players ?? {})
                            .filter(Boolean)
                            .join(" - ")}
                        </p>

                        {lineup.badges && lineup.badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lineup.badges.slice(0, 3).map((badge) => (
                              <span
                                key={badge}
                                className="rounded border border-[#EFBF04]/25 bg-[#EFBF04]/10 px-1.5 py-0.5 font-michroma text-[5.5px] uppercase text-[#EFBF04] lg:text-[7px]"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-black/25 text-white/40">
                <Lock className="h-6 w-6" />
              </div>

              <h1 className="mt-5 font-michroma text-lg uppercase text-white lg:text-3xl">
                Profile Not Found
              </h1>

              <p className="mt-3 max-w-md font-michroma text-[8px] leading-relaxed text-white/45 lg:text-xs">
                {profileError ||
                  "This StatCourt profile is private, disabled, or does not exist."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
