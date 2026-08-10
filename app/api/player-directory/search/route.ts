import { NextResponse } from "next/server";
import { supabase } from "@/app/components/supabase-client";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "@/app/lib/rate-limit";
import { cleanText } from "@/app/lib/input-validation";

function escapeIlikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

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
  const query = cleanText(searchParams.get("q"), 80);

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
    .ilike("name", `%${escapeIlikePattern(query)}%`)
    .limit(20);

  if (error) {
    console.error("Player directory search failed", error);

    return NextResponse.json(
      { error: "Could not search player directory." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    players: data,
  });
}
