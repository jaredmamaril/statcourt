import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { players as localPlayers, type Player } from "./court-data";
import {
  getNewestSeasonFromSupabase,
  getSeasonMaxTeamGamesStrict,
  getSeasonStatRowsForPlayer,
  getSupabasePlayerById,
  getSupabasePlayerSlugIndex,
} from "./supabase-players";
import { createPeakContext, withTwoSeasonPeak } from "../lib/player-peak";
import { matchPlayerSlug, type PlayerSlugMatch } from "../lib/player-slug";

// One player for the server-rendered player page, without loading every player.
// The peak comes from app/lib/player-peak.ts with the same inputs the all-players peak
// map uses: the player's season rows, the most team games in each of their seasons,
// and the newest season overall.

const HOUR = 3600;
const cacheOptions = { revalidate: HOUR, tags: ["statcourt-public-players"] };

const getCachedPlayerSlugIndex = unstable_cache(
  async () => getSupabasePlayerSlugIndex(),
  ["statcourt-player-slug-index-v1"],
  cacheOptions,
);

const getCachedNewestSeason = unstable_cache(
  async () => getNewestSeasonFromSupabase(),
  ["statcourt-newest-season-v1"],
  cacheOptions,
);

const getCachedSeasonMaxTeamGames = unstable_cache(
  async (season: string) => getSeasonMaxTeamGamesStrict(season),
  ["statcourt-season-max-team-games-v1"],
  cacheOptions,
);

const getCachedPlayerProfile = unstable_cache(
  async (playerId: number, nbaId: number | null): Promise<Player | null> => {
    const [player, seasonRows, currentSeason] = await Promise.all([
      getSupabasePlayerById(playerId, nbaId),
      getSeasonStatRowsForPlayer(playerId),
      getCachedNewestSeason(),
    ]);

    if (!player) return null;

    const seasons = [...new Set(seasonRows.map((row) => row.season))];
    const maxTeamGames = await Promise.all(
      seasons.map(async (season) => [season, await getCachedSeasonMaxTeamGames(season)] as const),
    );
    const context = createPeakContext(
      maxTeamGames.filter(([, games]) => games > 0),
      currentSeason,
    );

    return withTwoSeasonPeak(player, seasonRows, context);
  },
  ["statcourt-player-profile-v2"],
  cacheOptions,
);

export type PlayerSlugIndex = { id: number; name: string; nbaId: number | null }[];

export type PlayerForSlug = {
  // The one player the slug names; null when it names none, or several (ambiguous).
  player: Player | null;
  // How the slug matched: the canonical slug to redirect to, or the players a bare
  // shared name (e.g. "mike-james") could mean.
  match: PlayerSlugMatch<PlayerSlugIndex[number]>;
  // Every player's name and NBA ID, for canonical links (duplicate names).
  slugIndex: PlayerSlugIndex;
  // Set when the database couldn't be reached and fallback data is shown.
  loadError: string | null;
  // The newest season in the data (e.g. "2026-27"), null without season data.
  newestSeason: string | null;
};

function toSlugIndex(players: readonly Player[]): PlayerSlugIndex {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    nbaId: player.nbaId ?? null,
  }));
}

function getFallbackPlayerForSlug(slug: string, loadError: string | null): PlayerForSlug {
  const slugIndex = toSlugIndex(localPlayers);
  const match = matchPlayerSlug(slugIndex, slug);

  return {
    player:
      match.status === "found"
        ? localPlayers.find((player) => player.id === match.player.id) ?? null
        : null,
    match,
    slugIndex,
    loadError,
    newestSeason: null,
  };
}

// Resolves /players/{slug} (clean slug, slug-{nbaId}, or encoded name) to one player.
// Wrapped in React cache so the page and generateMetadata share one lookup per request.
export const getPlayerForSlug = cache(async (slug: string): Promise<PlayerForSlug> => {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return getFallbackPlayerForSlug(slug, null);
  }

  try {
    const [slugIndex, newestSeason] = await Promise.all([
      getCachedPlayerSlugIndex(),
      getCachedNewestSeason(),
    ]);
    const match = matchPlayerSlug(slugIndex, slug);

    return {
      player:
        match.status === "found"
          ? await getCachedPlayerProfile(match.player.id, match.player.nbaId)
          : null,
      match,
      slugIndex,
      loadError: null,
      newestSeason,
    };
  } catch (error) {
    console.error("Failed to load player profile", error);

    return getFallbackPlayerForSlug(slug, "Could not load player database.");
  }
});

// The players behind an ambiguous slug (the "Which Mike James?" page), from the same
// cached per-player profiles as the player page.
export async function getPlayersForSlugEntries(
  entries: readonly PlayerSlugIndex[number][],
): Promise<Player[]> {
  const fromLocalPlayers = () =>
    entries
      .map((entry) => localPlayers.find((player) => player.id === entry.id))
      .filter((player): player is Player => Boolean(player));

  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return fromLocalPlayers();
  }

  try {
    const players = await Promise.all(
      entries.map((entry) => getCachedPlayerProfile(entry.id, entry.nbaId)),
    );

    return players.filter((player): player is Player => Boolean(player));
  } catch (error) {
    console.error("Failed to load players for an ambiguous slug", error);

    return fromLocalPlayers();
  }
}
