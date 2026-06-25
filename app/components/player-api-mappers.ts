import type { ApiPosition, Player } from "./court-data";

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

export function calculateCareerAverages(careerStats: ApiCareerStats) {
  return {
    ppg: divideOrZero(careerStats.points, careerStats.games),
    rpg: divideOrZero(careerStats.rebounds, careerStats.games),
    apg: divideOrZero(careerStats.assists, careerStats.games),
    fgPercent:
      divideOrZero(
        careerStats.fieldGoalsMade,
        careerStats.fieldGoalsAttempted,
      ) * 100,
    threePercent:
      divideOrZero(
        careerStats.threePointersMade,
        careerStats.threePointersAttempted,
      ) * 100,
    ftPercent:
      divideOrZero(
        careerStats.freeThrowsMade,
        careerStats.freeThrowsAttempted,
      ) * 100,
  };
}

function mapApiSportsStatPosition(pos?: string): Player["position"] {
  if (
    pos === "PG" ||
    pos === "SG" ||
    pos === "SF" ||
    pos === "PF" ||
    pos === "C"
  ) {
    return pos;
  }

  return "SF";
}
