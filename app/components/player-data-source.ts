import { unstable_cache } from "next/cache";
import { players as localPlayers, type Player } from "./court-data";
import {
  getMaxTeamGamesBySeasonFromSupabase,
  getMaxTeamGamesFromSupabase,
  getPlayersFromSupabasePageWithFallback,
  getSeasonStatRowsForPlayers,
} from "./supabase-players";
import { createPeakContext, withTwoSeasonPeak } from "../lib/player-peak";
import {
  filterCurrentSeasonPlayers,
  getCurrentRankingMinGames,
  getLatestSeasonLabel,
  getLatestSeasonStartYear,
} from "../lib/player-season";
import {
  buildPlayerShareCardSources,
  type PlayerShareCardMode,
} from "../lib/player-share-card";

const APP_PLAYER_CACHE_PAGE_SIZE = 500;

// Most games any team played in each season, for the peak's qualifying-season rule.
const getCachedMaxTeamGamesBySeason = unstable_cache(
  async () => getMaxTeamGamesBySeasonFromSupabase(),
  ["statcourt-max-team-games-by-season-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

// Each player's peak is the two-season peak from app/lib/player-peak.ts, computed from
// their season rows (the stored "3-Year Peak" profile is replaced). If the season data
// can't load, this throws so a page without correct peaks is never cached.
async function applyTwoSeasonPeaks(players: Player[]) {
  if (players.length === 0) return players;

  const [maxTeamGames, rowsByPlayerId] = await Promise.all([
    getCachedMaxTeamGamesBySeason(),
    getSeasonStatRowsForPlayers(players.map((player) => player.id)),
  ]);
  const context = createPeakContext(maxTeamGames);

  return players.map((player) =>
    withTwoSeasonPeak(player, rowsByPlayerId.get(player.id) ?? [], context),
  );
}

const getCachedSupabasePlayerPage = unstable_cache(
  async (page: number, limit: number) => {
    const result = await getPlayersFromSupabasePageWithFallback(page, limit);

    // Built-in fallback players (Supabase unavailable) have no season rows.
    if (result.players === localPlayers) return result;

    return { ...result, players: await applyTwoSeasonPeaks(result.players) };
  },
  ["statcourt-public-players-v4"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

export async function getAppPlayerPage(page: number, limit: number) {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    const start = (page - 1) * limit;

    return {
      players: localPlayers.slice(start, start + limit),
      total: localPlayers.length,
      hasMore: start + limit < localPlayers.length,
    };
  }

  const result = await getCachedSupabasePlayerPage(page, limit);

  return {
    players: result.players,
    total: null,
    hasMore: result.hasMore,
  };
}

export async function getAppPlayers() {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return localPlayers;
  }

  const players: Player[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getAppPlayerPage(page, APP_PLAYER_CACHE_PAGE_SIZE);

    players.push(...result.players);
    hasMore = result.hasMore;

    if (result.players.length === 0) {
      break;
    }

    page += 1;
  }

  return players;
}

// Players whose latest season is the newest one in the data, for Current-mode
// rankings. Separate cache key from the all-players pages, so a cached mixed list of
// active and retired players can never be served for this scope.
// Current Season ranking rules from the data: the newest season, the most games any
// team has played in it, and the resulting minimum games to be ranked.
export const getAppCurrentSeasonRules = unstable_cache(
  async () => {
    const players = await getAppPlayers();
    const seasonLabel = getLatestSeasonLabel(players);
    const maxTeamGames = seasonLabel
      ? await getMaxTeamGamesFromSupabase(seasonLabel)
      : null;

    return {
      seasonLabel,
      maxTeamGames,
      minGames: getCurrentRankingMinGames(
        players,
        getLatestSeasonStartYear(players),
        maxTeamGames,
      ),
    };
  },
  ["statcourt-current-season-rules-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

const getCachedCurrentSeasonPlayers = unstable_cache(
  async () => {
    const [players, rules] = await Promise.all([
      getAppPlayers(),
      getAppCurrentSeasonRules(),
    ]);

    return filterCurrentSeasonPlayers(players, {
      maxTeamGames: rules.maxTeamGames,
    });
  },
  ["statcourt-current-season-players-v5"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

export async function getAppCurrentSeasonPlayerPage(page: number, limit: number) {
  const players = await getCachedCurrentSeasonPlayers();
  const start = (page - 1) * limit;

  return {
    players: players.slice(start, start + limit),
    total: players.length,
    hasMore: start + limit < players.length,
  };
}

// Lightweight name/ID list for canonical player URLs (layout metadata, sitemap).
export const getAppPlayerSlugSources = unstable_cache(
  async () =>
    (await getAppPlayers()).map((player) => ({
      name: player.name,
      nbaId: player.nbaId ?? null,
    })),
  ["statcourt-player-slug-sources-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

// Name, team, position, four stats, overall rating and all-time rank per player for
// one stat mode, so each image request reads a small cached list instead of every
// player's full stats. Cached per mode to keep each entry small.
export const getAppPlayerShareCardSources = unstable_cache(
  async (mode: PlayerShareCardMode = "peak") => {
    const [players, rules] = await Promise.all([
      getAppPlayers(),
      getAppCurrentSeasonRules(),
    ]);

    return buildPlayerShareCardSources(players, mode, {
      maxTeamGames: rules.maxTeamGames,
    });
  },
  ["statcourt-player-share-cards-v6"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);
