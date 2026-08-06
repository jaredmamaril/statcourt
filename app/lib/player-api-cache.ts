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

export async function getCachedApiPlayers() {
  if (cachedPlayers) {
    return cachedPlayers;
  }

  if (pendingPlayersRequest) {
    return pendingPlayersRequest;
  }

  pendingPlayersRequest = fetch("/api/players")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to load players");
      }

      const data = (await response.json()) as {
        players?: Player[];
      };
      const players = data.players ?? [];

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

  pendingPlayerProfileLookupsRequest = fetch("/api/players?view=profile-lookup")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to load player profile lookups");
      }

      const data = (await response.json()) as {
        players?: PlayerProfileLookup[];
      };
      const players = data.players ?? [];

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
