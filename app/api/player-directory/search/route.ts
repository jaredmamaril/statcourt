import { NextResponse } from "next/server";
import { supabase } from "@/app/components/supabase-client";

export async function GET(request: Request) {
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
