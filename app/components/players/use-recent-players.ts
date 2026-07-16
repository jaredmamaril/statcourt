"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import {
  addRecentPlayer,
  getSavedRecentPlayers,
  saveRecentPlayers,
} from "./player-storage";

type RecentPlayerRow = {
  player_name: string;
};

export function useRecentPlayers(user: User | null) {
  const [recentPlayers, setRecentPlayers] = useState<string[]>([]);
  const [isLoadingRecentPlayers, setIsLoadingRecentPlayers] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadRecentPlayers() {
      setIsLoadingRecentPlayers(true);

      if (!user) {
        const frameId = requestAnimationFrame(() => {
          if (!isActive) return;

          setRecentPlayers(getSavedRecentPlayers());
          setIsLoadingRecentPlayers(false);
        });

        return () => cancelAnimationFrame(frameId);
      }

      const { data, error } = await supabase
        .from("recent_players")
        .select("player_name")
        .order("viewed_at", { ascending: false })
        .limit(6);

      if (!isActive) return;

      if (error) {
        console.error("Failed to load recent players", error);
        setRecentPlayers(getSavedRecentPlayers());
        setIsLoadingRecentPlayers(false);
        return;
      }

      const nextRecentPlayers = ((data ?? []) as RecentPlayerRow[]).map(
        (row) => row.player_name,
      );

      setRecentPlayers(nextRecentPlayers);
      saveRecentPlayers(nextRecentPlayers);
      setIsLoadingRecentPlayers(false);
    }

    const cleanupPromise = loadRecentPlayers();

    return () => {
      isActive = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [user]);

  const addViewedPlayer = useCallback(
    async (playerName: string) => {
      const nextRecentPlayers = addRecentPlayer(recentPlayers, playerName);

      setRecentPlayers(nextRecentPlayers);
      saveRecentPlayers(nextRecentPlayers);

      if (!user) return;

      const { error } = await supabase.from("recent_players").upsert(
        {
          user_id: user.id,
          player_name: playerName,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,player_name" },
      );

      if (!error) return;

      console.error("Failed to update recent players", error);
      setRecentPlayers(recentPlayers);
      saveRecentPlayers(recentPlayers);
    },
    [recentPlayers, user],
  );

  return { recentPlayers, isLoadingRecentPlayers, addViewedPlayer };
}
