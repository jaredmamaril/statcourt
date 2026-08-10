import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanMetadata, cleanPath, cleanText } from "@/app/lib/input-validation";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";

export const runtime = "nodejs";

const USER_ACTIVITY_LIMIT = 20;
const MAX_ACTIVITY_LABEL_LENGTH = 120;
const MAX_ACTIVITY_HREF_LENGTH = 300;
const ALLOWED_ACTIVITY_TYPES = new Set([
  "view_player",
  "view_lineup",
  "save_lineup",
  "delete_lineup",
  "scout_lineup",
  "compare_players",
  "search",
  "favorite_player",
  "unfavorite_player",
]);

type ActivityRequestBody = {
  activityType?: string;
  label?: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Activity tracking is not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to track activity." },
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

async function checkActivityRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "activity-api", {
      perHour: 240,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "activity-api", {
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

  const rateLimitResponse = await checkActivityRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  let body: ActivityRequestBody = {};

  try {
    body = (await request.json()) as ActivityRequestBody;
  } catch {
    body = {};
  }

  const activityType = cleanText(body.activityType, 40);
  const label = cleanText(body.label, MAX_ACTIVITY_LABEL_LENGTH);
  const href = cleanPath(body.href, MAX_ACTIVITY_HREF_LENGTH);
  const metadata = cleanMetadata(body.metadata);

  if (!ALLOWED_ACTIVITY_TYPES.has(activityType) || !label) {
    return Response.json(
      { error: "Invalid activity." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("user_activity").insert({
    user_id: context.user.id,
    activity_type: activityType,
    label,
    href,
    metadata,
  });

  if (error) {
    return Response.json(
      { error: "Could not log activity." },
      { status: 500 },
    );
  }

  const { data: activityRows } = await context.adminClient
    .from("user_activity")
    .select("id")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false })
    .range(USER_ACTIVITY_LIMIT, USER_ACTIVITY_LIMIT + 99);

  const oldActivityIds = (activityRows ?? []).map((row) => row.id);

  if (oldActivityIds.length > 0) {
    await context.adminClient
      .from("user_activity")
      .delete()
      .in("id", oldActivityIds);
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const clearRateLimit = await checkRateLimit(
    createUserRateLimitRules(context.user.id, "activity-clear-api", {
      perHour: 10,
      perDay: 30,
    }),
  );

  if (!clearRateLimit.allowed) {
    return createRateLimitResponse(clearRateLimit);
  }

  const { error } = await context.adminClient
    .from("user_activity")
    .delete()
    .eq("user_id", context.user.id);

  if (error) {
    return Response.json(
      { error: "Could not clear recent activity." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
