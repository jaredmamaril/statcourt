"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Lock, Star, UserCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type PublicSavedLineupRow = {
  id: string;
  name: string;
  stat_profile: string | null;
  overall: number | null;
  archetype: string | null;
  team_identity: string | null;
  players: Record<string, string> | null;
};

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) return "Member";

  return `Member since ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt))}`;
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = useMemo(
    () => decodeURIComponent(params.username ?? "").replace(/^@+/, ""),
    [params.username],
  );
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [favoritePlayers, setFavoritePlayers] = useState<string[]>([]);
  const [publicLineups, setPublicLineups] = useState<PublicSavedLineupRow[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

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
        setProfileError("Could not load this profile.");
        setIsLoadingProfile(false);
        return;
      }

      const publicProfile = (data as PublicProfile | null) ?? null;

      if (!publicProfile) {
        setProfile(null);
        setFavoritePlayers([]);
        setIsLoadingProfile(false);
        return;
      }

      const { data: favoriteRows, error: favoriteError } = await supabase
        .from("favorite_players")
        .select("player_name")
        .eq("user_id", publicProfile.id)
        .order("created_at", { ascending: false })
        .limit(6);

      const { data: lineupRows, error: lineupError } = await supabase
        .from("saved_lineups")
        .select("id, name, stat_profile, overall, archetype, team_identity, players")
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

      setProfile(publicProfile);
      setFavoritePlayers(
        ((favoriteRows as FavoritePlayerRow[] | null) ?? []).map(
          (favoritePlayer) => favoritePlayer.player_name,
        ),
      );
      setPublicLineups((lineupRows as PublicSavedLineupRow[] | null) ?? []);
      setIsLoadingProfile(false);
    }

    if (!username) {
      const timeoutId = window.setTimeout(() => {
        if (!isActive) return;

        setProfile(null);
        setFavoritePlayers([]);
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-6 text-white lg:px-8 lg:py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/players"
          className="inline-flex rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:text-[10px]"
        >
          Browse Players
        </Link>

        <div className="mt-5 rounded-lg border border-[#1bc2ec]/25 bg-[#06131d]/85 p-4 shadow-[0_0_26px_rgba(0,0,0,0.28)] lg:mt-8 lg:p-7">
          {isLoadingProfile ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="h-8 w-8 animate-spin rounded-full border border-[#1bc2ec]/20 border-t-[#1bc2ec]" />
              <p className="mt-4 font-michroma text-[9px] uppercase text-white/45 lg:text-xs">
                Loading Profile
              </p>
            </div>
          ) : profile ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#1bc2ec]/35 bg-black/30 text-[#1bc2ec] lg:h-24 lg:w-24">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-michroma text-xl lg:text-3xl">
                        {accountInitial}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] lg:text-[10px]">
                      Public Profile
                    </p>

                    <h1 className="mt-1 truncate font-michroma text-xl uppercase text-white lg:text-4xl">
                      {displayName}
                    </h1>

                    <p className="mt-1 font-michroma text-[9px] text-white/45 lg:text-xs">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#22C55E] lg:text-[10px]">
                  Visible
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:mt-7 lg:grid-cols-3">
                <div className="rounded-md border border-white/10 bg-black/20 p-3 transition hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 lg:p-4">
                  <CalendarDays className="h-4 w-4 text-[#1bc2ec]" />
                  <p className="mt-3 font-michroma text-[7px] uppercase text-white/35 lg:text-[8px]">
                    Account
                  </p>
                  <p className="mt-1 font-michroma text-[9px] text-white lg:text-xs">
                    {formatMemberSince(profile.created_at)}
                  </p>
                </div>

                <div className="rounded-md border border-white/10 bg-black/20 p-3 transition hover:border-[#EFBF04]/35 hover:bg-[#171407]/80 lg:p-4">
                  <UserCircle className="h-4 w-4 text-[#EFBF04]" />
                  <p className="mt-3 font-michroma text-[7px] uppercase text-white/35 lg:text-[8px]">
                    Saved Lineups
                  </p>

                  {publicLineups.length > 0 ? (
                    <p className="mt-1 font-michroma text-[9px] text-white lg:text-xs">
                      {publicLineups.length} public lineup
                      {publicLineups.length === 1 ? "" : "s"}
                    </p>
                  ) : (
                    <p className="mt-1 font-michroma text-[9px] text-white/55 lg:text-xs">
                      No public lineups yet.
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-white/10 bg-black/20 p-3 transition hover:border-[#A855F7]/35 hover:bg-[#12091d]/80 lg:p-4">
                  <Star className="h-4 w-4 text-[#A855F7]" />
                  <p className="mt-3 font-michroma text-[7px] uppercase text-white/35 lg:text-[8px]">
                    Favorite Players
                  </p>

                  {favoritePlayers.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {favoritePlayers.map((favoritePlayer) => (
                        <span
                          key={favoritePlayer}
                          className="rounded-md border border-[#A855F7]/30 bg-[#A855F7]/10 px-2 py-1 font-michroma text-[7px] text-white lg:text-[9px]"
                        >
                          {favoritePlayer}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 font-michroma text-[9px] text-white/55 lg:text-xs">
                      No public favorites yet.
                    </p>
                  )}
                </div>
              </div>

              {publicLineups.length > 0 && (
                <div className="mt-5 lg:mt-7">
                  <p className="font-michroma text-[8px] uppercase text-white/40 lg:text-[10px]">
                    Public Lineups
                  </p>

                  <div className="mt-2 grid gap-2 lg:mt-3 lg:grid-cols-2">
                    {publicLineups.map((lineup) => (
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

                        <p className="mt-2 font-michroma text-[7px] text-white/45 lg:text-[9px]">
                          {lineup.team_identity ?? "Public StatCourt build"}
                        </p>

                        <p className="mt-2 truncate font-michroma text-[6px] text-white/35 lg:text-[8px]">
                          {Object.values(lineup.players ?? {})
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
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
