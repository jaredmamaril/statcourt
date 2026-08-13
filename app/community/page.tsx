"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Shield, UserCircle, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SkeletonBlock } from "../components/loading/skeleton";

type CommunityProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  public_lineup_count: number;
  favorite_player_count: number;
  top_lineup_archetype: string | null;
  top_favorite_archetype: string | null;
  top_strengths: string[];
};

function formatJoinedDate(createdAt: string | null) {
  if (!createdAt) return "Member";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function CommunityProfileSkeleton() {
  return (
    <div className="rounded-md border border-white/12 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 lg:p-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-md lg:h-14 lg:w-14" />

        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-3 w-32 lg:h-4 lg:w-40" />
          <SkeletonBlock className="mt-2 h-2.5 w-24 lg:w-32" />
        </div>
      </div>

      <SkeletonBlock className="mt-4 h-2.5 w-full" />
      <SkeletonBlock className="mt-2 h-2.5 w-3/4" />
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        <SkeletonBlock className="h-12 rounded-md" />
        <SkeletonBlock className="h-12 rounded-md" />
        <SkeletonBlock className="h-12 rounded-md" />
      </div>
      <SkeletonBlock className="mt-4 h-8 rounded-md lg:h-10" />
    </div>
  );
}

function getProfileIdentity(profile: CommunityProfileRow) {
  if (profile.top_lineup_archetype) return profile.top_lineup_archetype;
  if (profile.top_favorite_archetype) {
    return `${profile.top_favorite_archetype} Scout`;
  }
  if (profile.favorite_player_count > 0) return "Player Scout";

  return "Court Builder";
}

function getProfileTags(profile: CommunityProfileRow) {
  const identity = getProfileIdentity(profile);
  const tags = profile.top_strengths
    .filter((tag) => tag && tag !== identity)
    .slice(0, 2);

  if (tags.length > 0) return tags;

  if (profile.public_lineup_count > 0) return ["Lineup Creator"];
  if (profile.top_favorite_archetype) return ["Favorite-Driven"];
  if (profile.favorite_player_count > 0) return ["Favorite-Driven"];

  return ["Community Member"];
}

export default function CommunityPage() {
  const [profiles, setProfiles] = useState<CommunityProfileRow[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCommunityProfiles() {
      setIsLoadingProfiles(true);
      setProfileError("");

      const response = await fetch("/api/community/profiles", {
        cache: "no-store",
      });

      if (!isActive) return;

      if (!response.ok) {
        throw new Error("Failed to load community profiles");
      }

      const data = (await response.json()) as {
        profiles?: CommunityProfileRow[];
      };

      if (!isActive) return;

      setProfiles(data.profiles ?? []);
      setIsLoadingProfiles(false);
    }

    loadCommunityProfiles().catch((error) => {
      console.warn("Failed to load community profiles", error);

      if (!isActive) return;

      setProfiles([]);
      setProfileError("Could not load community profiles.");
      setIsLoadingProfiles(false);
    });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const filteredProfiles = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    if (!search) return profiles;

    return profiles.filter((profile) => {
      const displayName = profile.display_name?.toLowerCase() ?? "";
      const username = profile.username?.toLowerCase() ?? "";

      return displayName.includes(search) || username.includes(search);
    });
  }, [profiles, searchValue]);

  const hasActiveSearch = searchValue.trim().length > 0;
  const resultCountLabel = isLoadingProfiles
    ? "Loading"
    : hasActiveSearch
      ? `${filteredProfiles.length} match${
          filteredProfiles.length === 1 ? "" : "es"
        }`
      : filteredProfiles.length > 1
        ? `${filteredProfiles.length} profiles`
        : "";

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-[var(--court-panel-alt)] px-3 py-6 text-white lg:px-6 lg:py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.2]"
        style={{
          backgroundImage: "var(--court-pattern)",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-4 shadow-[0_0_20px_rgba(0,0,0,0.24)] lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.12)] text-[var(--court-accent)] lg:h-9 lg:w-9">
                  <Users className="h-4 w-4" />
                </div>

                <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                  Community
                </p>
              </div>

              <h1 className="mt-3 font-michroma text-xl uppercase leading-tight text-white lg:text-3xl">
                Community Profiles
              </h1>

              <p className="mt-2 font-michroma text-[8px] leading-relaxed text-white/55 lg:text-[11px]">
                Explore public StatCourt profiles, compare lineup styles, and
                find creators by basketball identity.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--court-accent)]" />
              <label htmlFor="community-profile-search" className="sr-only">
                Search community profiles
              </label>
              <input
                id="community-profile-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search users..."
                disabled={isLoadingProfiles}
                className="h-10 w-full rounded-md border border-[rgb(var(--court-accent-rgb)/0.3)] bg-black/30 pl-9 pr-3 font-michroma text-[8px] text-white outline-none transition placeholder:text-white/35 focus:border-[rgb(var(--court-accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-55 lg:text-[10px]"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 px-1 lg:mt-6">
          <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[9px]">
            Community Members
          </p>

          {resultCountLabel && (
            <p className="font-michroma text-[7px] uppercase text-[var(--court-accent)] lg:text-[9px]">
              {resultCountLabel}
            </p>
          )}
        </div>

        {isLoadingProfiles ? (
          <div aria-busy="true" aria-live="polite">
            <p className="sr-only" role="status">
              Loading community profiles
            </p>

            <div className="mt-3 grid gap-2 lg:grid-cols-3 lg:gap-4">
              {Array.from({ length: 9 }, (_, index) => (
                <CommunityProfileSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : profileError ? (
          <div className="mt-3 rounded-lg border border-red-400/25 bg-red-400/8 p-5 text-center">
            <p
              className="font-michroma text-[9px] uppercase text-red-200 lg:text-xs"
              role="alert"
            >
              {profileError}
            </p>

            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 rounded-md border border-red-200/35 bg-red-200/8 px-4 py-2 font-michroma text-[7px] uppercase text-red-100 transition hover:bg-red-200/14 lg:text-[9px]"
            >
              Try Again
            </button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="mt-3 rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_82%,transparent)] p-6 text-center lg:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/35">
              <Shield className="h-5 w-5" />
            </div>

            <p className="mt-4 font-michroma text-[10px] uppercase text-white lg:text-sm">
              {searchValue.trim()
                ? "No matching public profiles."
                : "No public profiles found."}
            </p>

            <p className="mx-auto mt-2 max-w-md font-michroma text-[7px] leading-relaxed text-white/40 lg:text-[10px]">
              {searchValue.trim()
                ? "Try a different username or display name."
                : "Check back after more users make their profiles public."}
            </p>

            {searchValue.trim() && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="mt-4 rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.08)] px-4 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.16)] lg:text-[9px]"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="mt-3 grid gap-2 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {filteredProfiles.map((profile) => {
              const displayName =
                profile.display_name?.trim() || profile.username || "StatCourt";
              const initial = displayName.charAt(0).toUpperCase() || "S";
              const identity = getProfileIdentity(profile);
              const tags = getProfileTags(profile);

              return (
                <article
                  key={profile.id}
                  className="rounded-md border border-white/12 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-3 shadow-[0_0_16px_rgba(0,0,0,0.2)] transition hover:scale-[1.01] hover:border-[rgb(var(--court-accent-rgb)/0.42)] hover:bg-[color:color-mix(in_srgb,var(--court-panel)_94%,black)] lg:p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] font-michroma text-sm text-[var(--court-accent)] lg:h-14 lg:w-14 lg:text-lg">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <UserCircle className="h-6 w-6 text-[var(--court-accent)]" />
                      )}

                      {!profile.avatar_url && (
                        <span className="sr-only">{initial}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-michroma text-[10px] uppercase text-white lg:text-sm">
                        {displayName}
                      </h2>

                      <p className="mt-1 truncate font-michroma text-[7px] text-white/45 lg:text-[9px]">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                      {identity}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-white/12 bg-white/6 px-2 py-1 font-michroma text-[6px] uppercase text-white/62 lg:text-[7px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.24)] bg-[rgb(var(--court-accent-rgb)/0.08)] p-2">
                      <p className="font-michroma text-[6px] uppercase text-white/45 lg:text-[7px]">
                        Favorites
                      </p>
                      <p className="mt-1 font-michroma text-[10px] text-white lg:text-sm">
                        {profile.favorite_player_count}
                      </p>
                    </div>

                    <div className="rounded-md border border-white/12 bg-black/22 p-2">
                      <p className="font-michroma text-[6px] uppercase text-white/45 lg:text-[7px]">
                        Public Lineups
                      </p>
                      <p className="mt-1 font-michroma text-[10px] text-white lg:text-sm">
                        {profile.public_lineup_count}
                      </p>
                    </div>

                    <div className="rounded-md border border-white/12 bg-black/22 p-2">
                      <p className="font-michroma text-[6px] uppercase text-white/45 lg:text-[7px]">
                        Joined
                      </p>
                      <p className="mt-1 truncate font-michroma text-[8px] text-white lg:text-[10px]">
                        {formatJoinedDate(profile.created_at)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/u/${profile.username}`}
                    className="mt-3 flex h-8 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white lg:h-10 lg:text-[9px]"
                  >
                    View Profile
                  </Link>
                </article>
              );
            })}

            {!hasActiveSearch && filteredProfiles.length === 1 && (
              <div className="flex min-h-36 flex-col justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.18)] bg-[color:color-mix(in_srgb,var(--court-panel)_84%,black)] p-3.5 shadow-[0_0_14px_rgba(0,0,0,0.18)] lg:min-h-42">
                <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                  Community Growing
                </p>

                <p className="mt-2 max-w-sm font-michroma text-[8px] leading-relaxed text-white/55 lg:text-[10px]">
                  More public profiles will appear here as StatCourt users share
                  lineups, favorites, and basketball identities.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
