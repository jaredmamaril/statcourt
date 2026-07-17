"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import { logUserActivity } from "../user-activity";
import {
  getSavedFavoritePlayers,
  saveFavoritePlayers,
} from "./player-storage";

type FavoritePlayerRow = {
  player_name: string;
};

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

          setFavorites(getSavedFavoritePlayers());
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
        saveFavoritePlayers(nextFavorites);
        return;
      }

      const { error } = wasFavorite
        ? await supabase
            .from("favorite_players")
            .delete()
            .eq("player_name", playerName)
        : await supabase.from("favorite_players").upsert(
            {
              user_id: user.id,
              player_name: playerName,
            },
            { onConflict: "user_id,player_name" },
          );

      if (!error) {
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
      }

      console.error("Failed to update favorite player", error);
      setFavorites(favorites);
      return;
    },
    [favorites, user],
  );

  return {
    favorites,
    isLoadingFavorites,
    toggleFavorite,
  };
}
