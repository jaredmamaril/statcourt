import { NextResponse } from "next/server";
import { getAppPlayers } from "@/app/components/player-data-source";

export async function GET() {
  const players = await getAppPlayers();

  return NextResponse.json({
    count: players.length,
    players,
  });
}
