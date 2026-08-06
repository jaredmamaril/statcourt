import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";

export const runtime = "nodejs";

type LineupMutationBody = {
  lineups?: Record<string, unknown>[];
  deletedLineupIds?: string[];
};

function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

function cleanLineupIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim().slice(0, 80))
    .slice(0, 50);
}

function cleanLineups(value: unknown, userId: string) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((lineup): lineup is Record<string, unknown> => {
      return Boolean(
        lineup &&
          typeof lineup === "object" &&
          typeof lineup.id === "string" &&
          typeof lineup.name === "string",
      );
    })
    .slice(0, 50)
    .map((lineup) => ({
      ...lineup,
      id: String(lineup.id).slice(0, 80),
      user_id: userId,
      name: String(lineup.name).trim().slice(0, 80),
      updated_at: new Date().toISOString(),
    }));
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Saved lineups are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to save lineups." },
        { status: 401 },
      ),
    };
  }

  const userClient = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );

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

  const adminClient = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return {
    adminClient,
    user,
  };
}

async function checkLineupRateLimit(
  request: Request,
  userId: string,
  action: "save" | "delete",
) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, `lineup-${action}-api`, {
      perHour: 80,
      perDay: 200,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, `lineup-${action}-api`, {
      perHour: action === "delete" ? 30 : 40,
      perDay: action === "delete" ? 100 : 120,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit);
  }

  return null;
}

export async function PATCH(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  let body: LineupMutationBody = {};

  try {
    body = (await request.json()) as LineupMutationBody;
  } catch {
    body = {};
  }

  const deletedLineupIds = cleanLineupIds(body.deletedLineupIds);
  const lineups = cleanLineups(body.lineups, context.user.id);

  if (deletedLineupIds.length > 0) {
    const deleteRateLimit = await checkLineupRateLimit(
      request,
      context.user.id,
      "delete",
    );

    if (deleteRateLimit) return deleteRateLimit;
  }

  if (lineups.length > 0) {
    const saveRateLimit = await checkLineupRateLimit(
      request,
      context.user.id,
      "save",
    );

    if (saveRateLimit) return saveRateLimit;
  }

  if (deletedLineupIds.length > 0) {
    const { error } = await context.adminClient
      .from("saved_lineups")
      .delete()
      .eq("user_id", context.user.id)
      .in("id", deletedLineupIds);

    if (error) {
      return Response.json(
        { error: "Could not delete saved lineups." },
        { status: 500 },
      );
    }
  }

  if (lineups.length > 0) {
    const { error } = await context.adminClient
      .from("saved_lineups")
      .upsert(lineups, {
        onConflict: "id",
      });

    if (error) {
      return Response.json(
        { error: "Could not save lineups." },
        { status: 500 },
      );
    }
  }

  return Response.json({ ok: true });
}
