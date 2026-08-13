import { NextResponse } from "next/server";
import { getPlayerInsights } from "@/app/components/court-data";
import { getAppPlayers } from "@/app/components/player-data-source";
import { supabase } from "@/app/components/supabase-client";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "@/app/lib/rate-limit";

export type CommunityProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  public_lineup_count: number;
  favorite_player_count: number;
  top_lineup_archetype: string | null;
  top_favorite_archetype: string | null;
  top_strengths: string[];
};

type CommunityBaseProfileRow = Pick<
  CommunityProfileRow,
  "id" | "display_name" | "username" | "avatar_url" | "created_at"
>;

const COMMUNITY_PROFILE_LIMIT = 60;

export const dynamic = "force-dynamic";

function getMostCommonValue(values: (string | null)[]) {
  const counts = new Map<string, number>();

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function getMostCommonValues(values: string[], limit: number) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

async function getCommunityProfiles() {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, display_name, username, avatar_url, created_at")
    .not("username", "is", null)
    .order("created_at", { ascending: false })
    .limit(COMMUNITY_PROFILE_LIMIT);

  if (error) {
    throw error;
  }

  const baseProfiles = ((data ?? []) as CommunityBaseProfileRow[]).filter(
    (profile) => profile.username,
  );
  const profileIds = baseProfiles.map((profile) => profile.id);

  if (profileIds.length === 0) {
    return [];
  }

  const [
    { data: lineupRows, error: lineupError },
    { data: favoriteRows, error: favoriteError },
  ] = await Promise.all([
    supabase
      .from("saved_lineups")
      .select("user_id, archetype, strengths")
      .eq("is_public", true)
      .in("user_id", profileIds),
    supabase
      .from("favorite_players")
      .select("user_id, player_name")
      .in("user_id", profileIds),
  ]);

  if (lineupError || favoriteError) {
    throw lineupError ?? favoriteError;
  }

  const typedFavoriteRows = (favoriteRows ?? []) as {
    user_id: string;
    player_name: string;
  }[];
  const favoritePlayerNames = new Set(
    typedFavoriteRows.map((favorite) => favorite.player_name),
  );
  const favoriteArchetypeByPlayerName = new Map<string, string | null>();

  if (favoritePlayerNames.size > 0) {
    const players = await getAppPlayers();

    players
      .filter((player) => favoritePlayerNames.has(player.name))
      .forEach((player) => {
        favoriteArchetypeByPlayerName.set(
          player.name,
          getPlayerInsights(player, "career").archetype?.label ?? null,
        );
      });
  }

  return baseProfiles.map((profile) => {
    const publicLineups = ((lineupRows ?? []) as {
      user_id: string;
      archetype: string | null;
      strengths: string[] | null;
    }[]).filter((lineup) => lineup.user_id === profile.id);
    const favorites = typedFavoriteRows.filter(
      (favorite) => favorite.user_id === profile.id,
    );
    const topStrengths = getMostCommonValues(
      publicLineups.flatMap((lineup) => lineup.strengths ?? []),
      2,
    );

    return {
      ...profile,
      public_lineup_count: publicLineups.length,
      favorite_player_count: favorites.length,
      top_lineup_archetype: getMostCommonValue(
        publicLineups.map((lineup) => lineup.archetype),
      ),
      top_favorite_archetype: getMostCommonValue(
        favorites.map(
          (favorite) =>
            favoriteArchetypeByPlayerName.get(favorite.player_name) ?? null,
        ),
      ),
      top_strengths: topStrengths,
    };
  });
}

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "community-profiles-api", {
      perMinute: 90,
      perDay: 1_000,
    }),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const profiles = await getCommunityProfiles();

    return NextResponse.json(
      {
        count: profiles.length,
        profiles,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load community profiles", error);

    return NextResponse.json(
      { error: "Could not load community profiles." },
      { status: 500 },
    );
  }
}
