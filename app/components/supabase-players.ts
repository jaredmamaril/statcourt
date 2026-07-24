import { supabase } from "./supabase-client";
import { players as fallbackPlayers } from "./court-data";
import type {
  Player,
  Position,
  Team,
  PlayerStatProfile,
  StatProfileType,
} from "./court-data";

export type SupabasePlayerRow = {
  id: number;
  nba_id: number | null;
  name: string;
  team: string;
  fallback_image: string | null;
  position: string;
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
  career_legacy: number | null;
  games: number | null;
};

export type SupabasePlayerStatProfileRow = {
  player_id: number;
  nba_id: number;
  profile_type: StatProfileType;
  season_label: string | null;
  games: number | null;
  minutes_per_game: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  fg_percent: number | null;
  three_percent: number | null;
  ft_percent: number | null;
  three_made_per_game: number | null;
  three_attempts_per_game: number | null;
  free_throw_attempts_per_game: number | null;
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  }

  return fallback;
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value == null) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  return null;
}

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

export function mapSupabasePlayerToPlayer(
  row: SupabasePlayerRow,
  statProfiles?: Player["statProfiles"],
): Player {
  return {
    id: row.id,
    nbaId: row.nba_id ?? undefined,
    name: row.name,
    heightInches: row.height_inches,
    weightPounds: row.weight_pounds,
    apiPosition: row.api_position,
    fallbackImage: row.fallback_image ?? undefined,
    team: row.team as Team,
    position: row.position as Position,
    jerseyNumber: row.jersey_number,
    ratings: {
      defense: toNumber(row.defense_rating, 70),
      starPower: toNumber(row.star_power, 40),
      careerLegacy: toNumber(row.career_legacy, 30),
    },
    statProfiles,
    stats: {
      games: row.games ?? 0,
      ppg: toNumber(row.ppg),
      rpg: toNumber(row.rpg),
      apg: toNumber(row.apg),
      spg: toNumber(row.spg),
      bpg: toNumber(row.bpg),
      fgPercent: toNumber(row.fg_percent),
      threePercent: toNumber(row.three_percent),
      ftPercent: toNumber(row.ft_percent),
    },
  };
}

function mapSupabaseProfileToPlayerProfile(
  row: SupabasePlayerStatProfileRow,
): PlayerStatProfile {
  return {
    profileType: row.profile_type,
    seasonLabel: row.season_label,
    games: row.games,
    minutesPerGame: toNullableNumber(row.minutes_per_game),
    ppg: toNullableNumber(row.ppg),
    rpg: toNullableNumber(row.rpg),
    apg: toNullableNumber(row.apg),
    spg: toNullableNumber(row.spg),
    bpg: toNullableNumber(row.bpg),
    fgPercent: toNullableNumber(row.fg_percent),
    threePercent: toNullableNumber(row.three_percent),
    ftPercent: toNullableNumber(row.ft_percent),
    threeMadePerGame: toNullableNumber(row.three_made_per_game),
    threeAttemptsPerGame: toNullableNumber(row.three_attempts_per_game),
    freeThrowAttemptsPerGame: toNullableNumber(row.free_throw_attempts_per_game),
  };
}

export async function getPlayersFromSupabaseWithFallback(): Promise<Player[]> {
  try {
    const rows = await getSupabasePlayers();
    const profileMap = await getSupabasePlayerProfiles(rows);

    const mappedPlayers = rows.map((row) =>
      mapSupabasePlayerToPlayer(row, profileMap.get(row.id)),
    );

    return mappedPlayers.length > 0 ? mappedPlayers : fallbackPlayers;
  } catch {
    return fallbackPlayers;
  }
}

async function getSupabasePlayerProfiles(players: SupabasePlayerRow[]) {
  const profilesByPlayerId = new Map<number, Player["statProfiles"]>();

  const playerIds = players.map((player) => player.id);

  if (playerIds.length === 0) {
    return profilesByPlayerId;
  }

  const batchSize = 500;

  for (let start = 0; start < playerIds.length; start += batchSize) {
    const batchIds = playerIds.slice(start, start + batchSize);

    const { data, error } = await supabase
      .from("player_stat_profiles")
      .select(
        "player_id, nba_id, profile_type, season_label, games, minutes_per_game, ppg, rpg, apg, spg, bpg, fg_percent, three_percent, ft_percent, three_made_per_game, three_attempts_per_game, free_throw_attempts_per_game",
      )
      .in("player_id", batchIds);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of (data ?? []) as SupabasePlayerStatProfileRow[]) {
      const currentProfiles = profilesByPlayerId.get(row.player_id) ?? {};

      currentProfiles[row.profile_type] =
        mapSupabaseProfileToPlayerProfile(row);

      profilesByPlayerId.set(row.player_id, currentProfiles);
    }
  }

  const playersMissingProfiles = players.filter(
    (player) =>
      player.nba_id != null && !profilesByPlayerId.has(player.id),
  );

  for (
    let start = 0;
    start < playersMissingProfiles.length;
    start += batchSize
  ) {
    const batchPlayers = playersMissingProfiles.slice(start, start + batchSize);
    const batchNbaIds = batchPlayers
      .map((player) => player.nba_id)
      .filter((nbaId): nbaId is number => nbaId != null);

    if (batchNbaIds.length === 0) {
      continue;
    }

    const { data, error } = await supabase
      .from("player_stat_profiles")
      .select(
        "player_id, nba_id, profile_type, season_label, games, minutes_per_game, ppg, rpg, apg, spg, bpg, fg_percent, three_percent, ft_percent, three_made_per_game, three_attempts_per_game, free_throw_attempts_per_game",
      )
      .in("nba_id", batchNbaIds);

    if (error) {
      throw new Error(error.message);
    }

    const playerIdByNbaId = new Map(
      batchPlayers
        .filter((player) => player.nba_id != null)
        .map((player) => [player.nba_id, player.id]),
    );

    for (const row of (data ?? []) as SupabasePlayerStatProfileRow[]) {
      const playerId = playerIdByNbaId.get(row.nba_id);

      if (playerId == null) {
        continue;
      }

      const currentProfiles = profilesByPlayerId.get(playerId) ?? {};

      currentProfiles[row.profile_type] =
        mapSupabaseProfileToPlayerProfile(row);

      profilesByPlayerId.set(playerId, currentProfiles);
    }
  }

  return profilesByPlayerId;
}
