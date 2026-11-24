"use client";

import type { Player, PlayerInsightDisplay } from "../components/court-data";

export type PlayerProfileLookup = {
  name: string;
  nbaId: number | null;
  team: string | null;
  position: string | null;
  fallbackImage: string | null;
  archetype: PlayerInsightDisplay | null;
};

let cachedPlayers: Player[] | null = null;
let pendingPlayersRequest: Promise<Player[]> | null = null;
export type CurrentSeasonRules = {
  seasonLabel: string | null;
  maxTeamGames: number | null;
  minGames: number;
};

export type CurrentSeasonPlayers = {
  players: Player[];
  rules: CurrentSeasonRules | null;
};

let cachedCurrentSeasonPlayers: CurrentSeasonPlayers | null = null;
let pendingCurrentSeasonPlayersRequest: Promise<CurrentSeasonPlayers> | null =
  null;
let cachedPlayerProfileLookups: PlayerProfileLookup[] | null = null;
let pendingPlayerProfileLookupsRequest: Promise<PlayerProfileLookup[]> | null =
  null;

// The API's largest page size, so the full list takes the fewest requests.
const PLAYER_API_PAGE_SIZE = 750;

type PlayerApiPage<T> = {
  players?: T[];
  hasMore?: boolean;
  total?: number | null;
};

async function fetchPlayerApiPage<T>(path: string, page: number) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `${path}${separator}page=${page}&limit=${PLAYER_API_PAGE_SIZE}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load players");
  }

  return (await response.json()) as PlayerApiPage<T>;
}

// Loads every page. Page 1 reports the total, so the remaining pages are requested in
// parallel; without a total it falls back to one page at a time.
async function fetchPlayerApiPages<T>(
  path: string,
  onFirstPage?: (data: Record<string, unknown>) => void,
) {
  const firstPage = await fetchPlayerApiPage<T>(path, 1);

  onFirstPage?.(firstPage as Record<string, unknown>);

  const loadedPlayers: T[] = [...(firstPage.players ?? [])];

  if (!firstPage.hasMore) {
    return loadedPlayers;
  }

  let nextPage = 2;

  if (typeof firstPage.total === "number" && firstPage.total > 0) {
    const pageCount = Math.ceil(firstPage.total / PLAYER_API_PAGE_SIZE);
    const restPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        fetchPlayerApiPage<T>(path, index + 2),
      ),
    );

    for (const page of restPages) {
      loadedPlayers.push(...(page.players ?? []));
    }

    if (!restPages.at(-1)?.hasMore) {
      return loadedPlayers;
    }

    nextPage = pageCount + 1;
  }

  // No total (or the list grew since it was counted): keep reading in order.
  for (let page = nextPage; ; page += 1) {
    const data = await fetchPlayerApiPage<T>(path, page);

    loadedPlayers.push(...(data.players ?? []));

    if (!data.hasMore) {
      return loadedPlayers;
    }
  }
}

export async function getCachedApiPlayers() {
  if (cachedPlayers) {
    return cachedPlayers;
  }

  if (pendingPlayersRequest) {
    return pendingPlayersRequest;
  }

  pendingPlayersRequest = fetchPlayerApiPages<Player>("/api/players")
    .then((players) => {
      if (players.length > 0) {
        cachedPlayers = players;
      }

      return players;
    })
    .finally(() => {
      pendingPlayersRequest = null;
    });

  return pendingPlayersRequest;
}

// Players eligible for Current Season rankings, filtered by the API, plus the rule
// it used (newest season and minimum games).
export async function getCachedApiCurrentSeasonPlayers() {
  if (cachedCurrentSeasonPlayers) {
    return cachedCurrentSeasonPlayers;
  }

  if (pendingCurrentSeasonPlayersRequest) {
    return pendingCurrentSeasonPlayersRequest;
  }

  let rules: CurrentSeasonRules | null = null;

  pendingCurrentSeasonPlayersRequest = fetchPlayerApiPages<Player>(
    "/api/players?scope=current-season",
    (data) => {
      rules = (data.currentSeason as CurrentSeasonRules | undefined) ?? null;
    },
  )
    .then((players) => {
      const result = { players, rules };

      if (players.length > 0) {
        cachedCurrentSeasonPlayers = result;
      }

      return result;
    })
    .finally(() => {
      pendingCurrentSeasonPlayersRequest = null;
    });

  return pendingCurrentSeasonPlayersRequest;
}

export async function getCachedApiPlayerProfileLookups() {
  if (cachedPlayerProfileLookups) {
    return cachedPlayerProfileLookups;
  }

  if (pendingPlayerProfileLookupsRequest) {
    return pendingPlayerProfileLookupsRequest;
  }

  pendingPlayerProfileLookupsRequest = fetchPlayerApiPages<PlayerProfileLookup>(
    "/api/players?view=profile-lookup",
  )
    .then((players) => {
      if (players.length > 0) {
        cachedPlayerProfileLookups = players;
      }

      return players;
    })
    .finally(() => {
      pendingPlayerProfileLookupsRequest = null;
    });

  return pendingPlayerProfileLookupsRequest;
}
