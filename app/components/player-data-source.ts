import { unstable_cache } from "next/cache";
import { players as localPlayers, type Player } from "./court-data";
import { getPlayersFromSupabasePageWithFallback } from "./supabase-players";

const APP_PLAYER_CACHE_PAGE_SIZE = 500;

const getCachedSupabasePlayerPage = unstable_cache(
  async (page: number, limit: number) =>
    getPlayersFromSupabasePageWithFallback(page, limit),
  ["statcourt-public-players-v2"],
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
