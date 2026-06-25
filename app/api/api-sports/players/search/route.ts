import { NextResponse } from "next/server";

const API_SPORTS_BASE_URL = "https://v2.nba.api-sports.io";

export async function GET(request: Request) {
  const apiKey = process.env.API_SPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API_SPORTS_KEY" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing player name" }, { status: 400 });
  }

  const response = await fetch(
    `${API_SPORTS_BASE_URL}/players?search=${name}`,
    {
      headers: {
        "x-apisports-key": apiKey,
      },
    },
  );

  const data = await response.json();

  return NextResponse.json(data);
}
