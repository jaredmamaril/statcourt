import { players as localPlayers } from "./court-data";
import { getPlayersFromSupabaseWithFallback } from "./supabase-players";

export async function getAppPlayers() {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return localPlayers;
  }

  return getPlayersFromSupabaseWithFallback();
}
