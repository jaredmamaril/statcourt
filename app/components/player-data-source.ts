import { unstable_cache } from "next/cache";
import { players as localPlayers } from "./court-data";
import { getPlayersFromSupabaseWithFallback } from "./supabase-players";

const getCachedSupabasePlayers = unstable_cache(
  async () => getPlayersFromSupabaseWithFallback(),
  ["statcourt-public-players-v1"],
  {
    revalidate: 3600,
    tags: ["statcourt-public-players"],
  },
);

export async function getAppPlayers() {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_PLAYERS !== "true") {
    return localPlayers;
  }

  return getCachedSupabasePlayers();
}
