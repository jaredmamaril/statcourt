"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Flag,
  Share2,
  Target,
  Lock,
  Star,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SkeletonBlock } from "../../components/loading/skeleton";
import { supabase } from "../../components/supabase-client";
import { getCachedApiPlayerProfileLookups } from "../../lib/player-api-cache";

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

type PublicFollowRow = {
  follower_id: string;
};

const PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT = 2;
const PUBLIC_FAVORITE_MOBILE_LOAD_STEP = 2;
const PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT = 4;
const PUBLIC_FAVORITE_DESKTOP_LOAD_STEP = 4;
const MAX_PUBLIC_FAVORITE_PLAYERS = 50;
const PUBLIC_LINEUP_SLOT_ORDER = ["PG", "SG", "SF", "PF", "C"] as const;
const reportReasons = [
  "Spam or misleading profile",
  "Harassment or abusive content",
  "Inappropriate public content",
  "Impersonation",
  "Other",
];

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

function getMostCommonValues(values: (string | null)[], limit: number) {
  const counts = new Map<string, number>();

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function formatIdentityPriority(values: string[]) {
  if (values.length === 0) return "Still developing";

  const normalizedValues = values.map((value) => value.toLowerCase());
  const has = (value: string) => normalizedValues.includes(value);

  if (has("offense") && has("defense")) return "Two-Way Balance";
  if (has("shooting") && has("star power")) return "Spacing and Star Power";
  if (has("playmaking") && has("rebounding")) {
    return "Playmaking and Interior Control";
  }
  if (has("rim pressure") && (has("playmaking") || has("rebounding"))) {
    return "Playmaking and Interior Control";
  }
  if (has("offense") && has("playmaking")) {
    return "Shot Creation and Playmaking";
  }
  if (has("offense") && has("shooting")) return "Shot Creation and Spacing";
  if (has("defense") && has("rebounding")) {
    return "Defensive Control and Glass";
  }

  if (values.length === 1) return values[0];

  return `${values[0]} and ${values[1]}`;
}

function getLineupStyleBadge(archetype: string) {
  const normalized = archetype.toLowerCase();

  if (normalized.includes("point-center")) return "Point-Center Specialist";
  if (normalized.includes("playmaking")) return "Playmaking First";
  if (normalized.includes("two-way")) return "Two-Way Builder";
  if (normalized.includes("defensive")) return "Defense-First Builder";
  if (normalized.includes("spacing") || normalized.includes("shooting")) {
    return "Spacing Architect";
  }
  if (normalized.includes("rim") || normalized.includes("paint")) {
    return "Paint Pressure Builder";
  }
  if (normalized.includes("star")) return "Star-Powered Builder";
  if (normalized.includes("positionless")) return "Positionless Builder";

  return "Lineup Identity";
}

function getFavoritePlayerBadge(archetype: string) {
  const normalized = archetype.toLowerCase();

  if (normalized.includes("scorer")) return "Scorer Collector";
  if (normalized.includes("playmaker") || normalized.includes("creator")) {
    return "Creator Collector";
  }
  if (normalized.includes("shooter") || normalized.includes("spacing")) {
    return "Shooter Collector";
  }
  if (normalized.includes("defensive") || normalized.includes("two-way")) {
    return "Two-Way Taste";
  }
  if (normalized.includes("big") || normalized.includes("rebound")) {
    return "Frontcourt Eye";
  }

  return "Player Identity";
}

function getPriorityBadge(priority: string) {
  const normalized = priority.toLowerCase();

  if (normalized.includes("two-way")) return "Two-Way Builder";
  if (normalized.includes("playmaking")) return "Playmaking First";
  if (normalized.includes("spacing")) return "Spacing First";
  if (normalized.includes("defensive")) return "Defense First";
  if (normalized.includes("shot creation")) return "Shot-Creation First";
  if (normalized.includes("interior") || normalized.includes("glass")) {
    return "Interior Control";
  }

  return "Identity Builder";
}

function getPublicFavoriteHeadshot(player: PublicFavoritePlayer) {
  if (player.nbaId) {
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nbaId}.png`;
  }

  return player.fallbackImage;
}

function PublicProfileSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-2.5 lg:gap-4">
          <SkeletonBlock className="h-13 w-13 shrink-0 rounded-md lg:h-26 lg:w-26" />

          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-2 w-24 lg:h-3 lg:w-36" />
            <SkeletonBlock className="mt-2 h-5 w-44 lg:h-8 lg:w-72" />
            <SkeletonBlock className="mt-2 h-2.5 w-28 lg:h-3 lg:w-40" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-5 w-24 rounded-md lg:h-7 lg:w-36"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 lg:gap-2">
          <SkeletonBlock className="h-7 w-20 rounded-md lg:h-9 lg:w-28" />
          <SkeletonBlock className="h-7 w-20 rounded-md lg:h-9 lg:w-28" />
          <SkeletonBlock className="h-7 w-18 rounded-md lg:h-9 lg:w-24" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:grid-cols-5 lg:gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="rounded-md border border-white/10 bg-black/20 p-2 lg:p-3"
          >
            <SkeletonBlock className="h-2.5 w-16 lg:h-3 lg:w-24" />
            <SkeletonBlock className="mt-2 h-4 w-10 lg:h-6 lg:w-14" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-black/20 p-3 lg:p-4">
          <SkeletonBlock className="h-3 w-32 lg:h-4 lg:w-48" />
          <SkeletonBlock className="mt-4 h-8 w-3/4 lg:h-10" />
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-14 rounded-md lg:h-20" />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-black/20 p-3 lg:p-4">
          <SkeletonBlock className="h-3 w-28 lg:h-4 lg:w-40" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-md lg:h-11 lg:w-11" />
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-2.5 w-36 lg:h-3 lg:w-48" />
                  <SkeletonBlock className="mt-1.5 h-2 w-20 lg:w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-[#A855F7]/25 bg-black/20 p-3 lg:p-4">
        <SkeletonBlock className="h-3 w-32 lg:h-4 lg:w-44" />
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-14 w-[calc((100%_-_0.5rem)/2)] rounded-md lg:h-16 lg:w-44"
            />
          ))}
        </div>
      </div>
    </div>
  );
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
  const [visibleMobileFavoriteLimit, setVisibleMobileFavoriteLimit] = useState(
    PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT,
  );
  const [visibleDesktopFavoriteLimit, setVisibleDesktopFavoriteLimit] =
    useState(PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT);
  const [publicLineups, setPublicLineups] = useState<PublicSavedLineupRow[]>(
    [],
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [isTopArchetypeOpen, setIsTopArchetypeOpen] = useState(false);
  const [isLineupStyleOpen, setIsLineupStyleOpen] = useState(false);
  const [isFavoriteArchetypesOpen, setIsFavoriteArchetypesOpen] =
    useState(false);
  const [openLineupIdentityTooltip, setOpenLineupIdentityTooltip] = useState<
    string | null
  >(null);
  const [profileActionStatus, setProfileActionStatus] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPublicProfile() {
      setIsLoadingProfile(true);
      setProfileError("");

      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, display_name, username, avatar_url, created_at")
        .eq("username", username)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.warn("Failed to load public profile", error);
        setProfile(null);
        setFavoritePlayers([]);
        setFavoritePlayerDetails([]);
        setPublicPlayersByName({});
        setCurrentUserId(null);
        setFollowerCount(0);
        setIsFollowingProfile(false);
        setProfileError("Could not load this profile.");
        setIsLoadingProfile(false);
        return;
      }

      const publicProfile = data
        ? ({
            ...(data as Omit<PublicProfile, "public_profile_enabled">),
            public_profile_enabled: true,
          } satisfies PublicProfile)
        : null;

      if (!publicProfile) {
        setProfile(null);
        setFavoritePlayers([]);
        setFavoritePlayerDetails([]);
        setPublicPlayersByName({});
        setCurrentUserId(null);
        setFollowerCount(0);
        setIsFollowingProfile(false);
        setIsLoadingProfile(false);
        return;
      }

      const [
        favoriteResponse,
        lineupResponse,
        authResponse,
        followerCountResponse,
      ] = await Promise.all([
        supabase
          .from("favorite_players")
          .select("player_name")
          .eq("user_id", publicProfile.id)
          .order("created_at", { ascending: false })
          .limit(MAX_PUBLIC_FAVORITE_PLAYERS),
        supabase
          .from("saved_lineups")
          .select(
            "id, name, stat_profile, overall, archetype, team_identity, x_factor_name, x_factor_description, similar_to, similar_to_description, summary, tier, court_balance, badges, strengths, grades, players",
          )
          .eq("user_id", publicProfile.id)
          .eq("is_public", true)
          .order("updated_at", { ascending: false })
          .limit(12),
        supabase.auth.getUser(),
        supabase
          .from("user_follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("following_id", publicProfile.id),
      ]);

      const { data: favoriteRows, error: favoriteError } = favoriteResponse;
      const { data: lineupRows, error: lineupError } = lineupResponse;
      const {
        data: { user },
      } = authResponse;
      const {
        count: nextFollowerCount,
        error: followerCountError,
      } = followerCountResponse;
      const currentViewerId = user?.id ?? null;

      const { data: followRows, error: followError } = currentViewerId
        ? await supabase
            .from("user_follows")
            .select("follower_id")
            .eq("follower_id", currentViewerId)
            .eq("following_id", publicProfile.id)
            .limit(1)
        : { data: [], error: null };

      if (!isActive) return;

      if (favoriteError) {
        console.warn("Failed to load public favorite players", favoriteError);
      }

      if (lineupError) {
        console.warn("Failed to load public saved lineups", lineupError);
      }

      if (followerCountError) {
        console.warn("Failed to load follower count", followerCountError);
      }

      if (followError) {
        console.warn("Failed to load follow state", followError);
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
        const loadedPlayers = await getCachedApiPlayerProfileLookups();

        const detailsByName = new Map(
          loadedPlayers.map((favoritePlayer) => [
            favoritePlayer.name,
            {
              name: favoritePlayer.name,
              nbaId: favoritePlayer.nbaId ?? null,
              team: favoritePlayer.team,
              position: favoritePlayer.position,
              fallbackImage: favoritePlayer.fallbackImage ?? null,
              archetype: favoritePlayer.archetype?.label ?? null,
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
      setCurrentUserId(currentViewerId);
      setFollowerCount(nextFollowerCount ?? 0);
      setIsFollowingProfile(
        ((followRows as PublicFollowRow[] | null) ?? []).length > 0,
      );
      setIsShowingAllFavorites(false);
      setVisibleMobileFavoriteLimit(PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT);
      setVisibleDesktopFavoriteLimit(PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT);
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
        setCurrentUserId(null);
        setFollowerCount(0);
        setIsFollowingProfile(false);
        setIsShowingAllFavorites(false);
        setVisibleMobileFavoriteLimit(PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT);
        setVisibleDesktopFavoriteLimit(PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT);
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
  const teamBuildingPriority = formatIdentityPriority(
    getMostCommonValues(
      publicLineups.flatMap((lineup) => lineup.strengths ?? []),
      2,
    ),
  );
  const lineupStyleBadge = getLineupStyleBadge(publicLineupArchetype);
  const favoritePlayerBadge = getFavoritePlayerBadge(favoritePlayerArchetype);
  const priorityBadge = getPriorityBadge(teamBuildingPriority);
  const favoriteIdentityArchetypes = getMostCommonValues(
    favoritePlayerDetails.map((favoritePlayer) => favoritePlayer.archetype),
    3,
  );
  const preferredStatProfile =
    getMostCommonValue(publicLineups.map((lineup) => lineup.stat_profile)) ??
    "career";
  const mobileFavoriteLimit = isShowingAllFavorites
    ? visibleMobileFavoriteLimit
    : PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT;
  const desktopFavoriteLimit = isShowingAllFavorites
    ? visibleDesktopFavoriteLimit
    : PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT;
  const visibleFavoritePlayers = favoritePlayerDetails.slice(
    0,
    Math.max(mobileFavoriteLimit, desktopFavoriteLimit),
  );
  const hasMoreFavoritePlayers =
    favoritePlayerDetails.length > PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT;
  const hiddenMobileFavoritePlayerCount = Math.max(
    favoritePlayerDetails.length - mobileFavoriteLimit,
    0,
  );
  const hiddenDesktopFavoritePlayerCount = Math.max(
    favoritePlayerDetails.length - desktopFavoriteLimit,
    0,
  );
  const displayedMobileHiddenFavoritePlayerCount = Math.min(
    hiddenMobileFavoritePlayerCount,
    PUBLIC_FAVORITE_MOBILE_LOAD_STEP,
  );
  const displayedDesktopHiddenFavoritePlayerCount = Math.min(
    hiddenDesktopFavoritePlayerCount,
    PUBLIC_FAVORITE_DESKTOP_LOAD_STEP,
  );
  const featuredPublicLineup =
    [...publicLineups].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0] ??
    null;
  const remainingPublicLineups = featuredPublicLineup
    ? publicLineups.filter((lineup) => lineup.id !== featuredPublicLineup.id)
    : [];

  async function copyPublicProfileLink() {
    const profileUrl =
      typeof window === "undefined" ? `/u/${username}` : window.location.href;

    await navigator.clipboard.writeText(profileUrl);
    setProfileActionStatus("Copied");
    window.setTimeout(() => setProfileActionStatus(""), 1600);
  }

  async function sharePublicProfile() {
    const profileUrl =
      typeof window === "undefined" ? `/u/${username}` : window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: `${displayName} on StatCourt`,
        text: `View ${displayName}'s StatCourt profile.`,
        url: profileUrl,
      });
      return;
    }

    await copyPublicProfileLink();
  }

  async function toggleFollowProfile() {
    if (!profile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfileActionStatus("Sign in to follow");
      window.setTimeout(() => setProfileActionStatus(""), 1800);
      return;
    }

    if (user.id === profile.id) {
      setProfileActionStatus("This is your profile");
      window.setTimeout(() => setProfileActionStatus(""), 1800);
      return;
    }

    setIsUpdatingFollow(true);
    setProfileActionStatus(isFollowingProfile ? "Unfollowing..." : "Following...");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setProfileActionStatus("Sign in again to follow");
      setIsUpdatingFollow(false);
      window.setTimeout(() => setProfileActionStatus(""), 1800);
      return;
    }

    const accessToken = session.access_token;
    const profileId = profile.id;

    async function updateFollow(nextIsFollowing: boolean) {
      const response = await fetch("/api/follows", {
        method: nextIsFollowing ? "POST" : "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: profileId,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      return {
        ok: response.ok,
        error: result.error,
      };
    }

    if (isFollowingProfile) {
      const result = await updateFollow(false);

      if (!result.ok) {
        setProfileActionStatus(result.error ?? "Could not update follow");
        setIsUpdatingFollow(false);
        return;
      }

      setIsFollowingProfile(false);
      setFollowerCount((currentCount) => Math.max(currentCount - 1, 0));
      setProfileActionStatus("Unfollowed");
      setIsUpdatingFollow(false);
      window.setTimeout(() => setProfileActionStatus(""), 1600);
      return;
    }

    const result = await updateFollow(true);

    if (!result.ok) {
      setProfileActionStatus(result.error ?? "Could not follow");
      setIsUpdatingFollow(false);
      return;
    }

    setCurrentUserId(user.id);
    setIsFollowingProfile(true);
    setFollowerCount((currentCount) => currentCount + 1);
    setProfileActionStatus("Following");
    setIsUpdatingFollow(false);
    window.setTimeout(() => setProfileActionStatus(""), 1600);
  }

  async function submitProfileReport() {
    if (!profile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setReportStatus("Sign in to report this profile.");
      return;
    }

    if (user.id === profile.id) {
      setReportStatus("You cannot report your own profile.");
      return;
    }

    setIsSubmittingReport(true);
    setReportStatus("Sending report...");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setReportStatus("Sign in again to report this profile.");
      setIsSubmittingReport(false);
      return;
    }

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportedUserId: profile.id,
        reportedUsername: profile.username,
        reason: reportReason,
        details: reportDetails.trim() || null,
      }),
    });

    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setReportStatus(result.error ?? "Could not send report.");
      setIsSubmittingReport(false);
      return;
    }

    setReportStatus("Report sent.");
    setReportDetails("");
    setIsSubmittingReport(false);
    window.setTimeout(() => {
      setIsReportOpen(false);
      setReportStatus("");
    }, 1200);
  }

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

        <div className="mt-4 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_85%,transparent)] p-3 shadow-[0_0_26px_rgba(0,0,0,0.28)] lg:mt-8 lg:p-7">
          {isLoadingProfile ? (
            <PublicProfileSkeleton />
          ) : profile ? (
            <>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-center gap-2.5 lg:gap-4">
                  <div className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-black/30 text-[var(--court-accent)] lg:h-26 lg:w-26">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt=""
                        fill
                        sizes="104px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-michroma text-base lg:text-3xl">
                        {accountInitial}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-michroma text-[5.5px] uppercase tracking-wide text-[var(--court-accent)] lg:text-[10px]">
                      Public Profile
                    </p>

                    <h1 className="mt-0.5 truncate font-michroma text-lg uppercase text-white lg:mt-1 lg:text-3xl">
                      {displayName}
                    </h1>

                    <p className="mt-0.5 font-michroma text-[7px] text-white/45 lg:mt-1 lg:text-xs">
                      @{profile.username}
                    </p>

                    <p className="mt-2 hidden max-w-xl font-michroma text-[8px] leading-relaxed text-white/50 lg:mt-3 lg:block lg:text-[10px]">
                      StatCourt profile built around public lineups, favorite
                      players, and scouting identity.
                    </p>

                    <div className="statcourt-scroll mt-1.5 flex max-w-[calc(100vw-6.5rem)] flex-nowrap gap-0.5 overflow-x-auto pb-1 lg:mt-2 lg:max-w-2xl lg:gap-1.5 lg:pb-0">
                      <span className="max-w-24 shrink-0 truncate rounded-md border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-1 py-0.5 font-michroma text-[4.5px] uppercase text-[var(--court-accent)] lg:max-w-44 lg:px-2 lg:py-1 lg:text-[7px]">
                        {lineupStyleBadge}
                      </span>

                      <span className="max-w-24 shrink-0 truncate rounded-md border border-[#A855F7]/25 bg-[#A855F7]/10 px-1 py-0.5 font-michroma text-[4.5px] uppercase text-[#C084FC] lg:max-w-44 lg:px-2 lg:py-1 lg:text-[7px]">
                        {favoritePlayerBadge}
                      </span>

                      <span className="max-w-24 shrink-0 truncate rounded-md border border-[#22C55E]/25 bg-[#22C55E]/10 px-1 py-0.5 font-michroma text-[4.5px] uppercase text-[#22C55E] lg:max-w-44 lg:px-2 lg:py-1 lg:text-[7px]">
                        {priorityBadge}
                      </span>

                      <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-1 py-0.5 font-michroma text-[4.5px] uppercase text-white/45 lg:px-2 lg:py-1 lg:text-[7px]">
                        {formatMemberSince(profile.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative flex shrink-0 flex-wrap gap-1.5 lg:justify-end">
                  <button
                    type="button"
                    onClick={sharePublicProfile}
                    className="inline-flex items-center gap-1 rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2 py-1.5 font-michroma text-[6px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.18)] hover:text-white lg:px-3 lg:py-2 lg:text-[8px]"
                  >
                    <Share2 className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    Share Profile
                  </button>

                  <button
                    type="button"
                    onClick={toggleFollowProfile}
                    disabled={isUpdatingFollow || currentUserId === profile.id}
                    className="inline-flex items-center gap-1 rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 px-2 py-1.5 font-michroma text-[6px] uppercase text-[#C084FC] transition hover:bg-[#A855F7]/20 hover:text-white lg:px-3 lg:py-2 lg:text-[8px]"
                  >
                    {isFollowingProfile ? (
                      <UserCheck className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    ) : (
                      <UserPlus className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    )}
                    {isFollowingProfile ? "Following" : "Follow"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsReportOpen(true);
                      setReportStatus("");
                    }}
                    disabled={currentUserId === profile.id}
                    className="inline-flex items-center gap-1 rounded-md border border-red-400/30 bg-red-400/10 px-2 py-1.5 font-michroma text-[6px] uppercase text-red-300 transition hover:bg-red-400/18 hover:text-white lg:px-3 lg:py-2 lg:text-[8px]"
                  >
                    <Flag className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    Report
                  </button>

                  {profileActionStatus && (
                    <p className="absolute right-0 top-full mt-1 font-michroma text-[5px] uppercase text-[var(--court-accent)] lg:text-[7px]">
                      {profileActionStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-1.5 rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[rgb(var(--court-accent-rgb)/0.06)] p-1.5 shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.08)] lg:mt-7 lg:gap-3 lg:p-3">
                <div className="min-h-14 rounded border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] p-1.5 text-center shadow-[inset_0_0_18px_rgb(var(--court-accent-rgb)/0.08)] lg:min-h-24 lg:p-3">
                  <p className="font-michroma text-sm text-[var(--court-accent)] lg:text-2xl">
                    {followerCount}
                  </p>
                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Followers
                  </p>
                </div>

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
                    Favorite Archetype
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
                  <button
                    type="button"
                    onClick={() => setIsLineupStyleOpen((current) => !current)}
                    className="mx-auto block max-w-18 font-michroma text-[7px] leading-tight text-white transition hover:text-[var(--court-accent)] sm:max-w-30 sm:text-[8px] lg:max-w-36 lg:cursor-default lg:text-xs"
                    aria-expanded={isLineupStyleOpen}
                  >
                    <span className="line-clamp-2">
                      {publicLineupArchetype}
                    </span>
                  </button>

                  {isLineupStyleOpen && (
                    <div className="absolute left-1/2 z-30 mt-1 w-28 -translate-x-1/2 rounded border border-white/15 bg-black/90 px-1.5 py-1 text-center shadow-[0_0_10px_rgb(var(--court-accent-rgb)/0.35)] lg:hidden">
                      <p className="font-michroma text-[6px] leading-snug text-white/85">
                        {publicLineupArchetype}
                      </p>
                    </div>
                  )}

                  <p className="mt-1 font-michroma text-[5px] uppercase leading-tight text-white/35 lg:text-[8px]">
                    Most-Used
                    <br />
                    Lineup Style
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[color:color-mix(in_srgb,var(--court-panel)_91%,black)] p-2 shadow-[0_0_22px_rgb(var(--court-accent-rgb)/0.08)] lg:mt-5 lg:p-4">
                <p className="font-michroma text-[7px] uppercase tracking-wide text-[var(--court-accent)] lg:text-[10px]">
                  Basketball Identity
                </p>

                <div className="mt-2 grid gap-1.5 lg:mt-3 lg:grid-cols-[1.2fr_1fr] lg:gap-2.5">
                  <div className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[color:color-mix(in_srgb,var(--court-accent)_16%,var(--court-panel))] p-2 shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.16)] lg:flex lg:min-h-36 lg:flex-col lg:justify-center lg:p-4">
                    <div className="flex items-center gap-1.5 lg:gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.12)] text-[var(--court-accent)] shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.18)] lg:h-10 lg:w-10">
                        <Target className="h-2.5 w-2.5 lg:h-5 lg:w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-michroma text-[5px] uppercase text-white/40 lg:text-[8px]">
                          Preferred Style
                        </p>
                        <p className="mt-0.5 line-clamp-2 font-michroma text-[8px] uppercase leading-tight text-[var(--court-accent)] [text-shadow:0_0_14px_rgb(var(--court-accent-rgb)/0.4)] lg:mt-1.5 lg:text-base lg:leading-relaxed">
                          {publicLineupArchetype}
                        </p>
                      </div>
                    </div>

                    <p className="hidden font-michroma leading-relaxed text-white/45 lg:mt-3 lg:block lg:max-w-md lg:text-[8px]">
                      Built from this profile public lineup archetypes and saved
                      scouting reports.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-1 lg:gap-1.5">
                    <div className="min-w-0 rounded-md border border-white/10 bg-black/25 p-1.5 lg:p-2.5">
                      <p className="font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
                        Team-Building Priority
                      </p>
                      <p className="mt-0.5 line-clamp-2 font-michroma text-[6px] uppercase leading-tight text-white lg:mt-1 lg:text-[8px] lg:leading-relaxed">
                        {teamBuildingPriority}
                      </p>
                    </div>

                    <div className="min-w-0 rounded-md border border-white/10 bg-black/25 p-1.5 lg:p-2.5">
                      <p className="font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
                        Most Used Stat Profile
                      </p>
                      <p className="mt-0.5 truncate font-michroma text-[6px] uppercase text-white lg:mt-1 lg:text-[8px]">
                        {formatStatProfile(preferredStatProfile)}
                      </p>
                    </div>

                    <div className="relative min-w-0 rounded-md border border-[#A855F7]/25 bg-[#A855F7]/8 p-1.5 lg:p-2.5">
                      <p className="font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
                        Favorite Archetypes
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setIsFavoriteArchetypesOpen((current) => !current)
                        }
                        className="mt-1 flex w-full flex-wrap gap-0.5 text-left lg:mt-1.5 lg:cursor-default lg:gap-1"
                        aria-expanded={isFavoriteArchetypesOpen}
                      >
                        {(favoriteIdentityArchetypes.length
                          ? favoriteIdentityArchetypes
                          : ["Not enough data"]
                        ).map((archetype) => (
                          <span
                            key={archetype}
                            className="max-w-full truncate rounded border border-[#A855F7]/30 bg-[#A855F7]/12 px-1 py-0.5 font-michroma text-[4.5px] uppercase text-white/80 lg:px-1.5 lg:text-[6px]"
                          >
                            {archetype}
                          </span>
                        ))}
                      </button>

                      {isFavoriteArchetypesOpen && (
                        <div className="absolute right-0 z-30 mt-1 w-32 rounded border border-[#A855F7]/30 bg-black/90 px-1.5 py-1 text-left shadow-[0_0_10px_rgba(168,85,247,0.35)] lg:hidden">
                          <p className="font-michroma text-[5px] uppercase text-white/35">
                            Favorite Archetypes
                          </p>
                          <p className="mt-1 font-michroma text-[6px] leading-snug text-white/85">
                            {(favoriteIdentityArchetypes.length
                              ? favoriteIdentityArchetypes
                              : ["Not enough data"]
                            ).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {featuredPublicLineup && (
                <div className="mt-3 rounded-lg border border-[#EFBF04]/45 bg-[color:color-mix(in_srgb,var(--court-panel)_92%,black)] p-2 shadow-[0_0_26px_rgba(239,191,4,0.1)] lg:mt-6 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-5 lg:p-5">
                  <div>
                    <p className="font-michroma text-[6px] uppercase tracking-wide text-[#EFBF04] lg:text-[9px]">
                      Featured Lineup
                    </p>

                    <div className="mt-1.5 flex items-start justify-between gap-2 lg:mt-2 lg:gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-michroma text-sm uppercase text-white lg:text-2xl">
                          {featuredPublicLineup.name}
                        </h2>

                        <p className="mt-0.5 line-clamp-1 font-michroma text-[6px] uppercase text-[#EFBF04] lg:mt-1 lg:text-[10px]">
                          {featuredPublicLineup.archetype ??
                            "Public StatCourt Build"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-michroma text-lg text-[#EFBF04] lg:text-4xl">
                          {featuredPublicLineup.overall?.toFixed(1) ?? "--"}
                        </p>
                        <p className="font-michroma text-[5px] uppercase text-white/35 lg:text-[8px]">
                          OVR
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1 lg:mt-3 lg:gap-1.5">
                      <span className="rounded border border-white/15 bg-white/8 px-1.5 py-0.5 font-michroma text-[5px] uppercase text-white/55 lg:px-2 lg:py-1 lg:text-[8px]">
                        {formatStatProfile(featuredPublicLineup.stat_profile)}
                      </span>

                      {featuredPublicLineup.tier && (
                        <span className="rounded border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[color:color-mix(in_srgb,var(--court-accent)_24%,var(--court-panel-alt))] px-1.5 py-0.5 font-michroma text-[5px] uppercase text-[var(--court-accent)] lg:px-2 lg:py-1 lg:text-[8px]">
                          {featuredPublicLineup.tier}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-2 font-michroma text-[5.5px] leading-relaxed text-white/55 lg:mt-3 lg:text-[9px]">
                      {featuredPublicLineup.summary ??
                        featuredPublicLineup.team_identity ??
                        "Public lineup built through StatCourt scouting."}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-1.5 lg:mt-3 lg:gap-2">
                      <div className="rounded-md border border-white/10 bg-black/25 p-1.5 lg:p-2">
                        <p className="font-michroma text-[5px] uppercase text-white/35 lg:text-[8px]">
                          Strengths
                        </p>
                        <div className="mt-1 grid grid-cols-2 gap-0.5 lg:mt-1.5 lg:gap-1">
                          {(featuredPublicLineup.strengths?.length
                            ? featuredPublicLineup.strengths
                            : ["Lineup Identity"]
                          )
                            .slice(0, 4)
                            .map((strength) => (
                              <span
                                key={strength}
                                className="min-w-0 truncate rounded border border-emerald-400/30 bg-emerald-400/10 px-1 py-0.5 text-center font-michroma text-[4.5px] uppercase text-emerald-300 lg:px-1.5 lg:text-[6px]"
                              >
                                {strength}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-md border border-white/10 bg-black/25 p-1.5 lg:p-2">
                        <p className="font-michroma text-[5px] uppercase text-white/35 lg:text-[8px]">
                          Team Grades
                        </p>
                        <div className="mt-1 grid min-w-0 grid-cols-2 gap-x-1 gap-y-0.5 font-michroma text-[4.5px] uppercase text-white/45 lg:mt-1.5 lg:gap-x-2 lg:gap-y-1 lg:text-[6px]">
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

                    <div className="mt-1.5 grid grid-cols-2 gap-1.5 lg:mt-4 lg:gap-2">
                      <div className="min-w-0 rounded-md border border-[rgb(var(--court-accent-rgb)/0.28)] bg-[rgb(var(--court-accent-rgb)/0.08)] p-1.5 lg:p-2">
                        <p className="font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
                          Team Identity
                        </p>
                        <p className="mt-0.5 truncate font-michroma text-[5.5px] uppercase text-[var(--court-accent)] lg:mt-1 lg:text-[8px]">
                          {featuredPublicLineup.team_identity ??
                            "Identity Developing"}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-md border border-[rgb(var(--court-accent-rgb)/0.28)] bg-[rgb(var(--court-accent-rgb)/0.08)] p-1.5 lg:p-2">
                        <p className="font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
                          X-Factor
                        </p>
                        <p className="mt-0.5 truncate font-michroma text-[5.5px] uppercase text-[var(--court-accent)] lg:mt-1 lg:text-[8px]">
                          {featuredPublicLineup.x_factor_name ?? "Not Set"}
                        </p>
                        {featuredPublicLineup.x_factor_description && (
                          <p className="hidden font-michroma leading-relaxed text-white/45 lg:mt-1 lg:line-clamp-2 lg:block lg:text-[6px]">
                            {featuredPublicLineup.x_factor_description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-2 w-full rounded-md border border-[#EFBF04]/55 bg-[#EFBF04]/10 px-2 py-1.5 font-michroma text-[5.5px] uppercase text-[#EFBF04] transition hover:bg-[#EFBF04]/18 hover:text-white lg:mt-4 lg:px-3 lg:py-2 lg:text-[9px]"
                      title="Full public scout report view coming soon"
                    >
                      View Full Scout Report
                    </button>
                  </div>

                  <div className="mt-2 rounded-md border border-white/10 bg-black/25 p-1.5 lg:mt-0 lg:p-3">
                    <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[9px]">
                      Starting Five
                    </p>

                    <div className="mt-1.5 grid gap-1 lg:mt-2 lg:gap-2">
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
                            className="grid grid-cols-[18px_28px_minmax(0,1fr)] items-center gap-1.5 rounded-md border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-1 lg:grid-cols-[30px_44px_minmax(0,1fr)] lg:gap-2 lg:p-2"
                          >
                            <p className="font-michroma text-[6px] text-[var(--court-accent)] lg:text-[10px]">
                              {slot}
                            </p>

                            <div className="relative h-7 w-7 overflow-hidden rounded bg-white/8 lg:h-11 lg:w-11">
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
                                <div className="flex h-full w-full items-center justify-center font-michroma text-[7px] text-white/45">
                                  {previewPlayer.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-michroma text-[6.5px] text-white lg:text-[10px]">
                                {previewPlayer.name}
                              </p>
                              <p className="mt-0.5 font-michroma text-[4.5px] uppercase text-white/35 lg:text-[7px]">
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
                    <div className="mt-2 flex flex-wrap gap-1 lg:gap-2">
                      {visibleFavoritePlayers.map((favoritePlayer, index) => (
                        <div
                          key={favoritePlayer.name}
                          className={`w-[calc((100%_-_3rem)/2)] min-w-0 flex-col items-center gap-1 rounded-md border border-[#A855F7]/30 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-1 text-center lg:w-44 lg:grid-cols-[38px_minmax(0,1fr)] lg:items-center lg:gap-2 lg:p-2 lg:text-left ${
                            index >= mobileFavoriteLimit
                              ? "hidden lg:grid"
                              : "flex lg:grid"
                          }`}
                        >
                          <div className="relative h-6 w-6 overflow-hidden rounded bg-[#A855F7]/15 lg:h-8.5 lg:w-8.5">
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
                            <p className="max-w-full truncate font-michroma text-[5px] leading-tight text-white lg:text-[9px]">
                              {favoritePlayer.name}
                            </p>
                            <p className="mt-0.5 truncate font-michroma text-[4px] uppercase text-white/40 lg:text-[7px]">
                              {favoritePlayer.team ?? "FA"}{" "}
                              {favoritePlayer.position
                                ? `- ${favoritePlayer.position}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}

                      {hiddenMobileFavoritePlayerCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsShowingAllFavorites(true);
                            setVisibleMobileFavoriteLimit((current) =>
                              Math.min(
                                Math.max(
                                  current,
                                  PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT,
                                ) + PUBLIC_FAVORITE_MOBILE_LOAD_STEP,
                                favoritePlayerDetails.length,
                              ),
                            );
                          }}
                          className="flex h-auto w-10 shrink-0 items-center justify-center rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 p-1 font-michroma text-[7px] text-[#A855F7] transition hover:bg-[#A855F7]/20 lg:hidden"
                        >
                          +{displayedMobileHiddenFavoritePlayerCount}
                        </button>
                      )}

                      {hiddenDesktopFavoritePlayerCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsShowingAllFavorites(true);
                            setVisibleDesktopFavoriteLimit((current) =>
                              Math.min(
                                Math.max(
                                  current,
                                  PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT,
                                ) + PUBLIC_FAVORITE_DESKTOP_LOAD_STEP,
                                favoritePlayerDetails.length,
                              ),
                            );
                          }}
                          className="hidden h-auto w-14 shrink-0 items-center justify-center rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 p-2 font-michroma text-xs text-[#A855F7] transition hover:bg-[#A855F7]/20 lg:flex"
                        >
                          +{displayedDesktopHiddenFavoritePlayerCount}
                        </button>
                      )}
                    </div>

                    {hasMoreFavoritePlayers && isShowingAllFavorites && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsShowingAllFavorites(false);
                          setVisibleMobileFavoriteLimit(
                            PUBLIC_FAVORITE_MOBILE_PREVIEW_LIMIT,
                          );
                          setVisibleDesktopFavoriteLimit(
                            PUBLIC_FAVORITE_DESKTOP_PREVIEW_LIMIT,
                          );
                        }}
                        className="mt-3 rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 px-3 py-1.5 font-michroma text-[6px] uppercase text-[#A855F7] transition hover:bg-[#A855F7]/20 lg:text-[8px]"
                      >
                        Show Fewer
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
                  <p className="font-michroma text-[8px] uppercase tracking-wide text-[var(--court-accent)] lg:text-[10px]">
                    Public Lineups
                  </p>

                  <div className="mt-2 grid gap-2 lg:mt-3 lg:grid-cols-2">
                    {remainingPublicLineups.map((lineup) => (
                      <div
                        key={lineup.id}
                        className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-black/20 p-3 transition hover:border-[rgb(var(--court-accent-rgb)/0.5)] hover:bg-[rgb(var(--court-accent-rgb)/0.08)] lg:p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-michroma text-[10px] text-white lg:text-sm">
                              {lineup.name}
                            </p>

                            <p className="mt-1 font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-[9px]">
                              {lineup.archetype ?? "Saved Lineup"}
                            </p>
                          </div>

                          <p className="shrink-0 font-michroma text-base text-[var(--court-accent)] lg:text-2xl">
                            {lineup.overall?.toFixed(1) ?? "--"}
                          </p>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-1">
                          <span className="min-w-0 truncate rounded border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-1.5 py-1 text-center font-michroma text-[5px] uppercase text-[var(--court-accent)] lg:px-2 lg:text-[7px]">
                            {lineup.tier ?? "Public Build"}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenLineupIdentityTooltip((current) =>
                                current === lineup.id ? null : lineup.id,
                              )
                            }
                            onBlur={() => setOpenLineupIdentityTooltip(null)}
                            className="group relative min-w-0 rounded border border-[#A855F7]/25 bg-[#A855F7]/10 px-1.5 py-1 text-center font-michroma text-[5px] uppercase text-[#C084FC] transition hover:bg-[#A855F7]/18 hover:text-white lg:px-2 lg:text-[7px]"
                            aria-expanded={
                              openLineupIdentityTooltip === lineup.id
                            }
                          >
                            <span className="block truncate">
                              {lineup.team_identity ?? "Identity"}
                            </span>

                            <span
                              className={`pointer-events-none absolute left-1/2 top-full z-40 mt-1 w-32 -translate-x-1/2 rounded border border-[#A855F7]/30 bg-black/95 px-1.5 py-1 font-michroma text-[5px] leading-snug text-white/85 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition lg:w-44 lg:text-[7px] ${
                                openLineupIdentityTooltip === lineup.id
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {lineup.team_identity ?? "Identity"}
                            </span>
                          </button>

                          <span className="min-w-0 truncate rounded border border-white/10 bg-white/5 px-1.5 py-1 text-center font-michroma text-[5px] uppercase text-white/45 lg:px-2 lg:text-[7px]">
                            {formatStatProfile(lineup.stat_profile)}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-5 gap-1.5 lg:gap-2">
                          {PUBLIC_LINEUP_SLOT_ORDER.map((slot) => {
                            const playerName = lineup.players?.[slot];
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
                                className="relative aspect-square w-full max-w-12 justify-self-center overflow-hidden rounded border border-white/10 bg-white/8 lg:max-w-16"
                                title={`${slot}: ${previewPlayer.name}`}
                              >
                                {getPublicFavoriteHeadshot(previewPlayer) ? (
                                  <Image
                                    src={
                                      getPublicFavoriteHeadshot(
                                        previewPlayer,
                                      ) ?? "/blank-player.svg"
                                    }
                                    alt=""
                                    fill
                                    sizes="144px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-michroma text-[7px] text-white/45">
                                    {slot}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

      {isReportOpen && profile && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg border border-red-400/30 bg-[color:color-mix(in_srgb,var(--court-panel)_96%,black)] p-4 shadow-[0_0_28px_rgba(248,113,113,0.18)] lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-michroma text-[8px] uppercase text-red-300 lg:text-[10px]">
                  Report Profile
                </p>

                <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/45 lg:text-[9px]">
                  Tell us what looks wrong with @{profile.username}. Reports
                  are reviewed as account safety signals.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsReportOpen(false);
                  setReportStatus("");
                }}
                className="rounded border border-white/10 bg-white/5 p-1 text-white/45 transition hover:border-red-300/40 hover:text-red-200"
                aria-label="Close report profile"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="grid gap-1">
                <span className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Reason
                </span>

                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-2 font-michroma text-[8px] text-white outline-none transition focus:border-red-300/50 lg:text-[10px]"
                >
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Details
                </span>

                <textarea
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Optional context..."
                  className="resize-none rounded-md border border-white/10 bg-black/30 px-2 py-2 font-michroma text-[8px] leading-relaxed text-white outline-none transition placeholder:text-white/25 focus:border-red-300/50 lg:text-[10px]"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 font-michroma text-[6px] uppercase text-red-200/70 lg:text-[8px]">
                {reportStatus}
              </p>

              <button
                type="button"
                onClick={submitProfileReport}
                disabled={isSubmittingReport}
                className="rounded-md border border-red-400/40 bg-red-400/10 px-3 py-2 font-michroma text-[7px] uppercase text-red-200 transition hover:bg-red-400/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 lg:text-[9px]"
              >
                {isSubmittingReport ? "Sending..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
