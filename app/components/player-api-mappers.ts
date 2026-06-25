import type { ApiPosition, Player, PlayerStats } from "./court-data";

type ApiSportsPlayer = {
  id: number;
  firstname: string;
  lastname: string;
  leagues?: {
    standard?: {
      jersey?: number;
      active?: boolean;
      pos?: string;
    };
  };
};
type ApiSportsPlayerStatistic = {
  points?: number;
  pos?: string;
  totReb?: number;
  assists?: number;
  fgm?: number;
  fga?: number;
  tpm?: number;
  tpa?: number;
  ftm?: number;
  fta?: number;
};

export type ApiCareerStats = {
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
};

function getApiSportsPosition(pos?: string): ApiPosition | undefined {
  if (pos === "G" || pos === "F" || pos === "C") {
    return pos;
  }

  return undefined;
}

function mapApiSportsPosition(
  pos: string | undefined,
  fallbackPosition: Player["position"] = "SF",
): Player["position"] {
  if (pos === "G") return fallbackPosition === "SG" ? "SG" : "PG";
  if (pos === "F") return fallbackPosition === "PF" ? "PF" : "SF";
  if (pos === "C") return "C";

  return fallbackPosition;
}

export function getCareerStatsFromApiSportsRows(
  rows: ApiSportsPlayerStatistic[],
): ApiCareerStats {
  return rows.reduce<ApiCareerStats>(
    (totals, row) => ({
      games: totals.games + 1,
      points: totals.points + (row.points ?? 0),
      rebounds: totals.rebounds + (row.totReb ?? 0),
      assists: totals.assists + (row.assists ?? 0),
      fieldGoalsMade: totals.fieldGoalsMade + (row.fgm ?? 0),
      fieldGoalsAttempted: totals.fieldGoalsAttempted + (row.fga ?? 0),
      threePointersMade: totals.threePointersMade + (row.tpm ?? 0),
      threePointersAttempted: totals.threePointersAttempted + (row.tpa ?? 0),
      freeThrowsMade: totals.freeThrowsMade + (row.ftm ?? 0),
      freeThrowsAttempted: totals.freeThrowsAttempted + (row.fta ?? 0),
    }),
    {
      games: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
    },
  );
}

export function mapApiSportsPlayerToStatCourtPlayer(
  apiPlayer: ApiSportsPlayer,
): Player {
  return {
    id: apiPlayer.id,
    apiSportsId: apiPlayer.id,
    name: `${apiPlayer.firstname} ${apiPlayer.lastname}`,
    team: "LAL",
    apiPosition: getApiSportsPosition(apiPlayer.leagues?.standard?.pos),
    position: mapApiSportsPosition(apiPlayer.leagues?.standard?.pos),
    jerseyNumber: apiPlayer.leagues?.standard?.jersey ?? 0,
    ratings: {
      defense: 70,
      starPower: 70,
    },
    stats: {
      ppg: 0,
      rpg: 0,
      apg: 0,
      fgPercent: 0,
      threePercent: 0,
      ftPercent: 0,
    },
  };
}

function divideOrZero(numerator: number, denominator: number) {
  if (denominator === 0) return 0;

  return numerator / denominator;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateCareerAverages(careerStats: ApiCareerStats) {
  return {
    ppg: roundOne(divideOrZero(careerStats.points, careerStats.games)),
    rpg: roundOne(divideOrZero(careerStats.rebounds, careerStats.games)),
    apg: roundOne(divideOrZero(careerStats.assists, careerStats.games)),
    fgPercent: roundOne(
      divideOrZero(
        careerStats.fieldGoalsMade,
        careerStats.fieldGoalsAttempted,
      ) * 100,
    ),
    threePercent: roundOne(
      divideOrZero(
        careerStats.threePointersMade,
        careerStats.threePointersAttempted,
      ) * 100,
    ),
    ftPercent: roundOne(
      divideOrZero(
        careerStats.freeThrowsMade,
        careerStats.freeThrowsAttempted,
      ) * 100,
    ),
  };
}

export function getApiSportsStatsRoute(player: Player, season: number) {
  if (!player.apiSportsId) return null;

  return `/api/api-sports/players/stats?id=${player.apiSportsId}&start=${season}&end=${season}`;
}

export type ApiSportsStatsResponse = {
  apiSportsId: number;
  source: "api-sports";
  seasons: number[];
  stats: PlayerStats & {
    games: number;
  };
};

export async function fetchApiSportsStats(
  player: Player,
  startSeason: number,
  endSeason = startSeason,
): Promise<ApiSportsStatsResponse | null> {
  if (!player.apiSportsId) return null;

  const route = getApiSportsStatsRoute(player, startSeason);

  if (!route) return null;

  const response = await fetch(route);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function applyApiSportsStatsToPlayer(
  player: Player,
  apiStats: ApiSportsStatsResponse,
): Player {
  return {
    ...player,
    stats: {
      ppg: apiStats.stats.ppg,
      rpg: apiStats.stats.rpg,
      apg: apiStats.stats.apg,
      fgPercent: apiStats.stats.fgPercent,
      threePercent: apiStats.stats.threePercent,
      ftPercent: apiStats.stats.ftPercent,
    },
  };
}

export function getPlayerDataSourceLabel(player: Player) {
  return player.apiSportsId ? "API READY" : "MANUAL";
}
