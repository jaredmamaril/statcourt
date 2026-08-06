import { NextResponse } from "next/server";
import { supabase } from "@/app/components/supabase-client";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "@/app/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "player-directory-search-api", {
      perMinute: 30,
      perDay: 300,
    }),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({
      players: [],
    });
  }

  const { data, error } = await supabase
    .from("player_directory")
    .select(
      "nba_id, name, from_year, to_year, roster_status, team, player_code",
    )
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    players: data,
  });
}
