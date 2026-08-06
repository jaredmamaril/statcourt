"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import { logUserActivity } from "../user-activity";

type FavoritePlayerRow = {
  player_name: string;
};

async function updateFavoritePlayer(playerName: string, wasFavorite: boolean) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sign in again to update favorites.");
  }

  const response = await fetch("/api/favorites", {
    method: wasFavorite ? "DELETE" : "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerName,
    }),
  });
  const result = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error ?? "Could not update favorite.");
  }
}

export function useFavoritePlayers(user: User | null) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadFavorites() {
      setIsLoadingFavorites(true);

      if (!user) {
        const frameId = requestAnimationFrame(() => {
          if (!isActive) return;

          setFavorites([]);
          setIsLoadingFavorites(false);
        });

        return () => cancelAnimationFrame(frameId);
      }

      const { data, error } = await supabase
        .from("favorite_players")
        .select("player_name")
        .order("created_at", { ascending: false });

      if (!isActive) return;

      if (error) {
        console.error("Failed to load favorite players", error);
        setFavorites([]);
        setIsLoadingFavorites(false);
        return;
      }

      setFavorites(
        ((data ?? []) as FavoritePlayerRow[]).map((row) => row.player_name),
      );
      setIsLoadingFavorites(false);
    }

    const cleanupPromise = loadFavorites();

    return () => {
      isActive = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [user]);

  const toggleFavorite = useCallback(
    async (playerName: string) => {
      const wasFavorite = favorites.includes(playerName);
      const nextFavorites = wasFavorite
        ? favorites.filter((name) => name !== playerName)
        : [playerName, ...favorites];

      setFavorites(nextFavorites);

      if (!user) {
        return;
      }

      try {
        await updateFavoritePlayer(playerName, wasFavorite);

        await logUserActivity({
          user,
          activityType: wasFavorite ? "unfavorite_player" : "favorite_player",
          label: `${wasFavorite ? "Removed" : "Favorited"} ${playerName}`,
          href: `/players/${encodeURIComponent(playerName)}`,
          metadata: {
            playerName,
          },
        });

        return;
      } catch (error) {
        console.error("Failed to update favorite player", error);
        setFavorites(favorites);
      }
    },
    [favorites, user],
  );

  return {
    favorites,
    isLoadingFavorites,
    toggleFavorite,
  };
}
