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

type FavoriteRequestBody = {
  playerName?: string;
};

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Favorites are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to update favorites." },
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

async function getPlayerName(request: Request) {
  let body: FavoriteRequestBody = {};

  try {
    body = (await request.json()) as FavoriteRequestBody;
  } catch {
    body = {};
  }

  return cleanPlayerName(body.playerName);
}

async function checkFavoriteRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "favorite-player-api", {
      perHour: 240,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "favorite-player-api", {
      perHour: 120,
      perDay: 500,
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

  const rateLimitResponse = await checkFavoriteRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const playerName = await getPlayerName(request);

  if (!playerName) {
    return Response.json(
      { error: "Choose a player to favorite." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("favorite_players").upsert(
    {
      user_id: context.user.id,
      player_name: playerName,
    },
    { onConflict: "user_id,player_name" },
  );

  if (error) {
    return Response.json(
      { error: "Could not update favorite." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkFavoriteRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const playerName = await getPlayerName(request);

  if (!playerName) {
    return Response.json(
      { error: "Choose a player to unfavorite." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient
    .from("favorite_players")
    .delete()
    .eq("user_id", context.user.id)
    .eq("player_name", playerName);

  if (error) {
    return Response.json(
      { error: "Could not update favorite." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
