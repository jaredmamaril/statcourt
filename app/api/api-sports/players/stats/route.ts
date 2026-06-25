import { NextResponse } from "next/server";
import {
  calculateCareerAverages,
  getCareerStatsFromApiSportsRows,
} from "@/app/components/player-api-mappers";

const API_SPORTS_BASE_URL = "https://v2.nba.api-sports.io";

function getSeasonRange(startSeason: number, endSeason: number) {
  return Array.from(
    { length: endSeason - startSeason + 1 },
    (_, index) => startSeason + index,
  );
}

function validateRequest(startSeason: number, endSeason: number) {
  if (Number.isNaN(startSeason) || Number.isNaN(endSeason)) {
    return "Invalid season range";
  }

  if (endSeason < startSeason) {
    return "End season must be after start season";
  }

  if (endSeason !== startSeason) {
    return "Only test one season at a time for now";
  }

  return null;
}

export async function GET(request: Request) {
  const apiKey = process.env.API_SPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API_SPORTS_KEY" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);

  const playerId = searchParams.get("id") ?? "265";
  const startSeason = Number(searchParams.get("start") ?? "2023");
  const endSeason = Number(searchParams.get("end") ?? "2023");

  const validationError = validateRequest(startSeason, endSeason);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const seasons = getSeasonRange(startSeason, endSeason);

  const seasonResponses = await Promise.all(
    seasons.map(async (season) => {
      const response = await fetch(
        `${API_SPORTS_BASE_URL}/players/statistics?id=${playerId}&season=${season}`,
        {
          headers: {
            "x-apisports-key": apiKey,
          },
        },
      );

      const data = await response.json();

      return data.response;
    }),
  );

  const rows = seasonResponses.flat();
  const totals = getCareerStatsFromApiSportsRows(rows);
  const averages = calculateCareerAverages(totals);

  return NextResponse.json({
    apiSportsId: Number(playerId),
    source: "api-sports",
    seasons,
    stats: {
      games: totals.games,
      ...averages,
    },
  });
}
