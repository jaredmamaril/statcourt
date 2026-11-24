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
import { findPlayerBySlug } from "../lib/player-slug";

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
  player: Player | null;
  // Every player's name and NBA ID, for canonical links (duplicate names).
  slugIndex: PlayerSlugIndex;
  // Set when the database couldn't be reached and fallback data is shown.
  loadError: string | null;
};

function getFallbackPlayerForSlug(slug: string, loadError: string | null): PlayerForSlug {
  return {
    player: findPlayerBySlug(localPlayers, slug) ?? null,
    slugIndex: localPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      nbaId: player.nbaId ?? null,
    })),
    loadError,
  };
}

// Resolves /players/{slug} (clean slug, slug-{nbaId}, or encoded name) to one player.
// Wrapped in React cache so the page and generateMetadata share one lookup per request.
export const getPlayerForSlug = cache(async (slug: string): Promise<PlayerForSlug> => {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return getFallbackPlayerForSlug(slug, null);
  }

  try {
    const slugIndex = await getCachedPlayerSlugIndex();
    const entry = findPlayerBySlug(slugIndex, slug);

    return {
      player: entry ? await getCachedPlayerProfile(entry.id, entry.nbaId) : null,
      slugIndex,
      loadError: null,
    };
  } catch (error) {
    console.error("Failed to load player profile", error);

    return getFallbackPlayerForSlug(slug, "Could not load player database.");
  }
});
