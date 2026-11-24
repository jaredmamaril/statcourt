import { unstable_cache } from "next/cache";
import { players as localPlayers, type Player } from "./court-data";
import {
  getMaxTeamGamesFromSupabase,
  getPlayersFromSupabasePageWithFallback,
} from "./supabase-players";
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

const getCachedSupabasePlayerPage = unstable_cache(
  async (page: number, limit: number) =>
    getPlayersFromSupabasePageWithFallback(page, limit),
  ["statcourt-public-players-v3"],
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
  ["statcourt-current-season-players-v4"],
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
  ["statcourt-player-share-cards-v5"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);
