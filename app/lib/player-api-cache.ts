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

const PLAYER_API_PAGE_SIZE = 500;

async function fetchPlayerApiPages<T>(
  path: string,
  onFirstPage?: (data: Record<string, unknown>) => void,
) {
  const loadedPlayers: T[] = [];
  let page = 1;

  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(
      `${path}${separator}page=${page}&limit=${PLAYER_API_PAGE_SIZE}`,
    );

    if (!response.ok) {
      throw new Error("Failed to load players");
    }

    const data = (await response.json()) as {
      players?: T[];
      hasMore?: boolean;
    };

    if (page === 1) {
      onFirstPage?.(data as Record<string, unknown>);
    }

    loadedPlayers.push(...(data.players ?? []));

    if (!data.hasMore) {
      break;
    }

    page += 1;
  }

  return loadedPlayers;
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
