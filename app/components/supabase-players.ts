import { supabase } from "./supabase-client";
import { players as fallbackPlayers } from "./court-data";
import type { Player, Position, Team } from "./court-data";
import { normalizeTeamCode } from "./court-data";

export type SupabasePlayerRow = {
  id: number;
  nba_id: number | null;
  name: string;
  team: string;
  fallback_image: string | null;
  position: string;
  secondary_positions: Position[];
  emergency_positions: Position[];
  jersey_number: number;
  ppg: number;
  rpg: number;
  apg: number;
  fg_percent: number;
  three_percent: number;
  ft_percent: number;
  defense_rating: number;
  star_power: number;
  stats_source: string;
  updated_at: string;
  spg: number;
  bpg: number;
  height_inches: number | null;
  weight_pounds: number | null;
  from_year: number | null;
  to_year: number | null;
  api_position: string | null;
};

export async function getSupabasePlayers() {
  const pageSize = 1000;
  let from = 0;
  let allRows: SupabasePlayerRow[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .neq("stats_source", "pending_import")
      .gt("ppg", 0)
      .not("fallback_image", "is", null)
      .order("name", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows = [...allRows, ...(data as SupabasePlayerRow[])];

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allRows;
}

export function mapSupabasePlayerToPlayer(row: SupabasePlayerRow): Player {
  return {
    id: row.id,
    nbaId: row.nba_id ?? undefined,
    name: row.name,
    fallbackImage: row.fallback_image ?? undefined,
    team: row.team as Team,
    position: row.position as Position,
    secondaryPositions: row.secondary_positions ?? [],
    emergencyPositions: row.emergency_positions ?? [],
    jerseyNumber: row.jersey_number,
    ratings: {
      defense: row.defense_rating,
      starPower: row.star_power,
    },
    stats: {
      ppg: row.ppg,
      rpg: row.rpg,
      apg: row.apg,
      spg: row.spg,
      bpg: row.bpg,
      fgPercent: row.fg_percent,
      threePercent: row.three_percent,
      ftPercent: row.ft_percent,
    },
  };
}

export async function getPlayersFromSupabaseWithFallback(): Promise<Player[]> {
  try {
    const rows = await getSupabasePlayers();
    const mappedPlayers = rows.map(mapSupabasePlayerToPlayer);

    return mappedPlayers.length > 0 ? mappedPlayers : fallbackPlayers;
  } catch {
    return fallbackPlayers;
  }
}
