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
let cachedPlayerProfileLookups: PlayerProfileLookup[] | null = null;
let pendingPlayerProfileLookupsRequest: Promise<PlayerProfileLookup[]> | null =
  null;

const PLAYER_API_PAGE_SIZE = 500;

async function fetchPlayerApiPages<T>(path: string) {
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
