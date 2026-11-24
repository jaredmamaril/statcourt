import { unstable_cache } from "next/cache";
import {
  players as localPlayers,
  type Player,
  type PlayerStatProfile,
} from "./court-data";
import {
  getAllSeasonStatRowsByPlayerId,
  getMaxTeamGamesFromSupabase,
  getPlayersFromSupabasePageWithFallback,
  getSupabasePlayerCount,
} from "./supabase-players";
import {
  createPeakContext,
  findTwoSeasonPeak,
  getMaxTeamGamesBySeason,
  withPeakProfile,
} from "../lib/player-peak";
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

// Same as the API's largest page, so the API and the server read the same cached pages.
const APP_PLAYER_CACHE_PAGE_SIZE = 750;

// Players with their stored stat profiles and roster status. Peaks are added from the
// cached peak map (getTwoSeasonPeakMap), so these pages stay cheap to build.
const getCachedSupabasePlayerPage = unstable_cache(
  async (page: number, limit: number) => {
    const result = await getPlayersFromSupabasePageWithFallback(page, limit);

    // Built-in fallback players (Supabase unavailable) have no season data.
    return { ...result, isFallback: result.players === localPlayers };
  },
  ["statcourt-public-players-v5"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

const getCachedPlayerCount = unstable_cache(
  async () => getSupabasePlayerCount(),
  ["statcourt-player-count-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

// Every player page, requested in parallel once the player count is known.
async function getBasePlayers() {
  const count = await getCachedPlayerCount();
  const pageCount = Math.max(1, Math.ceil(count / APP_PLAYER_CACHE_PAGE_SIZE));
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, index) =>
      getCachedSupabasePlayerPage(index + 1, APP_PLAYER_CACHE_PAGE_SIZE),
    ),
  );

  // If players were added since the count was cached, keep reading.
  while (pages.at(-1)?.hasMore) {
    pages.push(
      await getCachedSupabasePlayerPage(pages.length + 1, APP_PLAYER_CACHE_PAGE_SIZE),
    );
  }

  return {
    players: pages.flatMap((page) => page.players),
    isFallback: pages.some((page) => page.isFallback),
  };
}

// Every player's two-season peak (app/lib/player-peak.ts), computed once from all
// season rows and cached for an hour. Player pages, rankings, share cards and OG
// images all read this one result. Stored as [players.id, peak] pairs.
const getCachedTwoSeasonPeaks = unstable_cache(
  async (): Promise<[number, PlayerStatProfile][]> => {
    const [base, seasonData] = await Promise.all([
      getBasePlayers(),
      getAllSeasonStatRowsByPlayerId(),
    ]);

    if (base.isFallback) return [];

    const context = createPeakContext(getMaxTeamGamesBySeason(seasonData.allRows));
    const peaks: [number, PlayerStatProfile][] = [];

    for (const player of base.players) {
      const peak = findTwoSeasonPeak(
        player,
        seasonData.rowsByPlayerId.get(player.id) ?? [],
        context,
      );

      if (peak) peaks.push([player.id, peak]);
    }

    return peaks;
  },
  ["statcourt-two-season-peaks-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

// Concurrent cold requests (e.g. the client's parallel page fetches) share one build
// of the peak map instead of each starting their own.
let pendingPeakMap: Promise<Map<number, PlayerStatProfile>> | null = null;

function getTwoSeasonPeakMap() {
  pendingPeakMap ??= getCachedTwoSeasonPeaks()
    .then((entries) => new Map(entries))
    .finally(() => {
      pendingPeakMap = null;
    });

  return pendingPeakMap;
}

function withPeaks(players: Player[], peakMap: Map<number, PlayerStatProfile>) {
  return players.map((player) =>
    withPeakProfile(player, peakMap.get(player.id) ?? null),
  );
}

export async function getAppPlayerPage(page: number, limit: number) {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    const start = (page - 1) * limit;

    return {
      players: localPlayers.slice(start, start + limit),
      total: localPlayers.length,
      hasMore: start + limit < localPlayers.length,
    };
  }

  // Start the peak map and count while the page loads; they aren't needed for
  // fallback players, so failures are only surfaced when they are.
  const peakMapPromise = getTwoSeasonPeakMap();
  const countPromise = getCachedPlayerCount();

  peakMapPromise.catch(() => {});
  countPromise.catch(() => {});

  const result = await getCachedSupabasePlayerPage(page, limit);

  if (result.isFallback) {
    return { players: result.players, total: null, hasMore: result.hasMore };
  }

  const [peakMap, total] = await Promise.all([peakMapPromise, countPromise]);

  return {
    players: withPeaks(result.players, peakMap),
    total,
    hasMore: result.hasMore,
  };
}

export async function getAppPlayers() {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return localPlayers;
  }

  const peakMapPromise = getTwoSeasonPeakMap();

  peakMapPromise.catch(() => {});

  const base = await getBasePlayers();

  return base.isFallback
    ? base.players
    : withPeaks(base.players, await peakMapPromise);
}

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
