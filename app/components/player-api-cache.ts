import type { Player, PlayerStats } from "./court-data";
import {
  fetchApiSportsStats,
  type ApiSportsStatsResponse,
} from "./player-api-mappers";

type CachedApiSportsStats = {
  apiSportsId: number;
  season: number;
  fetchedAt: string;
  stats: PlayerStats & {
    games: number;
  };
};

const API_SPORTS_STATS_CACHE_KEY = "statcourt-api-sports-stats";

function getCachedApiSportsStats(): CachedApiSportsStats[] {
  if (typeof window === "undefined") return [];

  const savedCache = window.localStorage.getItem(API_SPORTS_STATS_CACHE_KEY);

  if (!savedCache) return [];

  try {
    return JSON.parse(savedCache) as CachedApiSportsStats[];
  } catch {
    return [];
  }
}

function saveCachedApiSportsStats(cache: CachedApiSportsStats[]) {
  window.localStorage.setItem(
    API_SPORTS_STATS_CACHE_KEY,
    JSON.stringify(cache),
  );
}

export async function getCachedOrFetchApiSportsStats(
  player: Player,
  season: number,
): Promise<ApiSportsStatsResponse | null> {
  if (!player.apiSportsId) return null;

  const cachedStats = getCachedApiSportsStats().find(
    (item) => item.apiSportsId === player.apiSportsId && item.season === season,
  );

  if (cachedStats) {
    return {
      apiSportsId: cachedStats.apiSportsId,
      source: "api-sports",
      seasons: [cachedStats.season],
      stats: cachedStats.stats,
    };
  }

  const apiStats = await fetchApiSportsStats(player, season);

  if (!apiStats) return null;

  const nextCache = [
    ...getCachedApiSportsStats(),
    {
      apiSportsId: player.apiSportsId,
      season,
      fetchedAt: new Date().toISOString(),
      stats: apiStats.stats,
    },
  ];

  saveCachedApiSportsStats(nextCache);

  return apiStats;
}
