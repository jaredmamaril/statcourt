import { NextResponse } from "next/server";
import { getPlayerInsights } from "@/app/components/court-data";
import { getAppPlayers } from "@/app/components/player-data-source";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "@/app/lib/rate-limit";

export const revalidate = 3600;

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "players-api", {
      perMinute: 120,
      perDay: 2_000,
    }),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  const players = await getAppPlayers();
  const responsePlayers =
    view === "profile-lookup"
      ? players.map((player) => ({
          name: player.name,
          nbaId: player.nbaId ?? null,
          team: player.team,
          position: player.position,
          fallbackImage: player.fallbackImage ?? null,
          archetype: getPlayerInsights(player, "career").archetype,
        }))
      : players;

  return NextResponse.json(
    {
      count: responsePlayers.length,
      players: responsePlayers,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
