import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanPlayerName } from "@/app/lib/input-validation";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";

export const runtime = "nodejs";

const RECENT_PLAYER_LIMIT = 20;

type RecentPlayerRequestBody = {
  playerName?: string;
};

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Recent players are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to update recent players." },
        { status: 401 },
      ),
    };
  }

  const userClient = createSupabaseUserClient(config, accessToken);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(accessToken);

  if (userError || !user) {
    return {
      error: Response.json(
        { error: "Could not verify your signed-in account." },
        { status: 401 },
      ),
    };
  }

  const adminClient = createSupabaseAdminClient(config);

  return {
    adminClient,
    user,
  };
}

async function checkRecentPlayerRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "recent-player-api", {
      perHour: 300,
      perDay: 1_200,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "recent-player-api", {
      perHour: 180,
      perDay: 800,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit);
  }

  return null;
}

export async function POST(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkRecentPlayerRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  let body: RecentPlayerRequestBody = {};

  try {
    body = (await request.json()) as RecentPlayerRequestBody;
  } catch {
    body = {};
  }

  const playerName = cleanPlayerName(body.playerName);

  if (!playerName) {
    return Response.json(
      { error: "Choose a player to add to recent players." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("recent_players").upsert(
    {
      user_id: context.user.id,
      player_name: playerName,
      viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,player_name" },
  );

  if (error) {
    return Response.json(
      { error: "Could not update recent players." },
      { status: 500 },
    );
  }

  const { data: recentRows } = await context.adminClient
    .from("recent_players")
    .select("player_name")
    .eq("user_id", context.user.id)
    .order("viewed_at", { ascending: false })
    .range(RECENT_PLAYER_LIMIT, RECENT_PLAYER_LIMIT + 99);

  const oldPlayerNames = (recentRows ?? []).map((row) => row.player_name);

  if (oldPlayerNames.length > 0) {
    await context.adminClient
      .from("recent_players")
      .delete()
      .eq("user_id", context.user.id)
      .in("player_name", oldPlayerNames);
  }

  return Response.json({ ok: true });
}
