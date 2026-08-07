import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
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

export const revalidate = 300;

const getCachedCommunityProfiles = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("public_profiles")
      .select("id, display_name, username, avatar_url, created_at")
      .not("username", "is", null)
      .order("created_at", { ascending: false })
      .limit(COMMUNITY_PROFILE_LIMIT);

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as CommunityProfileRow[]).filter(
      (profile) => profile.username,
    );
  },
  ["statcourt-community-profiles-v2"],
  {
    revalidate: 300,
    tags: ["statcourt-community-profiles"],
  },
);

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

  const profiles = await getCachedCommunityProfiles();

  return NextResponse.json(
    {
      count: profiles.length,
      profiles,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
