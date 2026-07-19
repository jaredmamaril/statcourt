import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedLineup } from "../shared/lineup-types";
import { getSavedLineups, saveSavedLineups } from "./lineup-storage";
import { supabase } from "../../supabase-client";
import { useAuthUser } from "../../../lib/use-auth-user";

type SavedLineupRow = {
  id: string;
  name: string;
  stat_profile: SavedLineup["statProfile"];
  players: SavedLineup["players"];
  overall: number;
  summary: string;
  tier: string;
  archetype: string;
  team_identity: string;
  strengths: string[];
  weaknesses: string[];
  tradeoff: string;
  grades: SavedLineup["grades"];
  scores: SavedLineup["scores"];
  x_factor_name: string;
  x_factor_description: string;
  similar_to: string;
  similar_to_description: string;
  similar_lineup_matches: SavedLineup["similarLineupMatches"];
  court_balance: string;
  court_balance_description: string;
  is_public: boolean;
  badges: string[];
  created_at: string;
};

function rowToSavedLineup(row: SavedLineupRow): SavedLineup {
  return {
    id: row.id,
    name: row.name,
    statProfile: row.stat_profile ?? "career",
    players: row.players,
    overall: row.overall,
    summary: row.summary,
    tier: row.tier,
    archetype: row.archetype,
    teamIdentity: row.team_identity,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    tradeoff: row.tradeoff,
    grades: row.grades,
    scores: row.scores,
    xFactorName: row.x_factor_name,
    xFactorDescription: row.x_factor_description,
    similarTo: row.similar_to,
    similarToDescription: row.similar_to_description,
    similarLineupMatches: row.similar_lineup_matches ?? [],
    courtBalance: row.court_balance ?? "",
    courtBalanceDescription: row.court_balance_description ?? "",
    createdAt: row.created_at,
    isPublic: row.is_public ?? false,
    badges: row.badges ?? [],
  };
}

function savedLineupToRow(lineup: SavedLineup, userId: string) {
  return {
    id: lineup.id,
    user_id: userId,
    name: lineup.name,
    stat_profile: lineup.statProfile,
    players: lineup.players,
    overall: lineup.overall,
    summary: lineup.summary,
    tier: lineup.tier,
    archetype: lineup.archetype,
    team_identity: lineup.teamIdentity,
    strengths: lineup.strengths,
    weaknesses: lineup.weaknesses,
    tradeoff: lineup.tradeoff,
    grades: lineup.grades,
    scores: lineup.scores,
    x_factor_name: lineup.xFactorName,
    x_factor_description: lineup.xFactorDescription,
    similar_to: lineup.similarTo,
    similar_to_description: lineup.similarToDescription,
    similar_lineup_matches: lineup.similarLineupMatches,
    court_balance: lineup.courtBalance,
    court_balance_description: lineup.courtBalanceDescription,
    is_public: lineup.isPublic,
    badges: lineup.badges,
    created_at: lineup.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export function useSavedLineups() {
  const { user, isLoadingUser } = useAuthUser();
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);
  const [isLoadingSavedLineups, setIsLoadingSavedLineups] = useState(true);
  const savedLineupsRef = useRef<SavedLineup[]>([]);

  function setLineups(nextLineups: SavedLineup[]) {
    savedLineupsRef.current = nextLineups;
    setSavedLineups(nextLineups);
  }

  useEffect(() => {
    if (isLoadingUser) return;

    if (!user) {
      const frameId = requestAnimationFrame(() => {
        const localLineups = getSavedLineups();

        setLineups(localLineups);
        setIsLoadingSavedLineups(false);
      });

      return () => cancelAnimationFrame(frameId);
    }

    let isMounted = true;

    async function loadSavedLineups() {
      setIsLoadingSavedLineups(true);

      const { data, error } = await supabase
        .from("saved_lineups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load saved lineups", error);
        setLineups([]);
        setIsLoadingSavedLineups(false);
        return;
      }

      setLineups(((data ?? []) as SavedLineupRow[]).map(rowToSavedLineup));
      setIsLoadingSavedLineups(false);
    }

    loadSavedLineups();

    return () => {
      isMounted = false;
    };
  }, [isLoadingUser, user]);

  const updateSavedLineups = useCallback(
    (nextLineups: SavedLineup[]) => {
      const previousLineups = savedLineupsRef.current;

      setLineups(nextLineups);

      if (!user) {
        saveSavedLineups(nextLineups);
        return;
      }

      const currentUser = user;

      const nextLineupIds = new Set(nextLineups.map((lineup) => lineup.id));
      const deletedLineupIds = previousLineups
        .filter((lineup) => !nextLineupIds.has(lineup.id))
        .map((lineup) => lineup.id);

      async function syncSavedLineups() {
        if (deletedLineupIds.length > 0) {
          const { error } = await supabase
            .from("saved_lineups")
            .delete()
            .in("id", deletedLineupIds);

          if (error) {
            console.error("Failed to delete saved lineups", error);
          }
        }

        if (nextLineups.length === 0) return;

        const { error } = await supabase.from("saved_lineups").upsert(
          nextLineups.map((lineup) => savedLineupToRow(lineup, currentUser.id)),
          {
            onConflict: "id",
          },
        );

        if (error) {
          console.error("Failed to save lineups", error);
        }
      }

      syncSavedLineups();
    },
    [user],
  );

  return {
    savedLineups,
    isLoadingSavedLineups,
    updateSavedLineups,
  };
}
