"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPlayerInsights,
  type PlayerInsightDisplay,
  type Player,
} from "../components/court-data";
import {
  Activity,
  Bookmark,
  Camera,
  Clock,
  Info,
  LayoutDashboard,
  Search,
  Share2,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { supabase } from "../components/supabase-client";
import { getAuthProviderLabel } from "../lib/auth-display";
import { useUserProfile } from "../lib/use-user-profile";

type ProfileStats = {
  savedLineups: number;
  favoritePlayers: number;
  playersViewed: number;
  favoriteArchetype: PlayerInsightDisplay | null;
};

type ActivityRow = {
  id: string;
  activity_type: string;
  label: string;
  href: string | null;
  created_at: string;
};

const MAX_AVATAR_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialProfileStats: ProfileStats = {
  savedLineups: 0,
  favoritePlayers: 0,
  playersViewed: 0,
  favoriteArchetype: null,
};

function getAvatarFileExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";

  return "png";
}

function getFavoriteArchetype(
  players: Player[],
  favoritePlayerNames: string[],
) {
  const favoritePlayerNameSet = new Set(favoritePlayerNames);
  const archetypeCounts = new Map<
    string,
    { archetype: PlayerInsightDisplay; count: number }
  >();

  players
    .filter((player) => favoritePlayerNameSet.has(player.name))
    .forEach((player) => {
      const archetype = getPlayerInsights(player, "career").archetype;

      if (!archetype) return;

      const currentCount = archetypeCounts.get(archetype.label)?.count ?? 0;

      archetypeCounts.set(archetype.label, {
        archetype,
        count: currentCount + 1,
      });
    });

  return (
    Array.from(archetypeCounts.values()).sort(
      (a, b) =>
        b.count - a.count || a.archetype.label.localeCompare(b.archetype.label),
    )[0]?.archetype ?? null
  );
}

function formatActivityTime(createdAt: string) {
  const eventTime = new Date(createdAt).getTime();

  if (!Number.isFinite(eventTime)) return "";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - eventTime) / 1000),
  );

  if (elapsedSeconds < 60) return "Just now";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hr ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays === 1) return "Yesterday";
  if (elapsedDays < 7) return `${elapsedDays} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));
}

const quickActions = [
  {
    label: "Build Lineup",
    href: "/lineups?tab=builder",
    icon: LayoutDashboard,
    color: "#1bc2ec",
  },
  {
    label: "Browse Players",
    href: "/players",
    icon: Search,
    color: "#A855F7",
  },
  {
    label: "View Saved Lineups",
    href: "/lineups?tab=saved",
    icon: Bookmark,
    color: "#EFBF04",
  },
  {
    label: "View Archetypes",
    href: "/rankings?tab=archetypes",
    icon: Trophy,
    color: "#22C55E",
  },
];

export default function ProfilePage() {
  const {
    user,
    isLoadingUser,
    displayName,
    username,
    profile,
    initial: accountInitial,
    avatarUrl: accountAvatarUrl,
  } = useUserProfile();
  const [profileStats, setProfileStats] =
    useState<ProfileStats>(initialProfileStats);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [openStatTooltip, setOpenStatTooltip] = useState<string | null>(null);
  const [shareProfileStatus, setShareProfileStatus] = useState("");
  const [avatarStatus, setAvatarStatus] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingProfileStats, setIsLoadingProfileStats] = useState(true);
  const statCardsRef = useRef<HTMLDivElement>(null);

  async function sharePublicProfile() {
    if (!username || !profile?.publicProfileEnabled) return;

    const profileUrl = `${window.location.origin}/u/${username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setShareProfileStatus("Copied");
      window.setTimeout(() => setShareProfileStatus(""), 1800);
    } catch {
      setShareProfileStatus("Copy failed");
      window.setTimeout(() => setShareProfileStatus(""), 1800);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!user) {
      setAvatarStatus("Sign in to upload avatar.");
      return;
    }

    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarStatus("Use JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarStatus("Avatar must be under 1MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarStatus("Uploading...");

    const extension = getAvatarFileExtension(file);
    const filePath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Failed to upload avatar", uploadError);
      setAvatarStatus(uploadError.message || "Could not upload avatar.");
      setIsUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicAvatarUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        avatar_url: publicAvatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.warn("Failed to save avatar URL", profileError);
      setAvatarStatus("Uploaded, but could not save avatar.");
      setIsUploadingAvatar(false);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicAvatarUrl,
        picture: publicAvatarUrl,
      },
    });

    if (authError) {
      console.warn("Failed to update auth avatar metadata", authError);
    }

    window.dispatchEvent(new Event("statcourt-profile-updated"));
    setAvatarStatus("Avatar updated.");
    setIsUploadingAvatar(false);
  }

  useEffect(() => {
    let isActive = true;

    async function loadProfileStats() {
      if (isLoadingUser) return;

      setIsLoadingProfileStats(true);

      if (!user) {
        setProfileStats(initialProfileStats);
        setRecentActivity([]);
        setIsLoadingProfileStats(false);
        return;
      }

      const [
        savedLineupsResponse,
        favoritePlayersResponse,
        recentPlayersResponse,
        activityResponse,
        playersResponse,
      ] = await Promise.all([
        supabase
          .from("saved_lineups")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("favorite_players")
          .select("player_name", { count: "exact" }),
        supabase
          .from("recent_players")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("user_activity")
          .select("id, activity_type, label, href, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        fetch("/api/players"),
      ]);

      if (!isActive) return;

      if (
        savedLineupsResponse.error ||
        favoritePlayersResponse.error ||
        recentPlayersResponse.error ||
        activityResponse.error
      ) {
        console.error("Failed to load profile stats", {
          savedLineupsError: savedLineupsResponse.error,
          favoritePlayersError: favoritePlayersResponse.error,
          recentPlayersError: recentPlayersResponse.error,
          activityError: activityResponse.error,
        });
        setIsLoadingProfileStats(false);
        return;
      }

      const playersData = playersResponse.ok
        ? ((await playersResponse.json()) as { players?: Player[] })
        : { players: [] };
      const favoritePlayerNames = (
        (favoritePlayersResponse.data ?? []) as { player_name: string }[]
      ).map((favoritePlayer) => favoritePlayer.player_name);

      setProfileStats({
        savedLineups: savedLineupsResponse.count ?? 0,
        favoritePlayers: favoritePlayersResponse.count ?? 0,
        playersViewed: recentPlayersResponse.count ?? 0,
        favoriteArchetype: getFavoriteArchetype(
          playersData.players ?? [],
          favoritePlayerNames,
        ),
      });
      setRecentActivity((activityResponse.data ?? []) as ActivityRow[]);
      setIsLoadingProfileStats(false);
    }

    loadProfileStats();

    return () => {
      isActive = false;
    };
  }, [isLoadingUser, user]);

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (!openStatTooltip || !(event.target instanceof Node)) return;

      if (statCardsRef.current?.contains(event.target)) return;

      setOpenStatTooltip(null);
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [openStatTooltip]);

  const authProviderLabel = getAuthProviderLabel(user);
  const displayedProfileStats = user ? profileStats : initialProfileStats;
  const displayedRecentActivity = user ? recentActivity : [];

  const accountStats = useMemo(
    () => [
      {
        label: "Saved Lineups",
        value: String(displayedProfileStats.savedLineups),
        tooltip: "Total lineups saved to your signed-in StatCourt account.",
        icon: Bookmark,
        color: "#1bc2ec",
      },
      {
        label: "Favorite Players",
        value: String(displayedProfileStats.favoritePlayers),
        tooltip:
          "Players you have starred from the player list or profile pages.",
        icon: Star,
        color: "#EFBF04",
      },
      {
        label: "Players Viewed",
        value: String(displayedProfileStats.playersViewed),
        tooltip: "Unique players you have opened or scouted while signed in.",
        icon: Clock,
        color: "#A855F7",
      },
      {
        label: "Favorite Archetype",
        value:
          displayedProfileStats.favoriteArchetype?.label ??
          "Not enough data yet",
        tooltip: "Most common Career archetype among your favorited players.",
        icon: Trophy,
        color:
          displayedProfileStats.favoriteArchetype?.rarity === "gold"
            ? "#EFBF04"
            : displayedProfileStats.favoriteArchetype?.rarity === "purple"
              ? "#A855F7"
              : displayedProfileStats.favoriteArchetype?.rarity === "blue"
                ? "#1bc2ec"
                : "#22C55E",
      },
    ],
    [displayedProfileStats],
  );

  return (
    <main className="page-enter relative min-h-svh bg-background px-3 py-3 text-white lg:px-6 lg:pt-12">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto max-w-5xl py-3 lg:py-10">
        <div className="mb-3 rounded-lg border border-[#1bc2ec]/30 bg-[#06131d]/80 p-3 shadow-[0_0_22px_rgba(27,194,236,0.12)] lg:mb-8 lg:p-6 lg:shadow-[0_0_30px_rgba(27,194,236,0.14)]">
          <div className="flex items-center justify-between gap-3 lg:gap-5">
            <div>
              <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] lg:text-[10px]">
                Court Hub
              </p>

              <h1 className="mt-1 font-michroma text-base uppercase text-white lg:mt-2 lg:text-3xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-1.5 font-michroma text-[6px] uppercase tracking-wide text-white/45 lg:mt-3 lg:text-[11px]">
                Your Court is ready.
              </p>

              {profile?.publicProfileEnabled && username && (
                <button
                  type="button"
                  onClick={sharePublicProfile}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:mt-4 lg:px-3 lg:text-[8px]"
                >
                  <Share2 className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                  {shareProfileStatus || "Share Profile"}
                </button>
              )}
            </div>

            <div className="shrink-0">
              <label
                className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 font-michroma text-xs text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.18)] transition hover:border-[#1bc2ec] hover:text-white lg:h-24 lg:w-24 lg:text-xl lg:shadow-[0_0_24px_rgba(27,194,236,0.22)] ${
                  user && !isUploadingAvatar
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-70"
                }`}
                aria-label="Change profile picture"
              >
                {accountAvatarUrl ? (
                  <Image
                    src={accountAvatarUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 96px, 48px"
                    className="object-cover"
                  />
                ) : (
                  accountInitial
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                  <Camera className="h-4 w-4 text-[#1bc2ec] lg:h-6 lg:w-6" />
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={!user || isUploadingAvatar}
                  className="hidden"
                  onChange={(event) => {
                    void uploadAvatar(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>

              {avatarStatus && (
                <p className="mt-1 max-w-24 text-center font-michroma text-[5px] uppercase text-[#1bc2ec]/70 lg:text-[7px]">
                  {avatarStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          ref={statCardsRef}
          className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4"
        >
          {accountStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative cursor-pointer rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_16px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-[#071827]/90 hover:shadow-[0_0_26px_rgba(27,194,236,0.16)] lg:p-4"
              >
                <button
                  type="button"
                  aria-label={`${stat.label} info`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpenStatTooltip((currentTooltip) =>
                      currentTooltip === stat.label ? null : stat.label,
                    );
                  }}
                  onBlur={() => setOpenStatTooltip(null)}
                  className="peer absolute top-2 right-2 z-20 cursor-help text-white/30 transition hover:text-[#1bc2ec] lg:top-3 lg:right-3"
                >
                  <Info className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                </button>

                <div
                  className={`pointer-events-none absolute top-7 right-1 left-1 z-30 rounded-md border border-[#1bc2ec]/35 bg-black/95 p-1.5 font-michroma text-[5px] leading-relaxed text-white/70 shadow-[0_0_18px_rgba(27,194,236,0.22)] transition lg:top-9 lg:right-3 lg:left-auto lg:w-52 lg:p-2 lg:text-[8px] ${
                    openStatTooltip === stat.label
                      ? "opacity-100"
                      : "opacity-0 peer-hover:opacity-100"
                  }`}
                >
                  {stat.tooltip}
                </div>

                <div
                  className="mb-2 flex h-7 w-7 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125 lg:mb-4 lg:h-9 lg:w-9"
                  style={{
                    borderColor: `${stat.color}80`,
                    color: stat.color,
                    boxShadow: `0 0 16px ${stat.color}33`,
                  }}
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>

                <p className="font-michroma text-[6px] uppercase tracking-wide text-white/35 lg:text-[8px]">
                  {stat.label}
                </p>

                <p
                  className="mt-1 font-michroma text-[10px] text-white lg:mt-2 lg:text-xl"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 14px ${stat.color}55`,
                  }}
                >
                  {isLoadingProfileStats ? "--" : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid gap-2 lg:mt-6 lg:grid-cols-[1fr_1fr] lg:gap-4">
          <section className="flex rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:min-h-80 lg:p-5">
            <div className="flex min-h-0 w-full flex-col">
              <div className="mb-2.5 flex items-center gap-2 lg:mb-4 lg:gap-3">
                <Activity className="h-3.5 w-3.5 text-[#1bc2ec] lg:h-5 lg:w-5" />
                <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                  Recent Activity
                </p>
              </div>

              {displayedRecentActivity.length > 0 ? (
                <>
                  <div className="statcourt-scroll grid max-h-54 gap-2 overflow-y-auto pr-1 lg:max-h-56">
                    {displayedRecentActivity.map((activity) => {
                      const activityContent = (
                        <>
                          <p className="font-michroma text-[7px] uppercase text-white/75 lg:text-[9px]">
                            {activity.label}
                          </p>

                          <p className="mt-1 font-michroma text-[5px] uppercase text-white/30 lg:text-[7px]">
                            {activity.activity_type.replaceAll("_", " ")}
                            {" / "}
                            {formatActivityTime(activity.created_at)}
                          </p>
                        </>
                      );

                      if (activity.href) {
                        return (
                          <Link
                            key={activity.id}
                            href={activity.href}
                            className="rounded-md border border-white/10 bg-black/20 p-2.5 transition hover:border-[#1bc2ec]/45 hover:bg-[#1bc2ec]/10 lg:p-3"
                          >
                            {activityContent}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={activity.id}
                          className="rounded-md border border-white/10 bg-black/20 p-2.5 lg:p-3"
                        >
                          {activityContent}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1.5 lg:mt-3 lg:gap-2">
                    <Link
                      href="/players"
                      className="rounded-md border border-[#1bc2ec]/35 bg-[#1bc2ec]/10 px-2 py-1.5 text-center font-michroma text-[5px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:px-3 lg:py-2 lg:text-[7px]"
                    >
                      Scout
                    </Link>

                    <Link
                      href="/lineups?tab=builder"
                      className="rounded-md border border-[#EFBF04]/35 bg-[#EFBF04]/10 px-2 py-1.5 text-center font-michroma text-[5px] uppercase text-[#EFBF04] transition hover:bg-[#EFBF04]/20 hover:text-white lg:px-3 lg:py-2 lg:text-[7px]"
                    >
                      Build
                    </Link>

                    <Link
                      href="/lineups?tab=saved"
                      className="rounded-md border border-[#A855F7]/35 bg-[#A855F7]/10 px-2 py-1.5 text-center font-michroma text-[5px] uppercase text-[#A855F7] transition hover:bg-[#A855F7]/20 hover:text-white lg:px-3 lg:py-2 lg:text-[7px]"
                    >
                      Saved
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-md border border-white/10 bg-black/20 p-3 text-center lg:p-5">
                  <p className="font-michroma text-[10px] text-white/60 lg:text-sm">
                    No activity yet.
                  </p>

                  <p className="mt-1.5 font-michroma text-[6px] leading-relaxed text-white/35 lg:mt-2 lg:text-[9px]">
                    Saved lineups, favorites, and scouting actions will appear
                    here.
                  </p>

                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 lg:mt-4 lg:gap-2">
                    <Link
                      href="/players"
                      className="rounded-md border border-[#1bc2ec]/45 bg-[#1bc2ec]/10 px-2 py-2 font-michroma text-[5px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:px-3 lg:py-2.5 lg:text-[7px]"
                    >
                      Scout
                    </Link>

                    <Link
                      href="/lineups?tab=builder"
                      className="rounded-md border border-[#EFBF04]/45 bg-[#EFBF04]/10 px-2 py-2 font-michroma text-[5px] uppercase text-[#EFBF04] transition hover:bg-[#EFBF04]/20 hover:text-white lg:px-3 lg:py-2.5 lg:text-[7px]"
                    >
                      Build
                    </Link>

                    <Link
                      href="/lineups?tab=saved"
                      className="rounded-md border border-[#A855F7]/45 bg-[#A855F7]/10 px-2 py-2 font-michroma text-[5px] uppercase text-[#A855F7] transition hover:bg-[#A855F7]/20 hover:text-white lg:px-3 lg:py-2.5 lg:text-[7px]"
                    >
                      Saved
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-4 lg:gap-3">
              <Shield className="h-3.5 w-3.5 text-[#EFBF04] lg:h-5 lg:w-5" />
              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Quick Actions
              </p>
            </div>

            <div className="grid gap-2 lg:gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 font-michroma text-[7px] uppercase text-white/75 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/45 hover:bg-[#1bc2ec]/10 hover:text-white hover:shadow-[0_0_22px_rgba(27,194,236,0.18)] lg:gap-3 lg:px-4 lg:py-3 lg:text-[10px]"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md border bg-white/5 transition duration-200 group-hover:scale-105 group-hover:brightness-125 lg:h-8 lg:w-8"
                      style={{
                        borderColor: `${action.color}70`,
                        color: action.color,
                      }}
                    >
                      <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                    </span>

                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-3 rounded-lg border border-white/10 bg-[#06131d]/80 p-3 lg:mt-6 lg:p-5">
          <div className="mb-2.5 flex items-center justify-between gap-3 lg:mb-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <Users className="h-3.5 w-3.5 text-white/50 lg:h-5 lg:w-5" />
              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Account Status
              </p>
            </div>

            <span
              className={`rounded border px-2 py-1 font-michroma text-[5px] uppercase lg:text-[7px] ${
                user
                  ? "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]"
                  : "border-white/15 bg-white/5 text-white/35"
              }`}
            >
              {user ? "Synced" : "Signed Out"}
            </span>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1.15fr_2fr] lg:gap-4">
            <div className="rounded-md border border-white/10 bg-black/20 p-2.5 lg:p-3">
              <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                Signed In As
              </p>

              <p className="mt-1 truncate font-michroma text-[8px] text-[#1bc2ec] lg:text-[10px]">
                {user?.email ?? "No active account"}
              </p>

              <p className="mt-1 font-michroma text-[5px] uppercase text-white/30 lg:text-[7px]">
                {authProviderLabel}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {(user
                ? [
                    "Lineups sync across sessions",
                    "Favorites stay with account",
                    "Activity feed keeps latest 20",
                  ]
                : [
                    "Sign in to sync lineups",
                    "Favorites stay local only",
                    "Activity feed is paused",
                  ]
              ).map((status) => (
                <div
                  key={status}
                  className={`rounded-md border p-2.5 font-michroma text-[6px] uppercase leading-relaxed lg:p-3 lg:text-[8px] ${
                    user
                      ? "border-[#22C55E]/20 bg-[#22C55E]/5 text-white/50"
                      : "border-white/10 bg-black/20 text-white/35"
                  }`}
                >
                  <span
                    className={
                      user ? "mr-1 text-[#22C55E]" : "mr-1 text-white/25"
                    }
                  >
                    {user ? "✓" : "•"}
                  </span>
                  {status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
