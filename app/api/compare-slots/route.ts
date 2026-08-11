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
import { validateRequestOrigin } from "@/app/lib/request-security";

export const runtime = "nodejs";

type CompareSlotsRequestBody = {
  left?: string;
  right?: string;
};

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Compare slots are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to update compare slots." },
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

async function checkCompareSlotRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "compare-slot-api", {
      perHour: 240,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "compare-slot-api", {
      perHour: 120,
      perDay: 500,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit);
  }

  return null;
}

export async function PATCH(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkCompareSlotRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  let body: CompareSlotsRequestBody = {};

  try {
    body = (await request.json()) as CompareSlotsRequestBody;
  } catch {
    body = {};
  }

  const { error } = await context.adminClient
    .from("user_compare_slots")
    .upsert({
      user_id: context.user.id,
      left_player_name: cleanPlayerName(body.left),
      right_player_name: cleanPlayerName(body.right),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return Response.json(
      { error: "Could not update compare slots." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
