import { NextResponse } from "next/server";
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
};

const COMMUNITY_PROFILE_LIMIT = 60;

export const dynamic = "force-dynamic";

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

  return ((data ?? []) as CommunityProfileRow[]).filter(
    (profile) => profile.username,
  );
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
