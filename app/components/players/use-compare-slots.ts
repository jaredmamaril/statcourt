"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { CompareSlots } from "../court-data";
import { supabase } from "../supabase-client";
import { logUserActivity } from "../user-activity";
import { getSavedCompareSlots, saveCompareSlots } from "./player-storage";

const emptyCompareSlots: CompareSlots = {
  left: "",
  right: "",
};

type CompareSlotsRow = {
  left_player_name: string | null;
  right_player_name: string | null;
};

async function saveCompareSlotsToAccount(nextSlots: CompareSlots) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sign in again to update compare slots.");
  }

  const response = await fetch("/api/compare-slots", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nextSlots),
  });
  const result = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error ?? "Could not update compare slots.");
  }
}

export function useCompareSlots(user: User | null) {
  const [compareSlots, setCompareSlots] =
    useState<CompareSlots>(emptyCompareSlots);
  const [isLoadingCompareSlots, setIsLoadingCompareSlots] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadCompareSlots() {
      setIsLoadingCompareSlots(true);

      if (!user) {
        const frameId = requestAnimationFrame(() => {
          if (!isActive) return;

          setCompareSlots(getSavedCompareSlots());
          setIsLoadingCompareSlots(false);
        });

        return () => cancelAnimationFrame(frameId);
      }

      const { data, error } = await supabase
        .from("user_compare_slots")
        .select("left_player_name, right_player_name")
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.error("Failed to load compare slots", error);
        setCompareSlots(getSavedCompareSlots());
        setIsLoadingCompareSlots(false);
        return;
      }

      const row = data as CompareSlotsRow | null;
      const nextSlots = {
        left: row?.left_player_name ?? "",
        right: row?.right_player_name ?? "",
      };

      setCompareSlots(nextSlots);
      saveCompareSlots(nextSlots);
      setIsLoadingCompareSlots(false);
    }

    const cleanupPromise = loadCompareSlots();

    return () => {
      isActive = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [user]);

  const updateCompareSlots = useCallback(
    async (nextSlots: CompareSlots) => {
      const changedSlot =
        nextSlots.left !== compareSlots.left
          ? "left"
          : nextSlots.right !== compareSlots.right
            ? "right"
            : null;
      const comparedPlayer =
        changedSlot === "left"
          ? nextSlots.left
          : changedSlot === "right"
            ? nextSlots.right
            : "";

      setCompareSlots(nextSlots);
      saveCompareSlots(nextSlots);

      if (!user) return;

      try {
        await saveCompareSlotsToAccount(nextSlots);

        if (comparedPlayer) {
          await logUserActivity({
            user,
            activityType: "compare_players",
            label: `Added ${comparedPlayer} to comparison`,
            href: "/court",
            metadata: {
              slot: changedSlot,
              playerName: comparedPlayer,
            },
          });
        }

        return;
      } catch (error) {
        console.error("Failed to update compare slots", error);
        setCompareSlots(getSavedCompareSlots());
      }
    },
    [compareSlots.left, compareSlots.right, user],
  );

  return { compareSlots, isLoadingCompareSlots, updateCompareSlots };
}
