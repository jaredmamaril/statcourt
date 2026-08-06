"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import { logUserActivity } from "../user-activity";
import {
  addRecentPlayer,
  getSavedRecentPlayers,
  saveRecentPlayers,
} from "./player-storage";

type RecentPlayerRow = {
  player_name: string;
};

async function updateRecentPlayer(playerName: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sign in again to update recent players.");
  }

  const response = await fetch("/api/recent-players", {
    method: "POST",
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
    throw new Error(result.error ?? "Could not update recent players.");
  }
}

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

      try {
        await updateRecentPlayer(playerName);
      } catch (error) {
        console.error("Failed to update recent players", error);
        setRecentPlayers(recentPlayers);
        saveRecentPlayers(recentPlayers);
      }
    },
    [recentPlayers, user],
  );

  const addViewedPlayerWithActivity = useCallback(
    async (playerName: string) => {
      await addViewedPlayer(playerName);

      await logUserActivity({
        user,
        activityType: "view_player",
        label: `Viewed ${playerName}`,
        href: `/players/${encodeURIComponent(playerName)}`,
        metadata: {
          playerName,
        },
      });
    },
    [addViewedPlayer, user],
  );

  return {
    recentPlayers,
    isLoadingRecentPlayers,
    addViewedPlayer: addViewedPlayerWithActivity,
  };
}
